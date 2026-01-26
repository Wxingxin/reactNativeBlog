下面给你一套在 React Native（Expo）里“封装字体能力”的标准做法：把 `expo-font` 的加载、回退、以及“按设计系统使用字体”的体验，都封装起来，让项目里只需要 `AppText / AppHeading` 这类组件即可。

---

## 1) 安装与准备字体文件

```bash
npx expo install expo-font
```

把字体文件放到类似路径：

```
src/assets/fonts/
  Inter-Regular.ttf
  Inter-Medium.ttf
  Inter-SemiBold.ttf
  Inter-Bold.ttf
```

---

## 2) 封装：字体加载 Provider（AppFontsProvider）

目标：应用启动时统一加载字体；没加载完不渲染业务 UI（避免字体闪烁/布局跳动）。

> 文件：`src/providers/AppFontsProvider.tsx`

```tsx
import React, { createContext, useContext, useMemo } from "react";
import { useFonts } from "expo-font";
import { View, ActivityIndicator } from "react-native";

type FontsContextValue = {
  loaded: boolean;
};

const FontsContext = createContext<FontsContextValue>({ loaded: false });

export function useAppFonts() {
  return useContext(FontsContext);
}

// 你可以把这里当成“字体注册表”
export const APP_FONTS = {
  "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
  "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
} as const;

export function AppFontsProvider({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [loaded] = useFonts(APP_FONTS);

  const value = useMemo(() => ({ loaded }), [loaded]);

  if (!loaded) {
    // 你也可以替换成 Splash、Skeleton 等
    return (
      fallback ?? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      )
    );
  }

  return <FontsContext.Provider value={value}>{children}</FontsContext.Provider>;
}
```

---

## 3) 封装：统一的字体 tokens（fontFamily / weight / size）

目标：不要在业务里写 `"Inter-SemiBold"` 这种字符串；统一走 tokens。

> 文件：`src/theme/typography.ts`

```ts
export const fontFamily = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semibold: "Inter-SemiBold",
  bold: "Inter-Bold",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  "2xl": 28,
} as const;

export const lineHeight = {
  tight: 16,
  normal: 22,
  loose: 26,
} as const;

export type FontFamilyKey = keyof typeof fontFamily;
export type FontSizeKey = keyof typeof fontSize;
```

---

## 4) 封装：AppText（替代原生 Text）

目标：所有文本默认用项目字体；可通过 `variant/weight/size` 控制样式。

> 文件：`src/components/AppText.tsx`

```tsx
import React from "react";
import { Text, TextProps, TextStyle, StyleProp } from "react-native";
import { fontFamily, fontSize, lineHeight, FontFamilyKey, FontSizeKey } from "../theme/typography";

type AppTextProps = TextProps & {
  weight?: FontFamilyKey; // regular/medium/semibold/bold
  size?: FontSizeKey; // xs/sm/md/...
  lh?: keyof typeof lineHeight;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  weight = "regular",
  size = "md",
  lh = "normal",
  color,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fontFamily[weight],
          fontSize: fontSize[size],
          lineHeight: lineHeight[lh],
          color,
        },
        style,
      ]}
    />
  );
}
```

---

## 5) 封装：标题组件（AppHeading）

> 文件：`src/components/AppHeading.tsx`

```tsx
import React from "react";
import { AppText } from "./AppText";

export function AppHeading({
  children,
  level = 1,
  ...rest
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
} & Omit<React.ComponentProps<typeof AppText>, "size" | "weight">) {
  if (level === 1) return <AppText weight="bold" size="2xl" lh="loose" {...rest}>{children}</AppText>;
  if (level === 2) return <AppText weight="semibold" size="xl" lh="loose" {...rest}>{children}</AppText>;
  return <AppText weight="semibold" size="lg" lh="normal" {...rest}>{children}</AppText>;
}
```

---

## 6) 在入口接入 Provider

> `App.tsx` 或 Expo Router 的 `app/_layout.tsx`

### App.tsx 示例

```tsx
import React from "react";
import { AppFontsProvider } from "./src/providers/AppFontsProvider";
import { View } from "react-native";
import { AppHeading } from "./src/components/AppHeading";
import { AppText } from "./src/components/AppText";

export default function App() {
  return (
    <AppFontsProvider>
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <AppHeading level={1}>Hello Fonts</AppHeading>
        <AppText style={{ marginTop: 12 }}>
          业务里不再需要管 useFonts，也不再写 fontFamily 字符串。
        </AppText>
      </View>
    </AppFontsProvider>
  );
}
```

---

## 7) 这套封装能解决什么“项目痛点”

* **避免每个页面重复 `useFonts`**：统一在 Provider 里做一次。
* **避免 fontFamily 到处硬编码**：用 tokens，便于全局替换字体。
* **统一文本风格**：默认 `AppText` 就是“设计系统文字”，减少样式漂移。
* **更容易做多主题/多语言排版**：将来只需要改 `typography.ts`。

---

## 可选增强（你后续可能会用上）

1. **字体回退策略**：Android/iOS 不同字体，按平台切换
2. **按语言切换字体**：中英不同字体栈
3. **集成 SplashScreen**：在字体加载完成前保持启动页（体验更好）
4. **和 Tailwind / NativeWind 配合**：用 className 管布局，用 AppText 管字体

---

如果你用的是 **Expo Router**（`app/_layout.tsx`），我也可以按你的目录结构给你一份“直接可粘贴运行”的版本（含 `_layout.tsx`、`providers/`、`theme/` 的组织方式）。你只要告诉我你目前用的是 `App.tsx` 还是 `Expo Router`。
