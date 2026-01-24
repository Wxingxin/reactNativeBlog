下面把你这组 **RN Text 样式属性**，按分类转换成 **NativeWind（Tailwind / NativeWind v5）** 的写法，并明确哪些能直接映射、哪些需要用 `[]` 或 “RN style 补充”。

---

# 1) 颜色 `color`

| RN                 | NativeWind       |
| ------------------ | ---------------- |
| `color: '#000'`    | `text-black`     |
| `color: '#fff'`    | `text-white`     |
| `color: '#666'`    | `text-gray-600`  |
| `color: '#3b82f6'` | `text-blue-500`  |
| 自定义颜色              | `text-[#ff5500]` |

示例：

```tsx
<Text className="text-gray-600">hello</Text>
<Text className="text-[#ff5500]">hello</Text>
```

---

# 2) 字体 `fontFamily / fontSize / fontWeight / fontStyle`

## 2.1 `fontSize`

| RN             | NativeWind    |
| -------------- | ------------- |
| `fontSize: 12` | `text-xs`     |
| `fontSize: 14` | `text-sm`     |
| `fontSize: 16` | `text-base`   |
| `fontSize: 18` | `text-lg`     |
| `fontSize: 20` | `text-xl`     |
| `fontSize: 24` | `text-2xl`    |
| 非常规            | `text-[18px]` |

```tsx
<Text className="text-base">Text</Text>
<Text className="text-[18px]">Text</Text>
```

## 2.2 `fontWeight`

| RN                             | NativeWind      |
| ------------------------------ | --------------- |
| `fontWeight: '400'`            | `font-normal`   |
| `fontWeight: '500'`            | `font-medium`   |
| `fontWeight: '600'`            | `font-semibold` |
| `fontWeight: '700'` / `'bold'` | `font-bold`     |

```tsx
<Text className="font-semibold">Text</Text>
```

## 2.3 `fontStyle`

| RN                    | NativeWind   |
| --------------------- | ------------ |
| `fontStyle: 'italic'` | `italic`     |
| `fontStyle: 'normal'` | `not-italic` |

```tsx
<Text className="italic">Text</Text>
```

## 2.4 `fontFamily`

这里要特别说明：**Tailwind 的 `font-sans / font-serif / font-mono` 在 Web 很标准，但 RN 里字体族是否生效，取决于你是否把字体注册成 Tailwind 的 fontFamily**。

### 常用写法（推荐）

* 在 `tailwind.config.js` 里扩展字体，然后用 `font-xxx`：

```js
// tailwind.config.js（示意）
theme: {
  extend: {
    fontFamily: {
      brand: ["YourFontName"],
    },
  },
}
```

组件里：

```tsx
<Text className="font-brand">Text</Text>
```

### 如果你还没做字体映射

先用 RN 原生 style 设置 `fontFamily`，同时用 className 管其它样式（工程里很常见）：

```tsx
<Text style={{ fontFamily: "YourFontName" }} className="text-base font-semibold">
  Text
</Text>
```

---

# 3) 对齐 `textAlign`

| RN                     | NativeWind                   |
| ---------------------- | ---------------------------- |
| `textAlign: 'left'`    | `text-left`                  |
| `textAlign: 'center'`  | `text-center`                |
| `textAlign: 'right'`   | `text-right`                 |
| `textAlign: 'justify'` | `text-justify`（部分环境/字体表现不一致） |

```tsx
<Text className="text-center">Text</Text>
```

---

# 4) 装饰 `textDecorationLine / textDecorationColor / textTransform`

## 4.1 `textDecorationLine`

| RN                                   | NativeWind                  |
| ------------------------------------ | --------------------------- |
| `textDecorationLine: 'underline'`    | `underline`                 |
| `textDecorationLine: 'line-through'` | `line-through`              |
| `textDecorationLine: 'none'`         | `no-underline`（对 underline） |

```tsx
<Text className="underline">Text</Text>
<Text className="line-through">Text</Text>
```

## 4.2 `textDecorationColor`

Tailwind 有 `decoration-*`，但在 RN 的支持情况可能取决于 NativeWind/平台实现。最稳妥两种方式：

* **优先尝试**：

```tsx
<Text className="underline decoration-red-500">Text</Text>
```

* **需要强兼容时**（建议 RN style）：

```tsx
<Text
  className="underline"
  style={{ textDecorationColor: "#ef4444" }}
>
  Text
</Text>
```

## 4.3 `textTransform`

| RN                            | NativeWind    |
| ----------------------------- | ------------- |
| `textTransform: 'uppercase'`  | `uppercase`   |
| `textTransform: 'lowercase'`  | `lowercase`   |
| `textTransform: 'capitalize'` | `capitalize`  |
| `textTransform: 'none'`       | `normal-case` |

```tsx
<Text className="uppercase">hello</Text>
```

---

# 5) 间距 `lineHeight / letterSpacing`

## 5.1 `lineHeight`

| RN               | NativeWind       |
| ---------------- | ---------------- |
| `lineHeight: 16` | `leading-4`      |
| `lineHeight: 20` | `leading-5`      |
| `lineHeight: 24` | `leading-6`      |
| 非常规              | `leading-[22px]` |

```tsx
<Text className="leading-6">Text</Text>
<Text className="leading-[22px]">Text</Text>
```

## 5.2 `letterSpacing`

| RN                   | NativeWind                           |
| -------------------- | ------------------------------------ |
| `letterSpacing: 0`   | `tracking-normal`                    |
| `letterSpacing: 0.5` | `tracking-[0.5px]`（推荐）               |
| `letterSpacing: 1`   | `tracking-[1px]` 或 `tracking-widest` |

```tsx
<Text className="tracking-[0.5px]">Text</Text>
```

> 说明：Tailwind 的 `tracking-*` 是一组预设值，但 RN 项目里你通常会直接用 `tracking-[Npx]` 更贴合设计稿。

---

# 6) 阴影（Text Shadow）`textShadowColor / textShadowOffset / textShadowRadius`

这里要非常明确：**Tailwind 并没有一个稳定、跨 RN 的 text-shadow 工具类映射**。在 RN 里这块通常仍然用 `style` 写，最稳妥。

推荐写法（NativeWind 负责其它，shadow 用 RN style）：

```tsx
<Text
  className="text-xl font-bold text-white"
  style={{
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  }}
>
  Title
</Text>
```

---

# 7) 一份“整合示例”（真实项目常用）

### RN 写法

```js
{
  color: "#111",
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
  textDecorationLine: "underline",
  textTransform: "uppercase",
  lineHeight: 24,
  letterSpacing: 0.5,
}
```

### NativeWind

```tsx
<Text className="text-gray-900 text-base font-semibold text-center underline uppercase leading-6 tracking-[0.5px]">
  Hello
</Text>
```

---

## 你现在最该背的“Text 五件套”（覆盖 80%）

* `text-*`（颜色 / 字号）
* `font-*`（粗细）
* `text-center`（对齐）
* `leading-*`（行高）
* `tracking-*`（字间距）

---

如果你愿意，我可以把你这份“Text 样式大全”继续补全两块你后面肯定会用到的：

1. `numberOfLines / ellipsizeMode`（多行截断）
2. `includeFontPadding / textAlignVertical`（Android 对齐坑）

你想先补哪一个？
