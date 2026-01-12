下面给你一份**React Native `style` 属性大全（系统分类版）**。我会严格按**功能维度**进行分类，并在每一类中说明**作用、常用值、注意事项（RN vs Web 差异）**，这份内容可以直接作为你写 RN 样式时的“速查表”。

---

# 一、布局（Layout）相关

## 1️⃣ Flex 布局（RN 核心，默认 `flexDirection: 'column'`）

| 属性               | 说明                |
| ---------------- | ----------------- |
| `flex`           | 占用剩余空间比例          |
| `flexDirection`  | `row` / `column`  |
| `justifyContent` | 主轴对齐方式            |
| `alignItems`     | 交叉轴对齐             |
| `alignSelf`      | 单个元素对齐            |
| `flexWrap`       | `wrap` / `nowrap` |
| `flexGrow`       | 放大比例              |
| `flexShrink`     | 收缩比例              |
| `flexBasis`      | 初始尺寸              |

```ts
{
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}
```

⚠️ 注意：RN **没有** `display: block / inline`

---

## 2️⃣ 尺寸（Size）

| 属性                       | 说明   |
| ------------------------ | ---- |
| `width`                  | 宽度   |
| `height`                 | 高度   |
| `minWidth` / `minHeight` | 最小尺寸 |
| `maxWidth` / `maxHeight` | 最大尺寸 |
| `aspectRatio`            | 宽高比  |

```ts
{ width: 100, height: 50 }
```

---

## 3️⃣ 定位（Position）

| 属性                                  | 说明                      |
| ----------------------------------- | ----------------------- |
| `position`                          | `relative` / `absolute` |
| `top` / `right` / `bottom` / `left` | 偏移                      |

```ts
{ position: 'absolute', top: 0, right: 0 }
```

---

# 二、边距 & 间距（Spacing）

## 4️⃣ 外边距（Margin）

| 属性                           |
| ---------------------------- |
| `margin`                     |
| `marginTop` / `marginBottom` |
| `marginLeft` / `marginRight` |
| `marginHorizontal`           |
| `marginVertical`             |

---

## 5️⃣ 内边距（Padding）

| 属性                             |
| ------------------------------ |
| `padding`                      |
| `paddingTop` / `paddingBottom` |
| `paddingLeft` / `paddingRight` |
| `paddingHorizontal`            |
| `paddingVertical`              |

---

# 三、边框 & 圆角（Border）

## 6️⃣ 边框宽度

| 属性                  |
| ------------------- |
| `borderWidth`       |
| `borderTopWidth`    |
| `borderBottomWidth` |
| `borderLeftWidth`   |
| `borderRightWidth`  |

---

## 7️⃣ 边框颜色

| 属性                  |
| ------------------- |
| `borderColor`       |
| `borderTopColor`    |
| `borderBottomColor` |
| `borderLeftColor`   |
| `borderRightColor`  |

---

## 8️⃣ 圆角

| 属性                        |
| ------------------------- |
| `borderRadius`            |
| `borderTopLeftRadius`     |
| `borderTopRightRadius`    |
| `borderBottomLeftRadius`  |
| `borderBottomRightRadius` |

⚠️ RN **不支持** `border-style: dashed`（Android 有限制）

---

# 四、颜色 & 背景（Visual）

## 9️⃣ 背景

| 属性                | 说明         |
| ----------------- | ---------- |
| `backgroundColor` | 背景色        |
| `opacity`         | 透明度（影响子元素） |

---

## 1️⃣0️⃣ 阴影（平台差异大）

### iOS

| 属性              |
| --------------- |
| `shadowColor`   |
| `shadowOffset`  |
| `shadowOpacity` |
| `shadowRadius`  |

### Android

| 属性          |
| ----------- |
| `elevation` |

```ts
{
  elevation: 4, // Android
  shadowColor: '#000', // iOS
  shadowOpacity: 0.3
}
```

---

# 五、文本样式（Text 专用）

## 1️⃣1️⃣ 字体

| 属性           |
| ------------ |
| `fontSize`   |
| `fontWeight` |
| `fontFamily` |
| `fontStyle`  |

---

## 1️⃣2️⃣ 文本布局

| 属性                  |
| ------------------- |
| `lineHeight`        |
| `letterSpacing`     |
| `textAlign`         |
| `textAlignVertical` |

---

## 1️⃣3️⃣ 文本装饰

| 属性                    |
| --------------------- |
| `color`               |
| `textDecorationLine`  |
| `textDecorationColor` |
| `textDecorationStyle` |
| `textTransform`       |

---

# 六、图片样式（Image 专用）

## 1️⃣4️⃣ 图片属性

| 属性             |
| -------------- |
| `resizeMode`   |
| `tintColor`    |
| `overlayColor` |

⚠️ `resizeMode` 也可作为 prop 使用

---

# 七、显示 & 可见性

## 1️⃣5️⃣ 显示控制

| 属性                                |
| --------------------------------- |
| `display` (`flex` / `none`)       |
| `overflow` (`hidden` / `visible`) |
| `zIndex`                          |

---

# 八、变换（Transform）

## 1️⃣6️⃣ Transform（数组形式）

```ts
{
  transform: [
    { translateX: 10 },
    { scale: 1.2 },
    { rotate: '45deg' }
  ]
}
```

| 可用变换                         |
| ---------------------------- |
| `translateX / translateY`    |
| `scale / scaleX / scaleY`    |
| `rotate / rotateX / rotateY` |
| `skewX / skewY`              |

---

# 九、交互 & 事件辅助（少量）

## 1️⃣7️⃣ 触摸相关

| 属性                 |
| ------------------ |
| `pointerEvents`    |
| `cursor`（Web only） |

---

# 十、Style 使用方式汇总

## 1️⃣8️⃣ Style 写法

```ts
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  }
});
```

```tsx
<View style={[styles.container, isDark && styles.dark]} />
```

---

# 十一、RN vs Web 样式差异（重点）

| Web CSS      | React Native      |
| ------------ | ----------------- |
| px / rem     | **无单位，直接 number** |
| float        | ❌ 不支持             |
| grid         | ❌ 不支持             |
| vh / vw      | ❌（用 Dimensions）   |
| inline-block | ❌                 |

---

# 十二、记忆口诀（非常实用）

> **布局靠 Flex，间距用 Padding/Margin
> 文字进 Text，图片进 Image
> 阴影分平台，动画用 Transform**

