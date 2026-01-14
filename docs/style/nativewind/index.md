NativeWind v5 标志着从“JavaScript 配置驱动”转向了 **“CSS 驱动（CSS-First）”** 的模式，这主要归功于它对 Tailwind CSS v4 的深度集成。

以下是 NativeWind v5 在项目安装和配置中的全量知识点整理。

---

## 1. 安装核心依赖

首先，你需要安装 NativeWind 及其配套的 Tailwind 引擎。v5 强烈建议配合 **Expo** 使用，因为它的 Metro 适配器最完善。

```bash
# 安装 nativewind v5 和 tailwindcss v4
npm install nativewind@latest tailwindcss@latest
# 必须安装 reanimated 才能获得最佳动画和性能支持
npm install react-native-reanimated
# 必装的开发依赖
npm install lucide-react-native # 推荐用于图标

```

---

## 2. 三大核心配置步骤

NativeWind v5 的配置主要围绕 **Metro**、**CSS** 和 **Babel** 展开。

### A. 配置 Metro (metro.config.js)

这是 v5 最关键的一步。你需要告诉 Metro 如何处理 `.css` 文件。

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/utils");

const config = getDefaultConfig(__dirname);

// 使用 withNativeWind 包裹配置，并指定入口 CSS 文件
module.exports = withNativeWind(config, { input: "./global.css" });

```

### B. 创建入口 CSS (global.css)

在 v5 中，大部分主题配置不再写在 JS 里，而是写在 CSS 中。

```css
/* global.css */
@import "tailwindcss";

@theme {
  /* 在这里定义你的自定义颜色、间距等 */
  --color-primary: #007AFF;
  --font-size-xl: 20px;
}

@tailwind base;
@tailwind components;
@tailwind utilities;

```

### C. 引入 CSS 文件

在项目的入口文件（通常是 `App.js` 或 Expo Router 的 `_layout.tsx`）中导入：

```javascript
import "./global.css";
import { Stack } from "expo-router";

export default function Layout() {
  return <Stack />;
}

```

---

## 3. 架构原理示意图

理解 v5 的工作原理有助于你排查样式失效的问题。

---

## 4. 关键知识点与进阶用法

### ① 响应式与平台断点

v5 依然支持 `sm:`, `md:` 等断点，但在 React Native 中，这些是基于屏幕宽度计算的。此外，v5 增强了 **平台选择器**：

* `ios:mt-4`: 仅在 iOS 生效。
* `android:p-2`: 仅在 Android 生效。
* `web:hover:text-blue-500`: 仅在 Web 端悬停时生效。

### ② 变量与主题（Native Stack）

v5 深度支持 CSS 变量。你可以直接在样式类中使用：

* 用法：`<View className="bg-[--color-primary]" />`
* **动态改变：** 你可以在代码中通过 `setVariable` 动态修改变量，NativeWind 会自动更新所有关联的原生组件。

### ③ 动画（Reanimated 集成）

这是 v5 的杀手锏。你不再需要编写复杂的 `useAnimatedStyle`，直接使用 Tailwind 类：

```html
<View className="transition-all duration-500 hover:scale-110 active:opacity-50" />

```

*注意：必须安装并配置好 `react-native-reanimated` 插件。*

### ④ TypeScript 支持

为了让代码不报 `className` 属性不存在的错误，需要创建 `nativewind-env.d.ts`：

```typescript
/// <reference types="nativewind/types" />

```

---

## 5. 常见坑点（避雷针）

| 坑点 | 说明 | 解决方案 |
| --- | --- | --- |
| **缓存问题** | 修改 CSS 或配置后样式没变 | 运行 `npx expo start -c` 清除缓存启动 |
| **样式继承** | 给 View 设置 text-red 不生效 | **文本样式必须写在 `<Text>` 上**，View 不会向下传递文字样式 |
| **颜色透明度** | `bg-red-500/50` 语法 | v5 原生支持该语法，无需额外配置，但确保颜色是标准的 hex 或 rgb |
| **第三方组件** | 无法直接对第三库组件使用 className | 使用 `cssInterop` 函数手动包裹该组件 |

---

## 6. 与 v4 的开发流对比

| 动作 | NativeWind v4 (旧) | NativeWind v5 (新) |
| --- | --- | --- |
| **定义主色** | `tailwind.config.js` | `global.css` 的 `@theme` 区块 |
| **深色模式** | `nativewind/dist/base` 导出 | CSS `media (prefers-color-scheme: dark)` |
| **编译速度** | 较慢，依赖大量 Babel 转换 | 极快，利用 Tailwind v4 的 Rust 编译器引擎 |

### 下一步建议

你需要我为你提供一个完整的、基于 **Expo Router** 的 NativeWind v5 项目目录结构示例吗？这样你可以直接复制到实际开发中使用。

