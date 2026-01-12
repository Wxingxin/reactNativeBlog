下面这份是 **React Native `Text` 组件的「属性大全 + 知识点大全」工程级总结**。
我会按你**真实项目里“用得多 / 必须懂 / 不懂就踩坑”**的顺序讲，而不是简单罗列文档。

---

# 一、Text 是什么？一句话定位

> **`Text` 是 React Native 中唯一可以正确显示文字的组件**

- 所有文字 **必须** 包在 `<Text />` 里
- 不能直接在 `<View>` 中写字符串
- 支持嵌套（非常重要）

❌ 错误：

```tsx
<View>Hello</View>
```

✅ 正确：

```tsx
<Text>Hello</Text>
```

---

# 二、最基础用法（你每天都在用）

```tsx
<Text>普通文本</Text>
```

---

# 三、Text 的核心特性（必须理解）

## 1️⃣ Text 支持“嵌套继承样式”（非常重要）

```tsx
<Text style={{ color: "red", fontSize: 16 }}>
  父文本
  <Text style={{ fontWeight: "bold" }}>子文本</Text>
</Text>
```

规则：

- 子 Text **继承父 Text 样式**
- 可局部覆盖
- View ❌ 不支持这样继承

👉 这就是富文本的基础

---

## 2️⃣ Text 是“行内元素”（类似 Web 的 inline）

- 会自动换行
- 不像 View 是块级

---

# 四、常用属性大全（你 90% 会用）

## A. 文本内容与行数控制

### `numberOfLines`

```ts
numberOfLines?: number
```

- 限制最大显示行数
- 超出会截断

```tsx
<Text numberOfLines={1}>超长文本...</Text>
```

---

### `ellipsizeMode`

```ts
"head" | "middle" | "tail" | "clip";
```

```tsx
<Text numberOfLines={1} ellipsizeMode="tail" />
```

常用：

- `tail`（默认）：末尾 ...
- `middle`：中间 ...

---

## B. 文本点击 & 交互

### `onPress`

```ts
onPress?: () => void
```

```tsx
<Text onPress={() => console.log("clicked")}>点击我</Text>
```

👉 轻量交互可直接用 Text
👉 重交互用 Pressable

---

### `suppressHighlighting`（iOS）

- 禁止点击高亮

---

## C. 文本选择 & 复制

### `selectable`

```ts
selectable?: boolean
```

```tsx
<Text selectable>长按可复制</Text>
```

---

### `selectionColor`

- 选中高亮颜色

---

# 五、样式相关属性（非常重要）

## A. 字体 & 排版

| 属性                | 说明                                |
| ------------------- | ----------------------------------- |
| fontSize            | 字号                                |
| fontWeight          | `"normal" \| "bold" \| "100"-"900"` |
| fontStyle           | `"normal" \| "italic"`              |
| fontFamily          | 自定义字体                          |
| lineHeight          | 行高                                |
| letterSpacing       | 字间距                              |
| textAlign           | `"left" \| "center" \| "right"`     |
| textAlignVertical   | Android 垂直对齐                    |
| textDecorationLine  | 下划线/删除线                       |
| textDecorationStyle | solid / dashed                      |
| textDecorationColor | 装饰线颜色                          |

---

## B. 颜色与背景

- `color`
- `backgroundColor`
- `opacity`

---

## C. 阴影（平台差异）

### iOS

```tsx
textShadowColor;
textShadowOffset;
textShadowRadius;
```

### Android

- 无真正 textShadow
- 需用多层 Text 模拟

---

# 六、平台相关属性（要知道）

## iOS 常用

- `adjustsFontSizeToFit`
- `minimumFontScale`
- `allowFontScaling`

## Android 常用

- `textAlignVertical`
- `includeFontPadding`（非常重要）

```tsx
<Text includeFontPadding={false}>
```

👉 可去掉 Android 字体上下默认留白

---

# 七、自动缩放 & 无障碍（专业点）

## `allowFontScaling`

```ts
allowFontScaling?: boolean
```

- 是否跟随系统字体大小
- 默认 true

⚠️ 设计要求“绝对不变”时才设 false

---

## `maxFontSizeMultiplier`

- 限制最大放大倍数

---

# 八、富文本（Text 的杀手级能力）

```tsx
<Text>
  普通
  <Text style={{ color: "red" }}>红色</Text>
  <Text onPress={open}>链接</Text>
</Text>
```

✔ 不用 WebView
✔ 不用第三方库

---

# 九、常见错误 & 坑（一定要看）

## ❗ 1. Text 外面包 Touchable / Pressable？

👉 可以，但 **Text 自带 onPress**，简单点击直接用 Text

---

## ❗ 2. 字体在 Android 上看起来“高”

👉 关掉 `includeFontPadding`

---

## ❗ 3. 行高不对

👉 `lineHeight ≈ fontSize * 1.4`

---

## ❗ 4. Text 里不能直接包 View

```tsx
<Text>
  <View /> ❌
</Text>
```

---

# 十、工程级推荐写法（非常实用）

## 封装一个 AppText（示例）

```tsx
const AppText = ({ style, ...props }) => (
  <Text
    allowFontScaling={false}
    includeFontPadding={false}
    style={[{ color: "#111" }, style]}
    {...props}
  />
);
```

👉 项目统一字体行为

---

# 十一、完整属性速览（常用）

| 分类   | 属性                             |
| ------ | -------------------------------- |
| 内容   | numberOfLines, ellipsizeMode     |
| 交互   | onPress, selectable              |
| 字体   | fontSize, fontWeight, fontFamily |
| 排版   | lineHeight, textAlign            |
| 无障碍 | allowFontScaling                 |
| 平台   | includeFontPadding               |

---

# 十二、工程级一句话总结

> **Text 是 RN 中“最基础但最容易被忽略”的组件**
>
> 理解嵌套 + 行为 + 平台差异，
> 才能把 UI 做“看起来专业”。

---

## 下一步我可以继续帮你（选一个）

1️⃣ **封装统一字体系统（Design Token）**
2️⃣ **Text + i18n 多语言最佳实践**
3️⃣ **复杂富文本（高亮/点击/混排）实战**
4️⃣ **Android / iOS 字体差异完整对照**

你选一个，我直接给你项目级方案。
