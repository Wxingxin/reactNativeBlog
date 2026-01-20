## 布局

| 属性                         | 说明                         | 常见值                                                                              |
| ---------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| **flex**                     | 定义组件如何分配空间         | 数字 (如 `1`)                                                                       |
| **flexDirection**            | 主轴方向                     | `column` (默认), `row`, `row-reverse`, `column-reverse`                             |
| **justifyContent**           | 主轴上的对齐方式             | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| **alignItems**               | 交叉轴上的对齐方式           | `stretch` (默认), `flex-start`, `center`, `flex-end`, `baseline`                    |
| **alignSelf**                | 单个组件在交叉轴上的对齐方式 | `auto`, `flex-start`, `center`, `flex-end`, `stretch`                               |
| **flexWrap**                 | 换行方式                     | `nowrap`, `wrap`, `wrap-reverse`                                                    |
| **gap / rowGap / columnGap** | 子组件之间的间距             | 数字                                                                                |
| **flexGrow / flexShrink**    | 放大/缩小比例                | 数字                                                                                |
| **flexBasis**                | 在分配多余空间之前的默认大小 | 数字, 百分比                                                                        |

## 大小

控制组件的大小以及内外边距。

- **尺寸**: `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `aspectRatio` (宽高比)。
- **外边距 (Margin)**:
- `margin`, `marginTop`, `marginBottom`, `marginLeft`, `marginRight`
- `marginHorizontal` (左右), `marginVertical` (上下)

- **内边距 (Padding)**:
- `padding`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`
- `paddingHorizontal`, `paddingVertical`

## 定位

用于特殊的布局需求。

- **position**: `relative` (默认), `absolute` (绝对定位)。
- **层级**: `zIndex` (数字)。
- **偏移**: `top`, `bottom`, `left`, `right`, `inset` (同时设置四个方向)。


## 文本 颜色 & 背景

专门用于 `Text` 组件的属性。

- **颜色**: `color`。
- **字体**: `fontFamily`, `fontSize`, `fontWeight` (`normal`, `bold`, `100`-`900`), `fontStyle` (`normal`, `italic`)。
- **对齐**: `textAlign` (`auto`, `left`, `right`, `center`, `justify`)。
- **装饰**: `textDecorationLine` (`none`, `underline`, `line-through`), `textDecorationColor`, `textDecorationStyle`。
- **间距**: `lineHeight`, `letterSpacing`。
- **阴影**: `textShadowColor`, `textShadowOffset`, `textShadowRadius`。


## 图片样式(Image 专用)

专门用于 `Image` 组件。

- **缩放模式**: `resizeMode` (`cover`, `contain`, `stretch`, `repeat`, `center`)。
- **着色**: `tintColor` (将图片中的非透明部分染成特定颜色)。
- **其他**: `overlayColor` (Android 专用)。


## 动画

##
