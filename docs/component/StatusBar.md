
## 1) StatusBar 是什么，工程上解决什么问题

`StatusBar` 用于控制**系统状态栏**（电量/时间/信号那一条）的样式与行为，例如：

* 文字/图标颜色（浅色/深色）
* 背景色（主要 Android）
* 是否透明、是否隐藏
* iOS “内容覆盖”与 Android 沉浸式布局的配合

常见场景：

* 深色页面：状态栏文字要变白
* 进入全屏（视频/图片预览）：隐藏状态栏
* 顶部自定义 Header：需要透明状态栏 + 内容顶到顶部

---

## 2) StatusBar 属性大全（按类别）

> 注：部分属性在 iOS/Android 的支持不同，我会在条目里标注。

### A. 样式（最常用）

* **`barStyle?: 'default' | 'light-content' | 'dark-content'`**

  * `light-content`：白色文字/图标（深色背景常用）
  * `dark-content`：黑色文字/图标（浅色背景常用）
  * `default`：跟随系统默认/主题（在不同平台表现可能不同）

### B. 显示与动画

* **`hidden?: boolean`**：隐藏/显示状态栏
* **`animated?: boolean`**：过渡动画（切换 hidden 或样式时）
* **`showHideTransition?: 'fade' | 'slide'`**（iOS）
  iOS 隐藏/显示过渡方式

### C. Android 专属：背景与沉浸式

* **`backgroundColor?: string`**（Android）
  设置状态栏背景色（iOS 不生效）
* **`translucent?: boolean`**（Android）
  让状态栏“半透明覆盖”在页面之上（沉浸式常用）
* **`networkActivityIndicatorVisible?: boolean`**（iOS，已基本废弃/不建议依赖）
  老 iOS 的网络小菊花（现在基本不用）

### D. iOS 专属（历史属性/少用）

* `backgroundColor` 在 iOS 不生效（iOS 状态栏没有“背景色”概念，背景由导航栏/页面决定）
* 某些旧属性在新 iOS 上意义不大，工程上主要用 `barStyle/hidden`

### E. 静态方法（更适合全局/导航切换）

`StatusBar` 还提供静态方法（适合在页面聚焦/失焦时做全局切换）：

* `StatusBar.setBarStyle(style, animated?)`
* `StatusBar.setHidden(hidden, animation?)`
* `StatusBar.setBackgroundColor(color, animated?)`（Android）
* `StatusBar.setTranslucent(true/false)`（Android）

工程建议：**在 React 组件内优先用 `<StatusBar .../>` 声明式**；涉及导航切换或需要“页面聚焦才生效”的，常配合 `useFocusEffect`/监听 focus 使用静态方法。

---

## 3) 核心知识点大全（跨平台差异与踩坑）

### 3.1 iOS 与 Android 的“背景色”逻辑完全不同

* Android：`backgroundColor` 直接控制状态栏背景
* iOS：状态栏背景取决于你页面顶部的背景（例如导航栏/页面根 View）。
  你只能控制 `barStyle`（图标文字深浅）与是否隐藏。

### 3.2 `translucent`（Android）会让内容“顶到状态栏下面”

一旦 `translucent: true`：

* 状态栏覆盖在页面之上
* 你的页面内容会被状态栏遮住（除非你做 paddingTop / SafeArea 处理）
  常用解决：
* 顶部容器加 `paddingTop: StatusBar.currentHeight ?? 0`
* 或使用 SafeArea 方案（尤其 iOS）

### 3.3 多页面切换时，状态栏很容易“串台”

比如：

* A 页面深色（light-content）
* B 页面浅色（dark-content）
  如果你只在 A 页面写 `<StatusBar .../>`，但页面卸载/导航栈保留时机不同，可能会出现 B 页面状态栏没切回来。

解决策略（推荐）：

* **每个页面都显式声明状态栏**（最稳）
* 或在页面 focus 时使用 `setBarStyle`，在 blur 时恢复

