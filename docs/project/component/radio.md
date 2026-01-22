下面给你一套在 React Native 中可直接落地的 **Radio（单选框）组件封装方案**，并配套「使用大全 + 知识点大全」。整体按真实项目的思路来：**Radio（单个） + RadioGroup（成组） + 常见场景**。

---

## 1) 组件封装：Radio（单个）

特点：只负责展示与点击回调；是否选中由外部决定（受控）。

**`components/Radio.js`**

```jsx
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";

export default function Radio({
  checked = false,
  onChange,
  label,
  disabled = false,

  // 常用可配置项
  size = 22,
  color = "#1677ff",
  borderColor = "#bbb",
  labelStyle,
  style,
  hitSlop = 8,
}) {
  const handlePress = () => {
    if (disabled) return;
    // 单选的语义：点击一个选项就是选中它（通常不会取消）
    if (!checked) onChange?.(true);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[styles.container, style, disabled && styles.disabled]}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
    >
      <View
        style={[
          styles.outer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: checked ? color : borderColor,
          },
        ]}
      >
        {checked ? (
          <View
            style={[
              styles.inner,
              {
                width: size * 0.55,
                height: size * 0.55,
                borderRadius: (size * 0.55) / 2,
                backgroundColor: color,
              },
            ]}
          />
        ) : null}
      </View>

      {label ? (
        <Text style={[styles.label, labelStyle]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  outer: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {},
  label: { marginLeft: 10, fontSize: 16, color: "#333" },
  disabled: { opacity: 0.5 },
});
```

---

## 2) 组件封装：RadioGroup（成组，项目更常用）

特点：统一管理 `value`，并把 `checked / onPress` 分发给每个选项。

**`components/RadioGroup.js`**

```jsx
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Radio from "./Radio";

export default function RadioGroup({
  value,
  onChange,
  options = [], // [{ label, value, disabled }]
  direction = "column", // 'row' | 'column'
  gap = 12,
  disabled = false,

  // 透传给 Radio 的样式配置
  radioProps,
  style,
}) {
  const handleSelect = useCallback(
    (nextValue) => {
      if (disabled) return;
      if (nextValue === value) return; // 单选：重复点击不触发也可
      onChange?.(nextValue);
    },
    [disabled, onChange, value]
  );

  return (
    <View
      style={[
        styles.group,
        direction === "row" ? styles.row : styles.column,
        style,
        direction === "row" ? { columnGap: gap } : { rowGap: gap },
      ]}
      accessibilityRole="radiogroup"
    >
      {options.map((opt) => {
        const isDisabled = disabled || opt.disabled;
        return (
          <Radio
            key={String(opt.value)}
            label={opt.label}
            checked={opt.value === value}
            disabled={isDisabled}
            onChange={() => handleSelect(opt.value)}
            {...radioProps}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {},
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  column: { flexDirection: "column" },
});
```

---

## 3) 使用大全（常见场景全覆盖）

### 3.1 最基础：选择性别 / 选一种

```jsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import RadioGroup from "./components/RadioGroup";

export default function Demo() {
  const [gender, setGender] = useState("male");

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 12 }}>性别：{gender}</Text>

      <RadioGroup
        value={gender}
        onChange={setGender}
        options={[
          { label: "男", value: "male" },
          { label: "女", value: "female" },
          { label: "保密", value: "secret" },
        ]}
      />
    </View>
  );
}
```

---

### 3.2 横向排列（direction=row）

```jsx
<RadioGroup
  value={pay}
  onChange={setPay}
  direction="row"
  gap={16}
  options={[
    { label: "支付宝", value: "alipay" },
    { label: "微信", value: "wechat" },
    { label: "银行卡", value: "card" },
  ]}
/>
```

---

### 3.3 禁用整个组 / 禁用单个选项

```jsx
<RadioGroup
  value={level}
  onChange={setLevel}
  disabled={false}
  options={[
    { label: "普通", value: "normal" },
    { label: "VIP（不可选）", value: "vip", disabled: true },
  ]}
/>
```

---

