---
outline: false
---

下面我**严格按 React Native 官方实现与实际工程可用性**，给你一份**「`overflow` / `display` 在各组件中的可用性对照表」**，并补充**重要限制与真实开发结论**（避免踩坑）。

---

## 一、`display`（RN 中非常有限）

> ⚠️ **React Native 只有 `display: 'flex' | 'none'`，没有 `block / inline / inline-block`**

### `display` 支持情况总表

| 组件                  | display: 'flex' | display: 'none' | 说明                  |
| ------------------- | --------------- | --------------- | ------------------- |
| **View**            | ✅               | ✅               | 最基础、完全支持            |
| **Text**            | ✅               | ✅               | 可隐藏文本               |
| **Image**           | ✅               | ✅               | 可用于条件显示             |
| **ImageBackground** | ✅               | ✅               | 本质是 View + Image    |
| **Pressable**       | ✅               | ✅               | 可控制显隐               |
| **Button**          | ❌               | ❌               | ❌ 不支持 style.display |
| **TextInput**       | ✅               | ✅               | 可隐藏输入框              |
| **Switch**          | ❌               | ❌               | 样式受限                |
| **ScrollView**      | ✅               | ✅               | 常用于页面级隐藏            |
| **FlatList**        | ✅               | ✅               | 继承 ScrollView       |
| **SectionList**     | ✅               | ✅               | 继承 ScrollView       |
| **SafeAreaView**    | ✅               | ✅               | 本质是 View            |

### ⚠️ Button / Switch 为什么不支持？

* `Button`、`Switch` 是**高度封装的原生组件**
* 不走通用 `style` 系统
* **推荐做法**：用 `View` 包一层控制显示

```jsx
{visible && <Button title="提交" />}
```

---

## 二、`overflow`（RN 中差异非常大，必须重点看）

> ⚠️ **`overflow` 在 RN 中不是“全平台一致”的 CSS 行为**

### `overflow` 支持情况总表

| 组件                  | overflow: 'hidden' | overflow: 'visible' | overflow: 'scroll' | 说明           |
| ------------------- | ------------------ | ------------------- | ------------------ | ------------ |
| **View**            | ✅                  | ⚠️（默认）              | ❌                  | 最核心使用场景      |
| **Text**            | ⚠️                 | ⚠️                  | ❌                  | 行为有限         |
| **Image**           | ✅                  | ❌                   | ❌                  | 常用于圆角裁剪      |
| **ImageBackground** | ✅                  | ❌                   | ❌                  | 同 Image      |
| **Pressable**       | ✅                  | ⚠️                  | ❌                  | 点击区域不受影响     |
| **Button**          | ❌                  | ❌                   | ❌                  | 不支持          |
| **TextInput**       | ⚠️                 | ⚠️                  | ❌                  | 行为不稳定        |
| **Switch**          | ❌                  | ❌                   | ❌                  | 不支持          |
| **ScrollView**      | ❌                  | ❌                   | ✅（内建）              | 滚动靠组件本身      |
| **FlatList**        | ❌                  | ❌                   | ✅（内建）              | 同 ScrollView |
| **SectionList**     | ❌                  | ❌                   | ✅（内建）              | 同 ScrollView |
| **SafeAreaView**    | ✅                  | ⚠️                  | ❌                  | 同 View       |

---

## 三、关键结论（非常重要）

### 1️⃣ RN 中 **没有 `overflow: scroll` 这个概念**

* 滚动 **只能** 用：

  * `ScrollView`
  * `FlatList`
  * `SectionList`

```jsx
// ❌ 错误
<View style={{ overflow: 'scroll' }} />

// ✅ 正确
<ScrollView />
```

---

### 2️⃣ `overflow: hidden` 的真实用途

最常见 3 个场景：

#### ✅ 圆角裁剪（Image / Card）

```jsx
<View style={{ borderRadius: 12, overflow: 'hidden' }}>
  <Image />
</View>
```

#### ✅ 子元素超出裁剪

```jsx
<View style={{ height: 100, overflow: 'hidden' }}>
  <Text>很长的内容...</Text>
</View>
```

#### ❌ **不能裁剪阴影**

* iOS / Android 阴影会被直接裁掉
* 这是 RN 的经典坑

---

### 3️⃣ `Text` 上的 overflow ≠ Web

* 没有 `text-overflow: ellipsis`
* 正确方式是：

```jsx
<Text numberOfLines={1} ellipsizeMode="tail" />
```

👉 **这是 RN 专有 API，不是 style**

---

### 4️⃣ Pressable 的特殊点

* `overflow: hidden` **只裁剪视觉**
* **不会裁剪点击区域**
* 点击区域仍然是原尺寸

---

## 四、推荐你记住的「速查结论」

### ✅ display

* **绝大多数组件：`flex | none`**
* **Button / Switch：不支持**

### ✅ overflow

* **裁剪：`hidden`（View / Image / Pressable）**
* **滚动：只能用 ScrollView / FlatList**
* **Text 溢出：用 `numberOfLines`，不是 overflow**

---

## 五、给你的工程级建议（前端 → RN 很重要）

* ❌ 不要把 RN 当 Web 写 CSS
* ✅ 把 RN 样式理解成：

  * **布局：Flex**
  * **裁剪：overflow + borderRadius**
  * **滚动：专用列表组件**
* Button / Switch 永远包一层 View

---

如果你愿意，下一步我可以：

* 给你一份 **「RN 样式能力总矩阵（布局 / 文本 / 视觉 / 交互）」完整版**
* 或把你现在整理的 RN 样式文档 **帮你校对 + 补充“易踩坑标注”**

你直接说要哪个。
