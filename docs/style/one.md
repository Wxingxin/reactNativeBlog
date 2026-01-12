React Native 的样式（Style）很大程度上借鉴了 CSS，但它是 CSS 的一个**子集**，并且使用了 **Flexbox** 作为核心布局引擎。

为了方便你查阅，我将这些属性分成了以下几大类：

---

## 1. 布局属性 (Flexbox Layout)

这是 React Native 最核心的布局方式。

| 属性 | 说明 | 常见值 |
| --- | --- | --- |
| **flex** | 定义组件如何分配空间 | 数字 (如 `1`) |
| **flexDirection** | 主轴方向 | `column` (默认), `row`, `row-reverse`, `column-reverse` |
| **justifyContent** | 主轴上的对齐方式 | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| **alignItems** | 交叉轴上的对齐方式 | `stretch` (默认), `flex-start`, `center`, `flex-end`, `baseline` |
| **alignSelf** | 单个组件在交叉轴上的对齐方式 | `auto`, `flex-start`, `center`, `flex-end`, `stretch` |
| **flexWrap** | 换行方式 | `nowrap`, `wrap`, `wrap-reverse` |
| **gap / rowGap / columnGap** | 子组件之间的间距 | 数字 |
| **flexGrow / flexShrink** | 放大/缩小比例 | 数字 |
| **flexBasis** | 在分配多余空间之前的默认大小 | 数字, 百分比 |

---

## 2. 尺寸与间距 (Dimension & Spacing)

控制组件的大小以及内外边距。

* **尺寸**: `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `aspectRatio` (宽高比)。
* **外边距 (Margin)**:
* `margin`, `marginTop`, `marginBottom`, `marginLeft`, `marginRight`
* `marginHorizontal` (左右), `marginVertical` (上下)


* **内边距 (Padding)**:
* `padding`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`
* `paddingHorizontal`, `paddingVertical`



---

## 3. 定位 (Positioning)

用于特殊的布局需求。

* **position**: `relative` (默认), `absolute` (绝对定位)。
* **层级**: `zIndex` (数字)。
* **偏移**: `top`, `bottom`, `left`, `right`, `inset` (同时设置四个方向)。

---

## 4. 视图与背景 (View Styles)

主要用于 `View` 组件的视觉呈现。

* **背景**: `backgroundColor`, `opacity` (透明度 0-1)。
* **边距圆角**: `borderRadius`, `borderTopLeftRadius`, `borderTopRightRadius` 等。
* **边框**:
* `borderWidth`, `borderTopWidth` 等。
* `borderColor`, `borderTopColor` 等。
* `borderStyle`: `solid`, `dotted`, `dashed`。


* **溢出**: `overflow` (`visible`, `hidden`, `scroll`)。

---

## 5. 文本样式 (Text Styles)

专门用于 `Text` 组件的属性。

* **颜色**: `color`。
* **字体**: `fontFamily`, `fontSize`, `fontWeight` (`normal`, `bold`, `100`-`900`), `fontStyle` (`normal`, `italic`)。
* **对齐**: `textAlign` (`auto`, `left`, `right`, `center`, `justify`)。
* **装饰**: `textDecorationLine` (`none`, `underline`, `line-through`), `textDecorationColor`, `textDecorationStyle`。
* **间距**: `lineHeight`, `letterSpacing`。
* **阴影**: `textShadowColor`, `textShadowOffset`, `textShadowRadius`。

---

## 6. 图片样式 (Image Styles)

专门用于 `Image` 组件。

* **缩放模式**: `resizeMode` (`cover`, `contain`, `stretch`, `repeat`, `center`)。
* **着色**: `tintColor` (将图片中的非透明部分染成特定颜色)。
* **其他**: `overlayColor` (Android 专用)。

---

## 7. 阴影与变换 (Shadow & Transform)

### 阴影 (Shadow)

> **注意**：React Native 的阴影处理在 iOS 和 Android 上是不同的。

* **iOS**:
* `shadowColor`, `shadowOffset` ({width, height}), `shadowOpacity`, `shadowRadius`。


* **Android**:
* **elevation**: 唯一属性，通过数字控制高度产生的阴影。



### 变换 (Transform)

用于旋转、缩放、平移。

* **transform**: 接受一个数组，例如：`[{ rotate: '45deg' }, { scale: 2 }, { translateX: 10 }]`。

---

## 8. 其他常用

* **backfaceVisibility**: `visible`, `hidden` (翻转动画时是否显示背面)。
* **display**: `flex`, `none` (隐藏组件建议用 `none`)。

---

### 💡 提示：

在 React Native 中，所有的数值默认单位都是 **dp**（与设备无关的像素），不需要写 `px`。百分比需要写成字符串形式，例如 `width: '50%'`。

**你想深入了解其中的某一部分（比如如何实现复杂的阴影效果，或者 Flexbox 的高级用法）吗？**