### 3.4 受控 + 异步回写（例如提交后锁定）

```jsx
const [shipping, setShipping] = useState("fast");
const [submitting, setSubmitting] = useState(false);

<RadioGroup
  value={shipping}
  onChange={(v) => {
    if (submitting) return;
    setShipping(v);
  }}
  disabled={submitting}
  options={[
    { label: "普通配送", value: "normal" },
    { label: "极速配送", value: "fast" },
  ]}
/>;
```

---

### 3.5 与 FlatList 一起用（大量选项）

```jsx
import { FlatList } from "react-native";
import Radio from "./components/Radio";

<FlatList
  data={options}
  keyExtractor={(item) => String(item.value)}
  renderItem={({ item }) => (
    <Radio
      label={item.label}
      checked={item.value === value}
      onChange={() => setValue(item.value)}
      disabled={item.disabled}
    />
  )}
/>;
```

---

### 3.6 与 React Hook Form 集成（表单最常见）

```jsx
import { Controller } from "react-hook-form";

<Controller
  name="plan"
  control={control}
  defaultValue="basic"
  render={({ field: { value, onChange } }) => (
    <RadioGroup
      value={value}
      onChange={onChange}
      options={[
        { label: "基础版", value: "basic" },
        { label: "专业版", value: "pro" },
        { label: "旗舰版", value: "max" },
      ]}
    />
  )}
/>;
```

---

### 3.7 “按钮式单选”（常见于标签/筛选）

思路：RadioGroup 不一定要圆圈样式，也可以复用 “value 单选逻辑”，渲染成 Pill Button。
（如果你需要我可以给你单独做一个 `SegmentedControl` 版本。）

---

## 4) 知识点大全（项目落地必懂）

### 4.1 单选的状态模型

* 单选永远是：`value = 某一个选项值`
* “是否选中”由 `opt.value === value` 推导出来
* 不建议在单个 Radio 内部用 `useState` 管理 checked（否则容易与外部状态不同步）

### 4.2 受控组件（Controlled Component）

* `value` 由父组件持有
* `onChange(nextValue)` 通知父组件更新
* 这样才容易：

  * 表单校验
  * 数据回填（编辑页）
  * 服务端返回默认值

### 4.3 Radio vs Checkbox 的交互语义差异

* Checkbox：点击可 `true/false` 来回切换
* Radio：点击通常只会“选中”，不会取消（取消通常由“选无/清空”按钮完成）
* 所以 Radio 的点击逻辑常写成：`if (!checked) onChange(true)` / `onChange(value)`

### 4.4 RadioGroup 的职责边界

* Group 管理：

  * 选项列表 options
  * 选中的 value
  * 排列方式 row/column
  * 禁用策略（全组禁用、单项禁用）
* Radio 只负责：

  * UI
  * 点击事件
  * 无业务状态

### 4.5 性能与可维护性

* `key` 使用稳定的 `value`
* 大列表用 `FlatList`
* `handleSelect` 用 `useCallback`，减少不必要重渲染（对大列表有意义）
* 样式参数化（size/color/gap）提升复用

### 4.6 无障碍 Accessibility（上线项目建议加）

* `accessibilityRole="radio"`、`accessibilityState={{checked}}`
* Group 用 `accessibilityRole="radiogroup"`
* 可提高 iOS VoiceOver / Android TalkBack 体验

### 4.7 触控体验细节

* `hitSlop` 扩大可点击区域（移动端非常实用）
* 禁用用 `opacity` + `disabled` 双重保障

---

## 5) 你下一步如果要更“企业级”

我可以继续把这个 Radio 组件升级为更贴近真实业务的版本，例如：

1. 支持 `error` / `helperText`（表单错误态）
2. 支持 `description`（副文本）与右侧图标
3. 支持 `renderOption` 自定义渲染（完全可插拔）
4. 支持 “可取消单选”（点击已选项会清空 value），用于筛选场景

你告诉我：你更想要**“表单场景版（带错误提示）”**还是 **“筛选标签版（Segmented/Pills）”**，我直接给你完整组件与示例。
