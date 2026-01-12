下面我把 **React Native 的 `Switch`** 给你做一份**工程级别的「属性大全 + 知识点大全」**。
不是照文档抄，而是按 **“你在真实项目里会不会用、怎么用才不踩坑”** 来讲。

---

# 一、Switch 是什么？（先给你定位）

* `Switch` = **开 / 关状态控件**
* 本质是一个 **布尔值输入组件**
* 对应关系：

| 平台      | 原生控件         |
| ------- | ------------ |
| iOS     | UISwitch     |
| Android | SwitchCompat |

👉 **使用场景**：
设置页、权限开关、夜间模式、通知开关、是否启用某功能

---

# 二、最标准、最推荐的用法（必会）

```tsx
import { Switch } from "react-native";
import { useState } from "react";

export default function Demo() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      value={enabled}
      onValueChange={setEnabled}
    />
  );
}
```

### 核心规则（非常重要）

* `Switch` **一定是受控组件**
* `value` 决定 UI
* `onValueChange` 改状态

❌ 不要像 Web checkbox 那样“随便用”

---

# 三、核心属性大全（你 90% 会用到的）

## 1️⃣ `value`（必传）

```ts
value: boolean
```

* 当前开关状态
* `true` → 开
* `false` → 关

---

## 2️⃣ `onValueChange`（必传）

```ts
onValueChange?: (value: boolean) => void
```

* 用户点击后触发
* 回调参数就是 **切换后的值**

```tsx
<Switch
  value={enabled}
  onValueChange={(v) => setEnabled(v)}
/>
```

---

## 3️⃣ `disabled`

```ts
disabled?: boolean
```

* 禁用开关（不可点）
* UI 会变灰（平台不同表现略有差异）

```tsx
<Switch value={true} disabled />
```

---

# 四、颜色相关属性（最容易混淆）

## 4️⃣ `trackColor`

```ts
trackColor?: {
  false?: string;
  true?: string;
}
```

👉 **背景轨道颜色**

```tsx
<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: "#ccc", true: "#4cd964" }}
/>
```

---

## 5️⃣ `thumbColor`

```ts
thumbColor?: string
```

👉 **滑块颜色**

```tsx
<Switch
  value={enabled}
  thumbColor={enabled ? "#fff" : "#f4f3f4"}
/>
```

⚠️ 注意：

* **iOS 默认忽略部分自定义 thumbColor**
* Android 更可控

---

## 6️⃣ `ios_backgroundColor`（iOS 特有）

```ts
ios_backgroundColor?: string
```

* iOS 上 `value=false` 时轨道颜色
* 没设置 `trackColor.false` 时才明显

```tsx
<Switch
  value={false}
  ios_backgroundColor="#ddd"
/>
```

---

# 五、事件与交互相关

## 7️⃣ `onChange`（不推荐用）

```ts
onChange?: (event) => void
```

* 原生事件
* **几乎不需要**
* 用 `onValueChange` 就够了

👉 **工程建议：忽略它**

---

# 六、样式与尺寸（很多人会问）

## ❗ Switch 不能直接用 `style` 改大小

```tsx
<Switch style={{ width: 100, height: 100 }} />
```

🚫 **无效 / 不稳定**

---

### ✅ 正确缩放方式（变通）

```tsx
<Switch
  value={enabled}
  style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
/>
```

⚠️ 不同平台视觉略有差异

---

# 七、完整属性列表（一次看全）

| 属性                  | 类型                | 平台  | 说明            |
| ------------------- | ----------------- | --- | ------------- |
| value               | boolean           | all | 当前状态（必传）      |
| onValueChange       | (boolean) => void | all | 切换回调          |
| disabled            | boolean           | all | 是否禁用          |
| trackColor          | {false, true}     | all | 背景轨道颜色        |
| thumbColor          | string            | all | 滑块颜色          |
| ios_backgroundColor | string            | iOS | iOS 关闭时背景色    |
| onChange            | function          | all | 原生事件（少用）      |
| style               | StyleProp         | all | 仅支持 transform |

---

# 八、常见使用场景模板（直接可用）

## 1️⃣ 设置页一行（最经典）

```tsx
<View style={{
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}}>
  <Text>夜间模式</Text>
  <Switch
    value={dark}
    onValueChange={setDark}
  />
</View>
```

---

## 2️⃣ 异步开关（⚠️ 非常重要）

```tsx
const toggle = async (v) => {
  setEnabled(v); // 先乐观更新
  try {
    await api.updateSetting(v);
  } catch {
    setEnabled(!v); // 失败回滚
  }
};

<Switch value={enabled} onValueChange={toggle} />
```

👉 **真实项目必须考虑失败回滚**

---

## 3️⃣ 表单中的布尔字段

```tsx
<Switch
  value={form.allowNotify}
  onValueChange={(v) =>
    setForm({ ...form, allowNotify: v })
  }
/>
```

---

# 九、你必须知道的“坑”（非常重要）

## ❗ 1. Switch 一定要受控

```tsx
<Switch /> // ❌ 错误
```

会出现：

* 状态不同步
* UI 乱跳

---

## ❗ 2. 不要在 onValueChange 里写重逻辑

* 用户点一下 → 立刻响应
* 重逻辑放异步里或防抖

---

## ❗ 3. Android / iOS 颜色不完全一致

* 设计稿 **不要要求 100% 一致**
* Switch 是系统控件，接受“平台风格差异”

---

# 十、工程级结论（一句话）

> **Switch 是一个“简单但必须严谨”的组件**
>
> 只做一件事：**布尔状态切换**
>
> 受控 + 简单逻辑 + 合理配色 = 完美

---

## 下一步我可以帮你做什么？

你可以直接选：

1️⃣ **封装一个 SettingsSwitch 组件（带 label / 描述 / loading / 禁用）**
2️⃣ **Switch + 网络请求 + 失败回滚完整示例**
3️⃣ **Switch vs Checkbox vs Pressable 的使用场景对比**

你说一个，我直接给你工程级代码。
