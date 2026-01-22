下面给你一套在 React Native 中可直接落地的 **Textarea（多行文本域）组件封装方案**，并配套「使用大全 + 知识点大全」。设计目标是：**真实项目可用**（表单、评论、反馈、发布内容等），支持常见能力：多行、字数统计、清空、错误态、禁用、自动增长、与表单库集成。

---

## 1) 组件封装：Textarea（核心）

### `components/Textarea.js`

```jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

export default function Textarea({
  // 受控值
  value,
  onChangeText,

  // 文案与状态
  label,
  placeholder,
  helperText,
  errorText,

  // 行为
  disabled = false,
  maxLength,
  showCount = true,
  clearable = true,

  // 多行相关
  minRows = 4,
  autoGrow = false, // 自动高度增长（需要配合 onContentSizeChange）
  inputStyle,
  containerStyle,

  // TextInput 透传
  returnKeyType,
  blurOnSubmit = true,
  onFocus,
  onBlur,
  onSubmitEditing,

  // iOS/Android 常用
  textAlignVertical = "top",
}) {
  const length = value?.length ?? 0;
  const hasError = Boolean(errorText);

  const minHeight = useMemo(() => {
    // 经验值：一行大约 20~22 高度 + padding
    const lineHeight = 20;
    return minRows * lineHeight + 24;
  }, [minRows]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.box,
          { minHeight },
          disabled && styles.disabledBox,
          hasError && styles.errorBox,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={!disabled}
          multiline
          style={[
            styles.input,
            { minHeight, textAlignVertical },
            inputStyle,
          ]}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          // Android：避免自动纠错/首字母大写等可按需开启/关闭
          autoCorrect={false}
          autoCapitalize="none"
          // autoGrow：由外部按需开启（示例里会给）
        />

        {clearable && !disabled && length > 0 ? (
          <Pressable
            onPress={() => onChangeText?.("")}
            hitSlop={10}
            style={styles.clearBtn}
            accessibilityRole="button"
          >
            <Text style={styles.clearText}>清空</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.helper, hasError && styles.errorText]}>
          {hasError ? errorText : helperText}
        </Text>

        {showCount ? (
          <Text style={styles.count}>
            {maxLength ? `${length}/${maxLength}` : `${length}`}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: 8, fontSize: 14, color: "#333" },

  box: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    position: "relative",
  },
  disabledBox: { opacity: 0.6, backgroundColor: "#f6f6f6" },
  errorBox: { borderColor: "#ff4d4f" },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    padding: 0, // 用外层 padding 控制整体
  },

  clearBtn: { position: "absolute", right: 10, top: 10 },
  clearText: { fontSize: 12, color: "#1677ff" },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    minHeight: 18,
  },
  helper: { fontSize: 12, color: "#888", flex: 1, paddingRight: 10 },
  errorText: { color: "#ff4d4f" },
  count: { fontSize: 12, color: "#888" },
});
```

> 说明：这里采用“**受控组件**”设计（value/onChangeText 必传），项目里最稳。

---

## 2) 使用大全（常见场景全覆盖）

### 2.1 最基础：反馈/评论输入

```jsx
import React, { useState } from "react";
import { View } from "react-native";
import Textarea from "./components/Textarea";

export default function Demo() {
  const [content, setContent] = useState("");

  return (
    <View style={{ padding: 16 }}>
      <Textarea
        label="反馈内容"
        value={content}
        onChangeText={setContent}
        placeholder="请描述你遇到的问题..."
        helperText="尽量提供可复现步骤"
        minRows={5}
      />
    </View>
  );
}
```

---

### 2.2 限制字数 + 计数器（发布/动态）

```jsx
<Textarea
  label="发布内容"
  value={text}
  onChangeText={setText}
  placeholder="写点什么..."
  maxLength={200}
  showCount
/>
```

---

### 2.3 错误态（必填校验）

```jsx
const [bio, setBio] = useState("");
const errorText = bio.trim().length === 0 ? "内容不能为空" : "";

<Textarea
  label="个人简介"
  value={bio}
  onChangeText={setBio}
  placeholder="介绍一下你自己"
  errorText={errorText}
/>
```

---

### 2.4 禁用态（只读查看）

```jsx
<Textarea
  label="审核意见"
  value={audit}
  onChangeText={() => {}}
  disabled
  showCount={false}
/>
```

---

### 2.5 带“清空”按钮（搜索描述/备注）

```jsx
<Textarea
  label="备注"
  value={note}
  onChangeText={setNote}
  clearable
/>
```

---

### 2.6 与 FlatList / ScrollView 协作（避免键盘遮挡）

典型做法：外层用 `KeyboardAvoidingView`（iOS）+ `ScrollView` 或 `react-native-keyboard-controller`。

