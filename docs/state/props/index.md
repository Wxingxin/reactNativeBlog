下面给你一份 RN（React Native）组件里 **Props 的常见使用大全 + 对应知识点**，并配套“经典代码模板”。你可以直接拿去做你自己的组件库规范。

---

## 1) Props 的核心知识点（你必须牢）

### 1.1 单向数据流 + 不可变

- Props 从父组件传入子组件，子组件**只能读**，不能改。
- 想“改”只能通过 **回调函数 props** 把事件抛给父组件。

**经典模式：**

- `value`（数据） + `onChange`（回调） = 可控组件

---

### 1.2 默认值（default props）与解构默认值

RN/React 里最常用写法是解构默认值：

```tsx
function Tag({
  text = "默认",
  size = "md",
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Text>
      {text}-{size}
    </Text>
  );
}
```

---

### 1.3 Props 类型（TypeScript / PropTypes）

真实项目建议 TS：

- 提升可维护性
- 自动补全
- 降低“传错类型”的线上风险

---

### 1.4 组合优先（children）

RN 组件设计里，“可组合”通常优于“配置项堆砌”。

- `children` 是最核心的组合能力。

---

### 1.5 Props 透传（...rest）

封装组件要允许外部传入原生 props（如 `accessibilityLabel`、`testID`、`onLayout`）：

- 通过 `...rest` 透传到最底层 RN 组件。

---

## 2) Props 常见使用大全（按业务场景分类）

---

## A. 基础展示型 Props（数据渲染）

### 常见 props

- `title / subtitle / description`
- `count / price`
- `imageUri`

**经典：Card 组件**

```tsx
type CardProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function Card({ title, subtitle, right }: CardProps) {
  return (
    <View style={{ padding: 12, borderRadius: 12, borderWidth: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{title}</Text>
          {subtitle ? <Text style={{ opacity: 0.6 }}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}
```

**知识点：**

- 可选 props 用 `?`
- 条件渲染用 `subtitle ? ... : null`
- `ReactNode` 用于插槽扩展（right slot）

---

## B. 交互型 Props（事件回调）

### 常见 props

- `onPress`
- `onLongPress`
- `onChangeText`
- `onSubmit`

**经典：ListItem**

```tsx
type ListItemProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function ListItem({ label, onPress, disabled }: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { padding: 12, opacity: disabled ? 0.4 : 1 },
        pressed && !disabled ? { opacity: 0.6 } : null,
      ]}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}
```

**知识点：**

- 回调 props 必须是函数
- disabled 逻辑不要只靠 UI，交互层也要禁用（`disabled`）
- Pressable 适合做“交互封装组件”

---

## C. 可控组件模式（value + onChange）

### 常见 props

- `value`
- `onChange`
- `defaultValue`（非受控时）

**经典：SwitchField（可控）**

```tsx
type SwitchFieldProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export function SwitchField({ value, onChange, label }: SwitchFieldProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {label ? <Text>{label}</Text> : null}
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
```

**知识点：**

- 可控组件由父组件持有状态
- 子组件不保存业务状态（除非是 UI 临时态）

---

## D. 样式 Props（style / className / variants）

### 常见 props

- `style`：几乎所有基础组件都支持
- 你封装组件时也应该支持 `style`

**经典：支持 style 合并**

```tsx
import type { StyleProp, ViewStyle } from "react-native";

type BoxProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Box({ style, children }: BoxProps) {
  return <View style={[{ padding: 12 }, style]}>{children}</View>;
}
```

**知识点：**

- RN style 合并用数组：`[baseStyle, props.style]`
- 类型用 `StyleProp<ViewStyle>` 更贴近 RN

---

## E. 组合 Props（children / slots）

### children（最常见）

```tsx
type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}
```

### slots（插槽式扩展）

```tsx
type HeaderProps = {
  left?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
};

export function Header({ left, title, right }: HeaderProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
      <View style={{ width: 48 }}>{left}</View>
      <Text style={{ flex: 1, textAlign: "center" }}>{title}</Text>
      <View style={{ width: 48, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}
```

**知识点：**

- children 适合“内容区域”
- slots 适合“固定结构可替换区域”（header 左右按钮）

---

## F. Props 透传（封装组件必备）

**经典：Button 透传 RN 的 PressableProps**

```tsx
import type { PressableProps } from "react-native";

type AppButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
};

export function AppButton({
  title,
  loading,
  disabled,
  ...rest
}: AppButtonProps) {
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { padding: 12, borderRadius: 10, alignItems: "center" },
        pressed ? { opacity: 0.7 } : null,
        disabled || loading ? { opacity: 0.5 } : null,
      ]}
    >
      <Text>{loading ? "加载中..." : title}</Text>
    </Pressable>
  );
}
```

**知识点：**

- `Props = 原生Props & 自定义Props`
- `...rest` 让组件不会“封死能力”
- 禁用态要统一：`disabled || loading`

---

## G. 性能相关 Props（memo + 稳定引用）

当 props 频繁变化，会触发子组件重渲染：

- 函数 props 用 `useCallback`
- 对象 props 用 `useMemo`
- 子组件用 `React.memo`

**经典：**

```tsx
const Item = React.memo(function Item({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
});

export function Screen() {
  const onPress = React.useCallback(() => {
    // ...
  }, []);

  return <Item title="A" onPress={onPress} />;
}
```

**知识点：**

- memo 只对“props 稳定”才有效
- 不稳定的匿名函数会破坏 memo

---

## 3) RN 项目里 Props 设计的“高频规范”（建议你照做）

1. **可控优先**：`value + onChange`
2. **必须支持 style**：`style?: StyleProp<...>`
3. **透传原生 props**：`...rest`
4. **可组合优先**：children / slots
5. **禁用态要双保险**：UI + `disabled`
6. **事件 props 命名统一**：`onXxx`
7. **布尔 props 用正向命名**：`disabled` 而不是 `enable`

---

## 4) 你可以直接复用的“通用 Props 模板”

```tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ComponentProps = PressableProps & {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export function Component({
  title,
  subtitle,
  left,
  right,
  containerStyle,
  loading,
  disabled,
  ...rest
}: ComponentProps) {
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { padding: 12, borderRadius: 12, borderWidth: 1 },
        pressed ? { opacity: 0.7 } : null,
        disabled || loading ? { opacity: 0.5 } : null,
        containerStyle,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {left}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{title}</Text>
          {subtitle ? <Text style={{ opacity: 0.6 }}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </Pressable>
  );
}
```

---

如果你希望我进一步“按你现在做 RN 项目的风格”继续扩展，我可以给你一份：

- RN 组件 Props 设计规范（类似团队文档）
- 常见组件（Button / Input / Checkbox / ListItem / Modal）的 Props API 设计表
- 以及配套的 TypeScript 类型定义套路

你更想先做哪一类组件的 Props 规范：Button 还是 Input？