### 3.4 Modal 叠加时要特别注意

* Modal 打开后如果是深色遮罩，通常希望状态栏也切成 `light-content`
* Android 若 Modal 想覆盖状态栏区域，常配合 `statusBarTranslucent`（在 Modal 上）与 `StatusBar translucent`

### 3.5 深色模式适配：不要硬编码

建议根据主题/背景色动态选择：

* 背景深 → `light-content`
* 背景浅 → `dark-content`
  并结合 `useColorScheme()` 或你的主题系统。

---

## 4) 经典代码案例（可直接复用）

### 4.1 单页面声明式：最常见写法

```jsx
import React from "react";
import { View, StatusBar, Text } from "react-native";

export default function Screen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar barStyle="light-content" />
      <Text style={{ color: "#fff", padding: 16 }}>深色页面</Text>
    </View>
  );
}
```

---

### 4.2 Android 设置状态栏背景色 + 深浅字

```jsx
import React from "react";
import { View, StatusBar, Text, Platform } from "react-native";

export default function AndroidBar() {
  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === "android" ? "#f9fafb" : undefined}
      />
      <Text style={{ padding: 16 }}>浅色页面（Android 背景色可控）</Text>
    </View>
  );
}
```

---

### 4.3 Android 沉浸式透明状态栏（内容顶到顶部）

```jsx
import React from "react";
import { View, StatusBar, Text, Platform } from "react-native";

export default function ImmersiveHeader() {
  const topInset = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 你的内容需要自己下移，避免被状态栏遮住 */}
      <View style={{ paddingTop: topInset, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
          自定义 Header（沉浸式）
        </Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "#fff" }}>页面内容...</Text>
      </View>
    </View>
  );
}
```

要点：

* `translucent + backgroundColor="transparent"` 让状态栏浮在上面
* Android 必须处理 `StatusBar.currentHeight`

---

### 4.4 全屏（视频/图片预览）：隐藏状态栏

```jsx
import React, { useState } from "react";
import { View, StatusBar, Pressable, Text } from "react-native";

export default function FullscreenPreview() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar hidden={fullscreen} animated />

      <Pressable
        onPress={() => setFullscreen(v => !v)}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "#fff" }}>
          点击切换{fullscreen ? "退出全屏" : "全屏"}
        </Text>
      </Pressable>
    </View>
  );
}
```

---

### 4.5 与导航配合：页面聚焦时才设置（React Navigation 常用）

如果你用 React Navigation，推荐在页面 focus 时设置，避免“串台”：

```jsx
import React, { useCallback } from "react";
import { View, Text, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function ProfileScreen() {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      // Android 可选：StatusBar.setBackgroundColor("#ffffff", true);

      return () => {
        // 可选：离开时恢复默认（或交给下一个页面设置）
        // StatusBar.setBarStyle("default", true);
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={{ padding: 16 }}>Profile</Text>
    </View>
  );
}
```

要点：

* focus 生效，避免旧页面设置残留
* 是否在 cleanup 恢复，取决于你团队的状态栏策略（常见是“每页自己负责”）

---

## 5) 工程建议（你可以直接采用的团队规范）

1. **每个页面显式设置 StatusBar**（最稳，避免串台）
2. Android 若用沉浸式：统一封装 `TopInset`（`StatusBar.currentHeight`）或用 SafeArea 方案
3. 深色/浅色：别硬编码，尽量跟主题系统走
4. Modal/全屏场景：明确在弹出时切换 `barStyle/hidden`，关闭后恢复

---

如果你告诉我你项目是否使用 **React Navigation**，以及你更偏向 **沉浸式（透明状态栏）** 还是 **传统（有背景状态栏）**，我可以给你一个“全局统一状态栏管理”的最佳实践封装（一个 `useStatusBar()` hook + 页面级配置表），直接放进项目用。
