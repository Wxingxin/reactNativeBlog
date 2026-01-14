下面把 **React Native `Pressable`** 做一个“属性大全 + 知识点大全 + 经典代码”的整理（偏工程实践口径）。内容以 RN 官方 `Pressable` 设计思路为主：用“按压状态”驱动样式与行为。

---

## 1) Pressable 是什么，解决什么问题

`Pressable` 是一个“可按压容器”，核心能力是：

* 提供 **按压状态**（`pressed / hovered / focused`）
* 支持把状态 **直接注入到 style / children**（函数式写法）
* 比 `TouchableOpacity/Highlight/...` 更统一、更可控（尤其是样式与交互状态）

适合：按钮、列表项、卡片、图标点击区、长按菜单入口等。

---

## 2) Props 属性大全（按类别）

> 注：不同 RN 版本存在细微差异，但以下为稳定常用项。

### A. 交互回调（最常用）

* **`onPress(event)`**：点击/轻触释放后触发（最常用）
* **`onPressIn(event)`**：按下瞬间触发
* **`onPressOut(event)`**：松开瞬间触发
* **`onLongPress(event)`**：长按触发（默认长按时长与平台有关）
* **`delayLongPress`**：长按判定延迟（毫秒）
* **`unstable_pressDelay`**：在某些版本中用于控制触发延迟（不建议依赖，除非你明确知道版本行为）

### B. “状态驱动渲染”的关键 Props

* **`style`**：

  * 可以是普通样式对象/数组
  * 也可以是函数：`({ pressed, hovered, focused }) => style`
* **`children`**：

  * 可以是 ReactNode
  * 也可以是函数：`({ pressed, hovered, focused }) => ReactNode`

> 工程建议：**优先用 `style` 函数** 来做 pressed 的视觉反馈；当内容也要随状态变更（如文案/图标）时再用 children 函数。

### C. 命中区域与交互体验

* **`hitSlop`**：扩大可点击范围（不改变视觉大小），适合小图标按钮

  * 例：`hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`
* **`pressRetentionOffset`**：按住滑动时，离开多远仍保持“按压”归属（提升拖动容错）
* **`android_disableSound`**：Android 是否禁用点击音效
* **`android_ripple`**：Android 水波纹效果（可配置颜色、是否无边界等）

  * 常用：`{ color: 'rgba(0,0,0,0.12)', borderless: false, radius: 18 }`

### D. 无障碍与可用性（生产环境必须重视）

* **`disabled`**：禁用交互（注意你要同时做视觉禁用态）
* **`accessibilityRole`**：常见 `button` / `link` / `tab` 等
* **`accessibilityLabel`**：读屏描述
* **`accessibilityHint`**：操作提示
* **`accessible`**：是否参与无障碍树
* **`focusable`**：是否可聚焦（TV/键盘场景尤重要）

### E. Pointer / Hover / Focus（多端与桌面/TV）

* **`onHoverIn` / `onHoverOut`**：Web/桌面 hover
* **`onFocus` / `onBlur`**：键盘/TV 聚焦
* 通过 `style/children` 函数可拿到 `hovered/focused`

### F. 事件冒泡与布局相关（继承自 View 的常见项）

* **`pointerEvents`**、`testID`、`nativeID` 等
* **`onLayout`**、`collapsable` 等 View 属性也可用

---

## 3) 核心知识点大全（你写项目时最容易踩的点）

### 3.1 “pressed 反馈”最佳实践：用 style 函数

不要手动维护 `useState(pressed)`（除非你要跨组件共享状态），直接：

* `style={({ pressed }) => pressed ? ... : ...}`

这样更稳、更少 bug。

### 3.2 Pressable 的 children 也可以是函数

适合“按下时文字变化/图标变化/显示 loading”的场景。

### 3.3 disabled 不等于“自动灰掉”

`disabled` 只会阻止交互，你仍需在样式里体现禁用态（opacity、颜色、边框等）。

### 3.4 Android ripple 与 iOS pressed opacity 是两套体系

* Android 推荐 `android_ripple`（更符合原生体验）
* iOS 通常用 `pressed` 改变 `opacity / backgroundColor`

### 3.5 hitSlop：小按钮必备

视觉 24x24 的 icon，推荐 hitSlop 扩到至少 40x40 或更大，显著提升可点性。

### 3.6 列表项的“整行可点”与内部按钮冲突

当 `Pressable` 套 `Pressable`（外层列表项，内层删除按钮），需要处理事件与布局：

* 内层按钮区域要足够大（hitSlop）
* 外层 onPress 逻辑要避免误触（例如根据点击区域、或者把内部按钮放到绝对定位区域）

### 3.7 防重复点击（工程里经常需要）

`Pressable` 不自带节流/防抖。下方会给“防连点”经典写法。

---

## 4) 经典代码案例

### 4.1 基础按钮：pressed 变色 + 禁用态

```jsx
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  btnPressed: {
    backgroundColor: "#1d4ed8",
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    backgroundColor: "#93c5fd",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  textDisabled: {
    color: "rgba(255,255,255,0.9)",
  },
});
```

---

### 4.2 图标按钮：hitSlop 扩大命中范围

```jsx
import React from "react";
import { Pressable, Text } from "react-native";

export function IconButton({ icon = "×", onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </Pressable>
  );
}
```

---

### 4.3 Android 水波纹 + iOS pressed 统一体验

```jsx
import React from "react";
import { Platform, Pressable, Text } from "react-native";

export function RippleButton({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.25)" }}
      style={({ pressed }) => [
        {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          overflow: "hidden", // Android ripple 想要圆角必须配合 overflow hidden
        },
        Platform.OS === "ios" && pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}
```

---

### 4.4 children 函数：按住时显示不同文案

```jsx
import React from "react";
import { Pressable, Text } from "react-native";

export function HoldToConfirm({ onConfirm }) {
  return (
    <Pressable
      onLongPress={onConfirm}
      delayLongPress={600}
      style={({ pressed }) => ({
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? "#16a34a" : "#22c55e",
      })}
    >
      {({ pressed }) => (
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {pressed ? "继续按住…" : "长按确认"}
        </Text>
      )}
    </Pressable>
  );
}
```

---

### 4.5 防连点（节流）按钮：避免重复提交

```jsx
import React, { useRef } from "react";
import { Pressable, Text } from "react-native";

export function SafePressable({ onPress, interval = 800, children }) {
  const lastRef = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastRef.current < interval) return;
    lastRef.current = now;
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: pressed ? "#0ea5e9" : "#0284c7",
      })}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        {children ?? "提交"}
      </Text>
    </Pressable>
  );
}
```

---

## 5) 选择 Pressable vs Touchable 的建议（简要）

* 需要 **按压状态驱动样式/内容**：优先 `Pressable`
* 只是简单点击并要默认淡出：`TouchableOpacity` 也可，但 `Pressable` 更统一
* Android 强烈依赖 ripple：`Pressable + android_ripple` 很合适

---

如果你愿意，我可以再补一份“**Pressable 做列表项（外层整行点击 + 内部右侧按钮）**”的标准模板（含事件冲突处理与可访问性写法），这是项目里最常见的真实场景之一。
