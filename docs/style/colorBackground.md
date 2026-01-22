---
outline: false
---

符号：✅ 常规可用｜⚠️ 有限制/需注意｜❌ 不支持或基本无效

---

## 1) `backgroundColor` 支持表

| 组件                  | backgroundColor | 说明                           |
| ------------------- | --------------- | ---------------------------- |
| **View**            | ✅               | 最标准的背景色容器                    |
| **Text**            | ✅               | 背景色作用于文本布局盒（含多行）             |
| **Image**           | ❌               | Image 没有“背景层”，通常需要外包 View    |
| **ImageBackground** | ✅               | 容器可设置背景色（可做遮罩/兜底色）           |
| **Pressable**       | ✅               | 等价 View，常用于交互态背景色            |
| **Button**          | ❌               | 不可控（仅少数平台有 tintColor 等非标准能力） |
| **TextInput**       | ✅               | 常用于输入框底色                     |
| **Switch**          | ❌               | 原生控件，backgroundColor 基本不生效   |
| **ScrollView**      | ✅               | 作用于滚动容器本身（不是内容区）             |
| **FlatList**        | ✅               | 同 ScrollView（作用于列表外壳）        |
| **SectionList**     | ✅               | 同 ScrollView                 |
| **SafeAreaView**    | ✅               | 常用于全屏底色/安全区底色                |

---

## 2) `opacity` 支持表

| 组件                  | opacity | 说明                   |
| ------------------- | ------- | -------------------- |
| **View**            | ✅       | 影响自身及其子元素整体透明度       |
| **Text**            | ✅       | 文本与其背景一起透明           |
| **Image**           | ✅       | 图片整体透明               |
| **ImageBackground** | ✅       | 整体透明（含子元素）           |
| **Pressable**       | ✅       | 常配合 pressed 状态做按压反馈  |
| **Button**          | ❌       | 不可控                  |
| **TextInput**       | ⚠️      | 可用，但会影响文字/光标可读性与交互体验 |
| **Switch**          | ⚠️      | 有时可见变化，但一致性差（平台差异明显） |
| **ScrollView**      | ✅       | 容器与内容整体透明（不常用）       |
| **FlatList**        | ✅       | 同 ScrollView         |
| **SectionList**     | ✅       | 同 ScrollView         |
| **SafeAreaView**    | ✅       | 同 View               |

---

## 关键注意点（实战高频）

### 1) Image 想要“背景色”怎么做

`Image` 本身不吃 `backgroundColor`，常用做法是外包一层：

* 外层 View：`backgroundColor`（比如占位底色/骨架底色）
* 内层 Image：负责显示图片

### 2) opacity 会“连子元素一起透明”

如果你只想让背景半透明、文字不透明：
不要用 `opacity`，改用 **带 alpha 的颜色**（例如 rgba / hex8）给 `backgroundColor`。

### 3) 列表组件的背景色通常要分清两层

* `style`：列表“外壳”背景
* `contentContainerStyle`：列表“内容区”背景（更常用）

---

如果你下一组要整理 **shadow / elevation（阴影）** 或 **overflow**，我也可以继续按同样表格给你做一份“项目可直接用”的速查表。
