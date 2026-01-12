下面我把 **React Native 中 `style` 的所有常用属性**，**按功能系统性分类**给你整理成一份**工程级速查表**。
不是零散罗列，而是**“你脑子里该怎么组织这些属性”**。

你可以把它当成：
👉 **RN 样式知识地图**

---

# 一、布局（Layout）— 最重要的一类 ⭐⭐⭐⭐⭐

## 1️⃣ Flex 布局（核心中的核心）

> RN **默认就是 Flexbox（而且是 column）**

### Flex 容器属性

```ts
flex
flexDirection
justifyContent
alignItems
alignContent
flexWrap
gap (新版本支持)
```

| 属性             | 常用值                                 |
| -------------- | ----------------------------------- |
| flexDirection  | row / column                        |
| justifyContent | flex-start / center / space-between |
| alignItems     | stretch / center / flex-start       |
| flexWrap       | wrap / nowrap                       |
| gap            | 数值                                  |

示例：

```tsx
{
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
}
```

---

## 2️⃣ 尺寸（Width / Height）

```ts
width
height
minWidth
maxWidth
minHeight
maxHeight
```

支持：

* 数值（dp）
* 百分比字符串 `"50%"`

⚠️ **没有 auto / vh / vw**

---

## 3️⃣ 外边距 & 内边距（Spacing）

```ts
margin
marginTop
marginBottom
marginLeft
marginRight
marginHorizontal
marginVertical

padding
paddingTop
paddingBottom
paddingLeft
paddingRight
paddingHorizontal
paddingVertical
```

---

# 二、定位（Position）— 中高级必会 ⭐⭐⭐⭐

```ts
position
top
bottom
left
right
zIndex
```

| position          | 说明   |
| ----------------- | ---- |
| relative          | 默认   |
| absolute          | 脱离布局 |
| absolute + zIndex | 悬浮层  |

⚠️ `fixed / sticky` ❌ 不支持

---

# 三、边框（Border）— UI 常用 ⭐⭐⭐⭐

```ts
borderWidth
borderColor
borderRadius

borderTopWidth
borderBottomWidth
borderLeftWidth
borderRightWidth

borderStyle (solid / dashed / dotted)
```

### 圆角进阶

```ts
borderTopLeftRadius
borderTopRightRadius
borderBottomLeftRadius
borderBottomRightRadius
```

---

# 四、背景 & 透明度（Background）⭐⭐⭐

```ts
backgroundColor
opacity
```

⚠️ 不支持：

* background-image
* gradient（要用 LinearGradient）

---

# 五、文本样式（Text 专属）⭐⭐⭐⭐⭐

> **仅对 `<Text />` 生效**

```ts
color
fontSize
fontWeight
fontStyle
fontFamily
lineHeight
letterSpacing
textAlign
textAlignVertical (Android)
```

### 文本装饰

```ts
textDecorationLine
textDecorationColor
textDecorationStyle
```

---

# 六、阴影（Shadow）— 平台差异 ⭐⭐⭐

## iOS 阴影

```ts
shadowColor
shadowOffset
shadowOpacity
shadowRadius
```

## Android 阴影

```ts
elevation
```

⚠️ **必须分别写**

---

# 七、变换（Transform）— 动画 / 缩放 ⭐⭐⭐⭐

```ts
transform: [
  { scale: number },
  { scaleX: number },
  { scaleY: number },
  { rotate: "45deg" },
  { translateX: number },
  { translateY: number }
]
```

示例：

```tsx
{
  transform: [{ scale: 1.2 }, { rotate: "10deg" }]
}
```

---

# 八、溢出 & 显示（Overflow / Display）⭐⭐⭐

```ts
overflow: "hidden" | "visible"
```

⚠️

* `display: none` ❌
* 用条件渲染代替

---

# 九、图片专属样式（Image）⭐⭐⭐

```ts
resizeMode
tintColor
```

⚠️ `object-fit` ❌（对应 resizeMode）

---

# 十、列表 & 滚动相关（少量）

```ts
contentContainerStyle // ScrollView / FlatList
```

⚠️ 不是普通 style

---

# 十一、平台专属 & 特殊属性 ⭐⭐

## Android

```ts
includeFontPadding (Text)
elevation
```

## iOS

```ts
shadow*
```

---

# 十二、样式组合规则（必须懂）

## 1️⃣ style 数组（优先级后覆盖前）

```tsx
style={[baseStyle, isActive && activeStyle]}
```

---

## 2️⃣ 样式不会级联（和 CSS 不一样）

* 父 View 的 color ❌ 不会影响子 Text
* 只有 Text 支持继承

---

# 十三、RN vs CSS 不支持对照（非常重要）

❌ RN **不支持**：

* float
* grid
* position: fixed / sticky
* box-shadow（Android）
* background-image
* :hover / :active
* vw / vh / rem

---

# 十四、工程级推荐分类方式（你以后就这样记）

```
1️⃣ Layout（flex / size）
2️⃣ Spacing（margin / padding）
3️⃣ Position（absolute）
4️⃣ Border
5️⃣ Background
6️⃣ Text
7️⃣ Shadow
8️⃣ Transform
```

---

# 十五、工程级一句话总结

> **React Native 的 style = 精简版 Flex + 原生渲染属性**
>
> 会 flex → 已经会 60%
> 会组合 → 再加 30%
> 剩下 10% 是平台差异经验

---

## 下一步我可以继续帮你（直接选）

1️⃣ **RN Style vs CSS 完整对照表**
2️⃣ **写一个“设计系统 Style Token”示例**
3️⃣ **常见 UI（卡片 / 按钮 / 列表）的样式模板**
4️⃣ **Android / iOS 样式差异清单**

你选一个，我直接给你工程级答案。
