下面我给你一份 **「React Native 组件 × 样式属性生效关系」的系统级总结**。
目标很明确：**哪些样式能用、哪些不能用、为什么不能用、替代方案是什么**。
这是 RN 初学到中高级都会反复踩坑的一块。

---

# 一、先给你一个“总览结论”（非常重要）

在 RN 中：

> **并不是所有组件都是真正的“View 容器”**
> 只有 **真正参与 Flexbox 布局的组件**，才支持完整的布局类样式。

可以粗略分成 4 类：

| 分类           | 组件                                      |
| ------------ | --------------------------------------- |
| 🟦 通用容器（最全）  | `View`, `Pressable`                     |
| 🟩 文本类       | `Text`                                  |
| 🟨 图片类       | `Image`, `ImageBackground`              |
| 🟥 表单 / 交互控件 | `TextInput`, `Button`, `Switch`         |
| 🟪 列表容器      | `ScrollView`, `FlatList`, `SectionList` |

---

# 二、最重要的一张表：**样式是否生效总表**

> ✅ = 生效
> ⚠️ = 部分生效 / 有限制
> ❌ = 不生效

## 1️⃣ 布局相关样式（Flexbox）

| 样式             | View | Text | Image | Pressable | TextInput | Button | Switch | ScrollView / FlatList |
| -------------- | ---- | ---- | ----- | --------- | --------- | ------ | ------ | --------------------- |
| display        | ✅    | ❌    | ❌     | ✅         | ⚠️        | ❌      | ❌      | ❌                     |
| flex           | ✅    | ❌    | ❌     | ✅         | ⚠️        | ❌      | ❌      | ❌                     |
| flexDirection  | ✅    | ❌    | ❌     | ✅         | ❌         | ❌      | ❌      | ❌                     |
| justifyContent | ✅    | ❌    | ❌     | ✅         | ❌         | ❌      | ❌      | ❌                     |
| alignItems     | ✅    | ❌    | ❌     | ✅         | ❌         | ❌      | ❌      | ❌                     |
| gap            | ✅    | ❌    | ❌     | ✅         | ❌         | ❌      | ❌      | ❌                     |

📌 **结论**

* **只有 View / Pressable 才是完整的 Flex 容器**
* `Text`、`Image` 本质不是布局容器
* `ScrollView / FlatList` 的布局要用 **contentContainerStyle**

---

## 2️⃣ 尺寸类样式

| 样式                  | View | Text | Image | Pressable | TextInput | Button | Switch |
| ------------------- | ---- | ---- | ----- | --------- | --------- | ------ | ------ |
| width / height      | ✅    | ⚠️   | ✅     | ✅         | ✅         | ❌      | ❌      |
| minWidth / maxWidth | ✅    | ⚠️   | ✅     | ✅         | ⚠️        | ❌      | ❌      |
| aspectRatio         | ✅    | ❌    | ✅     | ✅         | ❌         | ❌      | ❌      |

📌 **关键点**

* `Text` 的宽高 **由内容决定**
* `Button / Switch` 是 **原生控件**，尺寸不可控
* `Image` **必须有尺寸**，否则不显示

---

## 3️⃣ 内外边距（非常常见坑）

| 样式      | View | Text | Image | Pressable | TextInput | Button | Switch |
| ------- | ---- | ---- | ----- | --------- | --------- | ------ | ------ |
| padding | ✅    | ⚠️   | ❌     | ✅         | ⚠️        | ❌      | ❌      |
| margin  | ✅    | ⚠️   | ✅     | ✅         | ⚠️        | ❌      | ❌      |

📌 **解释**

* `Text` 的 `padding/margin` **部分平台有效**
* `Image` ❌ `padding`（它不是容器）
* `Button / Switch` **完全不支持 margin / padding**

✅ **正确做法**

```jsx
<View style={{ margin: 10 }}>
  <Button title="OK" />
</View>
```

---

## 4️⃣ 边框 & 圆角

| 样式           | View | Text | Image | Pressable | TextInput | Button | Switch |
| ------------ | ---- | ---- | ----- | --------- | --------- | ------ | ------ |
| borderWidth  | ✅    | ⚠️   | ✅     | ✅         | ✅         | ❌      | ❌      |
| borderColor  | ✅    | ⚠️   | ✅     | ✅         | ✅         | ❌      | ❌      |
| borderRadius | ✅    | ⚠️   | ⚠️    | ✅         | ⚠️        | ❌      | ❌      |

📌 **Image 圆角特殊点**

```jsx
<Image
  style={{ width: 100, height: 100, borderRadius: 50 }}
/>
```

* 必须配合 `overflow: 'hidden'`（部分平台）

---

## 5️⃣ 背景 & 透明度

| 样式              | View | Text | Image | Pressable | TextInput | Button | Switch |
| --------------- | ---- | ---- | ----- | --------- | --------- | ------ | ------ |
| backgroundColor | ✅    | ⚠️   | ❌     | ✅         | ⚠️        | ❌      | ❌      |
| opacity         | ✅    | ✅    | ✅     | ✅         | ✅         | ❌      | ❌      |

📌 **Image 没有背景**

* 想要背景图：👉 `ImageBackground`

---

## 6️⃣ 阴影（平台差异很大）

| 样式                  | View | Pressable | Image | Text |
| ------------------- | ---- | --------- | ----- | ---- |
| shadowColor (iOS)   | ✅    | ✅         | ⚠️    | ⚠️   |
| elevation (Android) | ✅    | ✅         | ⚠️    | ❌    |

📌 **最佳实践**

* 阴影永远包一层 `View`

---

# 三、列表组件的“特殊规则”（非常关键）

## ScrollView / FlatList / SectionList

### ❌ 这些样式**不会作用在内容上**

```js
style={{
  padding: 20,
  alignItems: 'center'
}}
```

### ✅ 正确方式：`contentContainerStyle`

```jsx
<ScrollView
  contentContainerStyle={{
    padding: 20,
    alignItems: "center",
  }}
>
```

📌 **记忆口诀**

> **style 管“壳”
> contentContainerStyle 管“内容”**

---

# 四、Button / Switch 为什么这么“废”？

### 原因（面试级理解）

* 它们是 **平台原生控件**
* RN 没有重写 UI
* 样式权力几乎没有

### 正确做法

* **生产项目基本不用 Button**
* 用 `Pressable + View + Text` 自己做

```jsx
<Pressable style={{ padding: 12, backgroundColor: "#000" }}>
  <Text style={{ color: "#fff" }}>Submit</Text>
</Pressable>
```

---

# 五、一句话速记版（强烈建议记住）

> ✅ **布局用 View / Pressable**
> ❌ **Button / Switch 不要指望样式**
> ⚠️ **Text 不是容器**
> ⚠️ **Image 没有 padding**
> ⚠️ **列表用 contentContainerStyle**

---

# 六、你现在这个阶段，最容易踩的 5 个坑

1. 给 `Text` 写 `flex: 1`
2. 给 `Button` 写 `margin`
3. 给 `Image` 写 `padding`
4. 给 `FlatList` 写 `alignItems`
5. 想用 `Switch` 做复杂 UI

---

如果你愿意，我可以下一步帮你做两件事之一（都非常实用）：

1️⃣ **把 React Web 的 CSS 思维 → RN 样式思维一一对照**
2️⃣ **给你一套“自定义 Button / ListItem / Card”组件模板（工业级写法）**

你选哪个？
