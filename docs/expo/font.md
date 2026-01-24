在 React Native 里“字体”确实和浏览器完全不同：Web 用的是 CSS + 系统字体栈；RN 用的是原生系统字体 + 你打包进 App 的自定义字体文件（iOS/Android 各自解析）。下面按“怎么设置”和“怎么使用”给你一套项目里可落地的做法。

---

## 1) RN 字体的核心差异（相对浏览器）

1. **没有“font-family fallback 栈”的可靠机制**

   * Web 可以写 `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", ...;`
   * RN 虽然也有 `fontFamily`，但各平台字体名称、可用字体不同，fallback 行为并不一致，不建议依赖长字体栈。

2. **自定义字体必须随 App 打包（或 Expo 运行时加载）**

   * Web 引用 URL/`@font-face`。
   * RN 要把 `.ttf/.otf` 放进项目资源并在 iOS/Android 注册，或者 Expo 用 `expo-font` 在运行时加载。

3. **字体“家族名/内部 PostScript 名”可能不是文件名**

   * RN 写 `fontFamily: "xxx"`，这个 `"xxx"`通常是字体内部名称，不一定等于 `MyFont.ttf`。

---

## 2) 直接用系统字体（最快、最稳）

### iOS

* 默认就是 **San Francisco（SF）**，一般你不需要写 `fontFamily`，只调 `fontSize / fontWeight` 即可。

### Android

* 默认是 **Roboto**（大多数设备）。
* 也建议默认不写 `fontFamily`，优先用 `fontWeight`、`fontSize`、`lineHeight` 做规范化。

示例（只用系统字体）：

```jsx
<Text style={{ fontSize: 16, fontWeight: "600" }}>标题</Text>
<Text style={{ fontSize: 14, lineHeight: 20 }}>正文内容</Text>
```

---

## 3) 自定义字体（最常见的项目做法）

你分两种情况：**Expo** 和 **React Native CLI**。

### A) Expo（推荐，最省事）

1. 安装：

```bash
npx expo install expo-font
```

2. 放字体文件：

* 比如 `assets/fonts/Inter-Regular.ttf`
* `assets/fonts/Inter-SemiBold.ttf`

3. 在 App 启动时加载并使用（典型写法）：

```jsx
import { useFonts } from "expo-font";
import { Text, View } from "react-native";

export default function App() {
  const [loaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
  });

  if (!loaded) return null;

  return (
    <View>
      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 18 }}>标题</Text>
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 14 }}>正文</Text>
    </View>
  );
}
```

> 项目实践建议：你可以把加载逻辑放到入口（比如 `RootLayout` / `App.tsx`），并配合 SplashScreen，避免字体未加载时的闪烁。

---

### B) React Native CLI（非 Expo）

**Android + iOS 都要做资源注册**，常用方式是 `react-native.config.js` + link（或手工集成）。

1. 放字体文件：

* `./assets/fonts/Inter-Regular.ttf` 等

2. 创建 `react-native.config.js`：

```js
module.exports = {
  assets: ["./assets/fonts/"],
};
```

3. 执行链接命令：

```bash
npx react-native-asset
```

> 若你项目没装该工具，可以使用社区方案或手动集成；很多团队就用 `react-native-asset` 这条链路来完成字体拷贝与注册。

4. iOS 记得：

```bash
cd ios && pod install && cd ..
```

5. 使用方式同 Expo：`fontFamily: "Inter-Regular"`

---

## 4) 在项目里“统一管理字体”（可维护的工程化写法）

建议你不要在每个组件里散写 `fontFamily`，而是做一个 `theme/typography.js`：

```js
// theme/typography.js
import { Platform } from "react-native";

export const Font = {
  regular: Platform.select({ ios: "Inter-Regular", android: "Inter-Regular" }),
  semibold: Platform.select({ ios: "Inter-SemiBold", android: "Inter-SemiBold" }),
};

export const TextStyle = {
  h1: { fontFamily: Font.semibold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: Font.regular, fontSize: 14, lineHeight: 20 },
};
```

用的时候：

```jsx
import { Text } from "react-native";
import { TextStyle } from "./theme/typography";

<Text style={TextStyle.h1}>标题</Text>
<Text style={TextStyle.body}>正文</Text>
```

---

## 5) 常见坑与排查清单（你遇到“手机和浏览器不一样”多半在这里）

1. **Android 的 `fontWeight` 在自定义字体上可能失效**

   * 典型现象：你写了 `fontWeight: "700"` 但不生效。
   * 解决思路：给不同粗细准备不同字体文件，并用不同 `fontFamily`（如 `Inter-Bold`），不要指望 Android 自动合成粗体。

2. **`fontFamily` 写错名字**

   * 你写的要是字体“内部名”，不是文件名。
   * 排查：换成你注册时的 key（Expo useFonts 里那个键名），通常最稳。

3. **iOS 没跑 pod / 没清缓存**

   * 字体不生效时，做一次 `pod install`，并清理构建缓存再跑。

4. **行高与字重导致视觉差异**

   * 同样的 `fontSize`，不同平台默认 `lineHeight`、字形 metrics 不同，视觉会差。
   * 建议：关键字号统一配置 `lineHeight`，而不是只设 `fontSize`。

---

## 6) 你该怎么选（实践建议）

* 如果你想“和 Web 一样统一 UI”：**用自定义字体（Inter / SF Pro 替代方案等）+ 统一 typography**。
* 如果你想“最省事且原生一致”：**用系统字体 + 只管理字号/行高/字重**。

---

如果你告诉我你现在是 **Expo 还是 RN CLI**，以及你想用的字体（比如 JetBrains Mono / Inter / 思源黑体等），我可以给你一套“目录结构 + 字体文件命名规则 + typography 规范 + 示例组件”的完整落地模板。
