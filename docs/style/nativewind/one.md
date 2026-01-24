下面给你一套 **NativeWind v5（配 Expo + Expo Router）** 的“从安装到在 RN 组件里写样式”的完整步骤。整体思路是：**先把工程配置搭好（Tailwind v4 + PostCSS + Metro withNativewind + global.css），再在组件里直接用 `className`**。这是官方 v5 安装与迁移指南的标准流程。([Nativewind][1])

---

## 0) 前置条件（v5 必须满足）

* Tailwind CSS **v4.1+**([Nativewind][2])
* React Native **0.81+**（Expo SDK 54 基本对应）([Nativewind][2])
* Reanimated **v4+**([Nativewind][2])
* `react-native-css` 需要你显式安装（v5 变成 peer dependency）([Nativewind][2])

---

## 1) 安装依赖（Expo 项目）

在项目根目录执行（官方建议用 `expo install`）([Nativewind][1])

```bash
npx expo install nativewind@preview react-native-css react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss @tailwindcss/postcss postcss
```

---

## 2) 创建 `postcss.config.mjs`

项目根目录新建 `postcss.config.mjs`：([Nativewind][1])

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

---

## 3) 创建 `global.css`（v5 推荐写法）

项目根目录新建 `global.css`，按官方推荐用 `@import ...`（比 `@tailwind` 更适配 react-native-web），并引入 `nativewind/theme`：([Nativewind][1])

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
```

---

## 4) 配置 `metro.config.js`（关键步骤）

如果你没有 `metro.config.js`，先生成：([Nativewind][1])

```bash
npx expo customize metro.config.js
```

然后把内容改为（官方 v5 写法：wrap `withNativewind`）：([Nativewind][1])

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

---

## 5) 在“顶层组件文件”导入 `global.css`

v5 要求你在“应用最顶层组件文件”导入 CSS（不要在 `AppRegistry.registerComponent` 的文件里导入，否则影响 Fast Refresh）。([Nativewind][1])

### 你使用 Expo Router 时，推荐放在 `app/_layout.tsx`

`app/_layout.tsx` 顶部加一行：

```tsx
import "../global.css";
```

> 如果你不是 Expo Router，而是传统 `App.tsx` 作为顶层组件，就在 `App.tsx` 导入 `./global.css`。([Nativewind][1])

---

## 6)（强烈建议）固定 lightningcss 版本

官方明确建议在 `package.json` 里 pin `lightningcss`，避免构建时 global.css 反序列化错误：([Nativewind][1])

```json
{
  "overrides": {
    "lightningcss": "1.30.1"
  }
}
```

（pnpm 用 `pnpm.overrides`，yarn/npm 用上述方式即可，按你的包管理器实际支持为准。）

---

## 7) TypeScript（可选但推荐）：让 `className` 有类型

新建 `nativewind-env.d.ts`（名字不要和项目目录冲突，官方有注意事项），内容如下：([Nativewind][1])

```ts
/// <reference types="react-native-css/types" />
```

---

## 8) 运行（清缓存）

首次配置后务必清缓存启动：([Nativewind][3])

```bash
npx expo start --clear
```

---

# 9) v5 在 RN 组件里怎么写样式（你真正关心的部分）

## 9.1 直接在 RN 组件上写 `className`（最常用）

```tsx
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to NativeWind v5
      </Text>

      <Pressable
        className="mt-4 rounded-xl bg-black px-4 py-3"
        onPress={() => router.push("/post/101")}
      >
        <Text className="text-white">Go Detail</Text>
      </Pressable>
    </View>
  );
}
```

这就是官方“Try it out”的典型写法。([Nativewind][1])

---

## 9.2 条件样式（项目里极常见）

```tsx
const isActive = true;

<View className={`rounded-xl px-4 py-2 ${isActive ? "bg-blue-500" : "bg-gray-300"}`} />
```

---

## 9.3 复用组件：合并默认 className（经典封装方式）

v5 官方“自定义组件”建议就是：把默认样式和外部 className 合并。([Nativewind][4])

```tsx
import { Text } from "react-native";

export function AppText({ className = "", ...props }) {
  const base = "text-black dark:text-white";
  return <Text className={`${base} ${className}`} {...props} />;
}
```

---

## 9.4 `styled()`：给第三方/自定义组件加 className 支持（v5 推荐方向）

v5 仍然保留 `styled`，并且引导用 `styled()` 统一替代一些旧 API。([Nativewind][2])

```tsx
import { styled } from "nativewind";
import { View } from "react-native";

const SView = styled(View);

export function Card({ className = "", ...props }) {
  return <SView className={`rounded-2xl bg-white p-4 ${className}`} {...props} />;
}
```

---

## 9.5 重要提醒：v5 底层机制变化（为什么你的写法可能“突然不生效”）

v5 从 “JSX Transform” 改成 “Import Rewrite”（会把 `react-native` 的导入重写到 `react-native-css/react-native`）。所以你如果沿用 v4 的 Babel transform 配置，容易冲突。([Nativewind][2])

---

# 10) 自检清单（你按这 6 条排查，基本能定位 90% 问题）

1. `global.css` 是否存在且内容按官方写？([Nativewind][1])
2. 是否在 `app/_layout.tsx`（或顶层 App）导入了 `global.css`？([Nativewind][1])
3. `metro.config.js` 是否 `withNativewind(config)`？([Nativewind][1])
4. 是否加了 `lightningcss` overrides？([Nativewind][1])
5. 是否 `expo start --clear`？([Nativewind][3])
6. TS 是否加了 `nativewind-env.d.ts`（如果你在 TS 下报类型错）？([Nativewind][1])

---

如果你把你当前项目的这 3 个文件贴出来：

* `metro.config.js`
* `global.css`
* `app/_layout.tsx`（或 `App.tsx`）

我可以逐行帮你对齐到 v5 的正确形态，并指出你项目里哪些地方会导致 “className 不生效”。

[1]: https://www.nativewind.dev/v5/getting-started/installation "Installation"
[2]: https://www.nativewind.dev/v5/guides/migrate-from-v4 "Migrate from v4"
[3]: https://www.nativewind.dev/docs/getting-started/troubleshooting?utm_source=chatgpt.com "Troubleshooting"
[4]: https://www.nativewind.dev/v5/guides/custom-components?utm_source=chatgpt.com "Writing Custom Components"
