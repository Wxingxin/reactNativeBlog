在 React Native 里，“组件的默认样式”要分两层看：

1. **组件本身的默认渲染规则**（由 RN 的实现决定）
2. **布局系统的默认规则**（Yoga/Flexbox 决定：宽高如何被计算）

结论先讲清楚：**大多数 React Native 核心组件默认都没有 border、没有固定 width/height**；它们的大小通常由 **内容（intrinsic content size）**、**父容器布局约束**、以及你写的 `style` 共同决定。少数组件（尤其是 TextInput、Button、Switch 等）会受平台原生控件默认外观影响。

---

## 1) React Native 的“默认布局规则”（最关键）

### 1.1 默认 display 是什么？

RN 没有 CSS 的 `display: block/inline` 概念，核心是 Yoga 的 Flex 布局：

* **`View` 默认相当于一个 flex 容器**：

  * `flexDirection: 'column'`（默认纵向排列）
  * `alignItems: 'stretch'`（默认会让子元素在交叉轴方向“拉伸”）
* 但注意：**“拉伸”不等于一定铺满屏幕**。它是“在父容器给了可用空间并且子元素没有明确尺寸时，子元素按规则拉伸”。

### 1.2 默认 width / height 怎么算？

对于 `View` / `Pressable` 这种“盒子组件”，默认：

* `width`、`height` **都是 `auto`**
* 结果就是：

  * 没内容 → 可能变成 **0 尺寸**（或仅受父容器约束）
  * 有内容（比如里面有 Text）→ 尺寸由内容 + padding 等决定
  * 如果你给了 `flex: 1` → 按父容器可用空间分配

### 1.3 默认边框？

默认：

* `borderWidth: 0`
* `borderColor: undefined`（即便有颜色也看不到，因为宽度为 0）
  所以**默认没有边框**。

### 1.4 默认 margin / padding？

大多数核心组件默认：

* `margin: 0`
* `padding: 0`
  例外：某些平台控件（比如 `TextInput` 在 iOS/Android 可能自带内边距/高度感）属于“原生控件默认外观”的范畴。

---

## 2) 常见核心组件的默认样式与“默认尺寸”理解

下面说“默认样式”，我用“你不写 style 时通常会看到/得到什么”来解释（因为很多默认不是明文 style，而是布局推导 + 原生控件外观）。

### 2.1 `View`

* **默认宽高**：`auto`

  * 没内容：可能 0×0（或被父容器拉伸/约束）
  * 有子元素：包裹子元素尺寸（column 布局）
* **默认边框**：无
* **默认背景色**：透明
* **默认布局**：flex 容器（column + stretch）

> 误区：很多人以为 View 默认像网页 div 一样“占满一行”。RN 不是。它是否铺满，取决于父容器 + stretch + 你是否给了 `alignSelf/width/flex`。

---

### 2.2 `Text`

* `Text` 的尺寸通常由**文字本身**决定：

  * 宽度：文字排版后的宽度（受父容器宽度影响会换行）
  * 高度：行高（line height）* 行数
* 默认没有边框、背景透明
* 默认字体大小、字体族等由平台决定（iOS/Android 默认字体不同）

> 关键点：`Text` 更像“有内在尺寸的内容”，不是纯盒子。

---

### 2.3 `Image`

* `Image` **必须有尺寸来源**，否则经常显示不出来或为 0：

  * 如果是 `require('./xxx.png')` 的本地图片：通常 RN 能拿到图片原始尺寸，可能自动表现出该尺寸（但布局中仍会受父容器约束）。
  * 如果是网络图片：**通常需要你显式给 `width`/`height`**，否则容易不显示。
* 默认无边框、背景透明（除非你加 `backgroundColor`）

---

### 2.4 `ScrollView`

* 默认宽高：通常在父容器内按布局占据空间（你若不给约束，容易出现“没高度”或“撑不开”）
* 默认无边框
* 常见现象：你把它放在一个没有 `flex: 1` 或没有明确高度的父 View 中，它可能高度不足，滚动区域看起来“失效”。

---

### 2.5 `Pressable` / `Touchable*`

* 本质是交互包装容器，默认：

  * 宽高 `auto`
  * 无边框、无背景
* “点击反馈”不是靠默认 border，而是靠状态（`pressed`）你自己改样式，或某些 Touchable 的默认 opacity 变化。

---

### 2.6 `TextInput`（默认外观差异最大的之一）

* 默认宽高：`auto`，但**原生控件通常会有一个“看起来像输入框”的默认高度/内边距**
* 默认边框：因平台/主题不同，可能：

  * iOS：更偏“无边框/下划线不明显”，常需要你自己加 `borderWidth`
  * Android：常见是 Material 风格下的下划线/边框效果（取决于 RN 版本与原生主题）
* 结论：**TextInput 不要依赖默认样式**。生产里建议显式设置：

  * `height` 或 `paddingVertical`
  * `borderWidth/borderColor`
  * `borderRadius`
  * `backgroundColor`

---

### 2.7 `Button` / `Switch` / `ActivityIndicator` 等“强原生控件”

这些组件的“默认样式”主要来自原生：

* **`Button`**：外观高度/圆角/背景完全跟随平台（可定制能力也有限）
* **`Switch`**：尺寸基本固定，样式跟随平台
* **`ActivityIndicator`**：尺寸通常有默认（small/large 或 size 数值），颜色可改

> 这类组件你要预期：它们不像 View 那样“默认啥都没有”，而是“默认就是原生控件长相”。

---

## 3) 为什么你会感觉“有默认宽高”？

通常是这几个机制造成的错觉：

1. **父容器 `alignItems: 'stretch'` 导致子元素看起来被拉满宽度**
2. **子元素有内容**（Text、Image 本地资源）自带 intrinsic size
3. **某些组件本质是原生控件**（TextInput/Button/Switch）有平台默认高度/内边距
4. **你写了 `flex: 1` 或父容器给了明确尺寸**，导致组件自然填充

---

## 4) 实战建议（避免“默认样式不一致”的坑）

### 4.1 统一“盒子类”组件的基础样式

对于 View/Pressable/ScrollView 容器，建议你项目里约定：

* 容器要撑开：用 `flex: 1` 或明确宽高
* 需要视觉边界：显式写 `borderWidth/borderColor`
* 需要点击区域：给 `padding`，不要依赖子元素大小

### 4.2 对 `TextInput` 一定要显式定义外观

跨平台一致性最差的就是输入框。你应当自己定：

* `paddingHorizontal / paddingVertical`
* `borderWidth / borderColor`
* `borderRadius`
* `fontSize`
* `height`（或用 padding + lineHeight 组合控制）

---

## 5) 一个最直观的“默认值总结”

* **默认 width/height：大多是 `auto`（不固定）**
* **默认 border：0（没有）**
* **默认 background：透明**
* **默认 margin/padding：0（大多）**
* **默认布局：Flexbox；`flexDirection: 'column'`；`alignItems: 'stretch'`（父容器对孩子的默认拉伸）**
* **原生控件类（TextInput/Button/Switch）默认外观受平台影响很大**

---

如果你愿意，我可以按“组件清单”把你常用的（例如 View/Text/Image/Pressable/TextInput/ScrollView/FlatList/Modal/StatusBar）逐个做成一份“默认外观 + 尺寸推导规则 + 常见坑 + 统一样式模板”的对照表，便于你在项目里直接落地。