```jsx
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>
  <ScrollView contentContainerStyle={{ padding: 16 }}>
    <Textarea value={v} onChangeText={setV} label="内容" minRows={6} />
  </ScrollView>
</KeyboardAvoidingView>;
```

---

### 2.7 React Hook Form 集成（表单标准做法）

```jsx
import { Controller, useForm } from "react-hook-form";

const { control } = useForm({ defaultValues: { desc: "" } });

<Controller
  control={control}
  name="desc"
  rules={{ required: "请填写描述" }}
  render={({ field: { value, onChange }, fieldState: { error } }) => (
    <Textarea
      label="描述"
      value={value}
      onChangeText={onChange}
      placeholder="请输入描述"
      errorText={error?.message}
      maxLength={300}
    />
  )}
/>;
```

---

## 3) 高级用法：自动高度增长（autoGrow）

RN 的 `TextInput` 可通过 `onContentSizeChange` 拿到内容高度，动态设置容器高度。

### 示例：AutoGrowTextarea（封装一个增强版）

```jsx
import React, { useState } from "react";
import Textarea from "./Textarea";

export default function AutoGrowTextarea(props) {
  const [height, setHeight] = useState(undefined);

  return (
    <Textarea
      {...props}
      inputStyle={[
        props.inputStyle,
        height ? { height } : null,
      ]}
      // 关键：把 onContentSizeChange 透传给 TextInput
      // 这里要去 Textarea 组件里把 onContentSizeChange 也透传
      onContentSizeChange={(e) => {
        const next = e.nativeEvent.contentSize.height;
        setHeight(Math.max(next, 80)); // 最小高度
        props.onContentSizeChange?.(e);
      }}
    />
  );
}
```

为了让上面工作，你需要在 Textarea 内 `TextInput` 上加一行透传：

```jsx
// 在 Textarea 组件参数里接收 onContentSizeChange
// 并传给 TextInput：onContentSizeChange={onContentSizeChange}
```

> 项目经验：自动增长常用于聊天输入框、发布页；普通表单未必需要。

---

## 4) 知识点大全（Textarea 落地必须懂）

### 4.1 Textarea 在 RN 中是什么

* RN 没有独立的 `<textarea>`
* **多行文本域 = `TextInput` + `multiline`**
* 想要“顶部对齐”通常要设置：`textAlignVertical="top"`（尤其是 Android）

### 4.2 受控组件（Controlled）

* 推荐：`value` + `onChangeText`
* 好处：

  * 校验/回填容易
  * 统一状态源
  * 与 RHF / Formik 集成顺畅

### 4.3 常用 TextInput 属性（多行场景）

* `multiline`: 开启多行
* `maxLength`: 限制输入长度
* `textAlignVertical="top"`：Android 多行文本靠顶部
* `editable`: 控制禁用（替代 readonly）
* `placeholderTextColor`: 占位符颜色
* `blurOnSubmit`：多行一般设为 `false`（否则回车会收起键盘）
* `returnKeyType`: 键盘右下角按钮文案（iOS更明显）
* `onSubmitEditing`: 单行常用；多行通常用来提交时要谨慎（回车语义冲突）

### 4.4 字数统计的实现

* `value.length`
* 配合 `maxLength` 展示 `length/maxLength`
* 注意：中文字符也是 1 个长度（按 JS 字符计数；emoji 可能是 surrogate pair，严格计数要另做）

### 4.5 错误态与表单校验

* 错误态通常是：

  * 边框变红
  * 下方 errorText 提示
* 校验建议由：

  * 表单库（React Hook Form）或
  * 父组件逻辑
    来控制，不建议 Textarea 内部自校验（可复用性更高）

### 4.6 键盘与滚动（移动端最容易踩坑）

* 常见问题：输入框被键盘遮挡
* 典型解法：

  * `KeyboardAvoidingView`（iOS）
  * `ScrollView` / `FlatList` 搭配 `keyboardShouldPersistTaps="handled"`
  * 更复杂场景用第三方库处理键盘（按项目复杂度选择）

### 4.7 性能与体验

* 大文本输入：尽量避免在 `onChangeText` 中做重计算
* 输入联动：做 debounce（例如 300ms）以防频繁 setState 引发卡顿
* 点击区域与清空按钮：`hitSlop` 提升可用性

---

## 5) 你下一步如果要更“企业级”

我可以继续给你升级成以下任一版本（更贴近生产）：

1. **带标题/必填星号/右侧图标** 的表单项版
2. **带“剩余字数/超限高亮”** 的发布版
3. **聊天室输入框版**：自动增长 + 发送按钮 + 键盘交互
4. **可插拔渲染**：`renderRight` / `renderFooter` 让你随意扩展 UI

你告诉我：你的 textarea 更偏向 **“表单页面”** 还是 **“发布/评论/聊天”** 场景，我直接给你对应的最佳实践版本和完整示例代码。
