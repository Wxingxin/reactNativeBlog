# React Native 样式速查与补充大全

## 一、布局（Layout · Flexbox 为核心）

⚠️ RN **没有** `display: block / inline`，所有布局基于 **Flexbox（且默认 column）**。

### 1️⃣ Flex 核心属性

| 属性                       | 说明         | 常见值                                                                              |
| -------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `flex`                     | 空间分配权重 | `1`, `2`                                                                            |
| `flexDirection`            | 主轴方向     | `column`(默认), `row`, `row-reverse`, `column-reverse`                              |
| `justifyContent`           | 主轴对齐     | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| `alignItems`               | 交叉轴对齐   | `stretch`(默认), `flex-start`, `center`, `flex-end`, `baseline`                     |
| `alignSelf`                | 单个子项对齐 | `auto`, `flex-start`, `center`, `flex-end`, `stretch`                               |
| `flexWrap`                 | 是否换行     | `nowrap`, `wrap`, `wrap-reverse`                                                    |
| `gap / rowGap / columnGap` | 子元素间距   | `number`                                                                            |
| `flexGrow / flexShrink`    | 放大 / 收缩  | `number`                                                                            |
| `flexBasis`                | 初始尺寸     | `number` / `%`                                                                      |

📌 **经验补充**

- RN 默认 `flexDirection: column`（与 Web 相反）
- `gap` 在旧 RN 版本不支持（Expo / 新版本已可用）

---

## 二、尺寸 & 盒模型（Size & Box Model）

### 2️⃣ 尺寸控制

| 属性                     | 说明                        |
| ------------------------ | --------------------------- |
| `width` / `height`       | 固定尺寸                    |
| `minWidth` / `minHeight` | 最小尺寸                    |
| `maxWidth` / `maxHeight` | 最大尺寸                    |
| `aspectRatio`            | 宽高比（常用于图片 / 视频） |

📌 **补充**

- RN 中 **没有 `%` 高度概念**，除非父容器已确定高度

---

### 3️⃣ 外边距（Margin）

| 属性                         |
| ---------------------------- |
| `margin`                     |
| `marginTop` / `marginBottom` |
| `marginLeft` / `marginRight` |
| `marginHorizontal`           |
| `marginVertical`             |

---

### 4️⃣ 内边距（Padding）

| 属性                           |
| ------------------------------ |
| `padding`                      |
| `paddingTop` / `paddingBottom` |
| `paddingLeft` / `paddingRight` |
| `paddingHorizontal`            |
| `paddingVertical`              |

---

## 三、边框 & 圆角（Border & Radius）

### 5️⃣ 边框宽度

| 属性                |
| ------------------- |
| `borderWidth`       |
| `borderTopWidth`    |
| `borderBottomWidth` |
| `borderLeftWidth`   |
| `borderRightWidth`  |

### 6️⃣ 边框颜色

| 属性                |
| ------------------- |
| `borderColor`       |
| `borderTopColor`    |
| `borderBottomColor` |
| `borderLeftColor`   |
| `borderRightColor`  |

### 7️⃣ 圆角

| 属性                      |
| ------------------------- |
| `borderRadius`            |
| `borderTopLeftRadius`     |
| `borderTopRightRadius`    |
| `borderBottomLeftRadius`  |
| `borderBottomRightRadius` |

⚠️ 注意事项

- Android 对 `dashed / dotted` 支持有限
- 圆角 + `overflow: hidden` 才能裁剪子元素

---

## 四、定位 & 层级（Position & ZIndex）

| 属性                          | 说明                       |
| ----------------------------- | -------------------------- |
| `position`                    | `relative` / `absolute`    |
| `top / bottom / left / right` | 偏移                       |
| `inset`                       | 同时设置四个方向           |
| `zIndex`                      | 层级（需 absolute 才稳定） |

📌 **经验补充**

- Android 中 `zIndex` 需要配合 `position`

---

## 五、颜色 & 背景（Color & Background）

| 属性              | 说明                 |
| ----------------- | -------------------- |
| `backgroundColor` | 背景色               |
| `opacity`         | 透明度（影响子元素） |

📌 **技巧**

- 想只让背景透明：使用 `rgba()`

---

## 六、文本样式（Text 专用）

| 分类 | 属性                                                         |
| ---- | ------------------------------------------------------------ |
| 颜色 | `color`                                                      |
| 字体 | `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`          |
| 对齐 | `textAlign`                                                  |
| 装饰 | `textDecorationLine`, `textDecorationColor`, `textTransform` |
| 间距 | `lineHeight`, `letterSpacing`                                |
| 阴影 | `textShadowColor`, `textShadowOffset`, `textShadowRadius`    |

📌 **重要补充**

- RN 不支持多行 `text-overflow: ellipsis` → 使用 `numberOfLines`

---

## 七、图片样式（Image 专用）

| 属性           | 说明                                              |
| -------------- | ------------------------------------------------- |
| `resizeMode`   | `cover`, `contain`, `stretch`, `repeat`, `center` |
| `tintColor`    | 单色图染色                                        |
| `overlayColor` | Android 专用                                      |
| `borderRadius` | 图片圆角                                          |

---

## 八、变换 & 动画（Transform）

```ts
transform: [{ translateX: 10 }, { scale: 1.2 }, { rotate: "45deg" }];
```

| 类型                         |
| ---------------------------- |
| `translateX / translateY`    |
| `scale / scaleX / scaleY`    |
| `rotate / rotateX / rotateY` |
| `skewX / skewY`              |

📌 **补充**

- `rotate` 必须是字符串（如 `deg`）

---

## 九、溢出 & 可见性（常被忽略）

| 属性       | 说明                 |
| ---------- | -------------------- |
| `overflow` | `visible`, `hidden`  |
| `display`  | `none`（可隐藏组件） |

---

## 十、平台相关样式（Platform Specific）

| 属性            | 说明         |
| --------------- | ------------ |
| `elevation`     | Android 阴影 |
| `shadowColor`   | iOS 阴影     |
| `shadowOffset`  | iOS 阴影     |
| `shadowOpacity` | iOS 阴影     |
| `shadowRadius`  | iOS 阴影     |

---

## 十一、性能 & 实战建议（进阶）

- 避免在 render 中创建新 style 对象 → `StyleSheet.create`
- 动画优先使用 `transform` / `opacity`
- 长列表避免复杂阴影
- 公共样式拆分为 theme / tokens

