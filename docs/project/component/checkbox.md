下面给你一套**在 React Native 项目中可直接使用的「复选框 Checkbox 组件」封装方案**，包含：

* ✅ **基础 Checkbox 组件**
* ✅ **受控 / 非受控两种用法**
* ✅ **支持禁用、文字、样式定制**
* ✅ **单选 / 多选（列表）使用示例**
* ✅ **项目中常见设计思路与知识点**

不依赖第三方 UI 库，**可直接落地到 RN / Expo 项目**。

---

## 一、Checkbox 组件封装（核心）

### `components/Checkbox.tsx / Checkbox.js`

```jsx
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";

export default function Checkbox({
  value,
  onChange,
  label,
  disabled = false,
  size = 22,
  checkedColor = "#1677ff",
  uncheckedColor = "#ccc",
}) {
  const toggle = () => {
    if (disabled) return;
    onChange?.(!value);
  };

  return (
    <Pressable
      onPress={toggle}
      style={styles.container}
      disabled={disabled}
    >
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderColor: value ? checkedColor : uncheckedColor,
            backgroundColor: value ? checkedColor : "transparent",
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {value && <View style={styles.inner} />}
      </View>

      {label && (
        <Text style={[styles.label, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: "60%",
    height: "60%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  disabledText: {
    color: "#999",
  },
});
```

---

## 二、基础使用（受控组件，**最推荐**）

```jsx
import { useState } from "react";
import { View } from "react-native";
import Checkbox from "./components/Checkbox";

export default function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <View>
      <Checkbox
        value={checked}
        onChange={setChecked}
        label="我已阅读并同意协议"
      />
    </View>
  );
}
```

### 知识点

* Checkbox 本质是 **受控组件**
* 状态由父组件管理
* 组件只负责 UI + 事件

---

## 三、禁用状态（disabled）

```jsx
<Checkbox
  value={true}
  disabled
  label="不可修改"
/>
```

---

## 四、多选 Checkbox（项目最常见）

### 场景：兴趣选择 / 权限配置

```jsx
import { useState } from "react";
import { View } from "react-native";
import Checkbox from "./Checkbox";

const options = [
  { id: 1, label: "React" },
  { id: 2, label: "Vue" },
  { id: 3, label: "Flutter" },
];

export default function MultiCheckbox() {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  return (
    <View>
      {options.map((item) => (
        <Checkbox
          key={item.id}
          value={selectedIds.includes(item.id)}
          label={item.label}
          onChange={() => toggle(item.id)}
        />
      ))}
    </View>
  );
}
```

### 知识点

* 多选本质是：`Array.includes`
* 不要在 Checkbox 内部维护数组状态

---

## 五、结合表单（React Hook Form 场景）

```jsx
<Controller
  control={control}
  name="agree"
  render={({ field: { value, onChange } }) => (
    <Checkbox
      value={value}
      onChange={onChange}
      label="同意用户协议"
    />
  )}
/>
```

---

## 六、Checkbox + List（FlatList）

```jsx
<FlatList
  data={list}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Checkbox
      value={selected.includes(item.id)}
      label={item.title}
      onChange={() => toggle(item.id)}
    />
  )}
/>
```

---

## 七、为什么不用 Switch / Button？

| 组件       | 是否适合     |
| -------- | -------- |
| Switch   | ❌ 更像开关   |
| Button   | ❌ 不符合语义  |
| Checkbox | ✅ 多选语义明确 |

---

## 八、项目中常见的 Checkbox 扩展方向

你后续可以这样升级：

1. ✅ 支持 `indeterminate`（半选状态）
2. ✅ 自定义图标（Ionicons / SVG）
3. ✅ 动画（`react-native-reanimated`）
4. ✅ CheckboxGroup（类似 Ant Design）

---

## 九、你现在可以直接做什么

如果你愿意，我可以下一步直接帮你：

* 封装一个 **CheckboxGroup**
* 用 **expo-vector-icons** 重写样式
* 加 **动画点击反馈**
* 写一个 **企业级表单示例（登录 / 注册）**

你可以直接告诉我你**更偏向 RN 原生风格还是 Ant Design 风格**。
