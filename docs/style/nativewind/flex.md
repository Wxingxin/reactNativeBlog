下面把你给的 **RN Flex 相关属性**，**一一转换成 NativeWind（Tailwind / NativeWind v5）写法**。
我会按 **「属性 → RN → NativeWind」** 的方式给你，并标注**能不能完全等价**，哪些是**要注意的坑**。

---

# RN → NativeWind（Flex 对照表 · 精准版）

> 说明：
>
> * NativeWind 本质是 **Tailwind Flex 工具类**
> * 绝大多数 flex 属性是 **1:1 映射**
> * 少数（`flexGrow / flexShrink / flexBasis`）需要理解 Tailwind 的写法

---

## 1️⃣ `flex`（空间分配权重）

| RN        | NativeWind  | 说明       |
| --------- | ----------- | -------- |
| `flex: 1` | `flex-1`    | 最常用      |
| `flex: 2` | `flex-[2]`  | 非常用，需自定义 |
| `flex: 0` | `flex-none` | 不拉伸      |

✅ **完全等价**

```tsx
<View className="flex-1" />
```

---

## 2️⃣ `flexDirection`（主轴方向）

| RN               | NativeWind         |
| ---------------- | ------------------ |
| `column`（默认）     | `flex-col`         |
| `row`            | `flex-row`         |
| `row-reverse`    | `flex-row-reverse` |
| `column-reverse` | `flex-col-reverse` |

✅ **完全等价**

```tsx
<View className="flex-row" />
```

---

## 3️⃣ `justifyContent`（主轴对齐）

| RN              | NativeWind        |
| --------------- | ----------------- |
| `flex-start`    | `justify-start`   |
| `center`        | `justify-center`  |
| `flex-end`      | `justify-end`     |
| `space-between` | `justify-between` |
| `space-around`  | `justify-around`  |
| `space-evenly`  | `justify-evenly`  |

✅ **完全等价**

```tsx
<View className="justify-between" />
```

📌 记忆规则：

> **主轴 = justify-***

---

## 4️⃣ `alignItems`（交叉轴对齐）

| RN            | NativeWind       |
| ------------- | ---------------- |
| `stretch`（默认） | `items-stretch`  |
| `flex-start`  | `items-start`    |
| `center`      | `items-center`   |
| `flex-end`    | `items-end`      |
| `baseline`    | `items-baseline` |

✅ **完全等价**

```tsx
<View className="items-center" />
```

📌 记忆规则：

> **交叉轴 = items-***

---

## 5️⃣ `alignSelf`（单个子项对齐）

| RN           | NativeWind     |
| ------------ | -------------- |
| `auto`       | `self-auto`    |
| `flex-start` | `self-start`   |
| `center`     | `self-center`  |
| `flex-end`   | `self-end`     |
| `stretch`    | `self-stretch` |

✅ **完全等价（用于子元素）**

```tsx
<Text className="self-end" />
```

---

## 6️⃣ `flexWrap`（是否换行）

| RN             | NativeWind          |
| -------------- | ------------------- |
| `nowrap`       | `flex-nowrap`       |
| `wrap`         | `flex-wrap`         |
| `wrap-reverse` | `flex-wrap-reverse` |

✅ **完全等价**

```tsx
<View className="flex-row flex-wrap" />
```

---

## 7️⃣ `gap / rowGap / columnGap`（子元素间距）

| RN              | NativeWind |
| --------------- | ---------- |
| `gap: 8`        | `gap-2`    |
| `rowGap: 8`     | `gap-y-2`  |
| `columnGap: 16` | `gap-x-4`  |

⚠️ **注意**

* RN 较新版本才支持 `gap`
* NativeWind / Tailwind 写法更成熟

```tsx
<View className="flex-row gap-2" />
```

---

## 8️⃣ `flexGrow / flexShrink`

| RN              | NativeWind | 说明   |
| --------------- | ---------- | ---- |
| `flexGrow: 1`   | `grow`     | 等价   |
| `flexGrow: 0`   | `grow-0`   |      |
| `flexShrink: 1` | `shrink`   | 默认   |
| `flexShrink: 0` | `shrink-0` | 防止压缩 |

✅ **等价，但用得比 RN 少**

```tsx
<View className="grow shrink-0" />
```

---

## 9️⃣ `flexBasis`（初始尺寸）

| RN                  | NativeWind                  |
| ------------------- | --------------------------- |
| `flexBasis: 0`      | `basis-0`                   |
| `flexBasis: 'auto'` | `basis-auto`                |
| `flexBasis: 100`    | `basis-[100px]`             |
| `flexBasis: '50%'`  | `basis-1/2` 或 `basis-[50%]` |

⚠️ **注意**

* 常见百分比（1/2、1/3）有现成类
* 非常规值用 `[]`

```tsx
<View className="basis-1/2" />
```

---

# 🔟 一张「整体翻译示例」（非常重要）

### RN Style

```js
{
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8
}
```

### NativeWind

```tsx
<View className="flex-1 flex-row justify-between items-center flex-wrap gap-2" />
```

---

# 🧠 终极心智模型（请记住）

| 概念    | NativeWind 关键词           |
| ----- | ------------------------ |
| 主轴对齐  | `justify-*`              |
| 交叉轴对齐 | `items-*`                |
| 子项对齐  | `self-*`                 |
| 方向    | `flex-row / flex-col`    |
| 空间权重  | `flex-* / grow / shrink` |

---

## 如果你愿意，下一步我可以帮你做两件非常“提速”的事之一：

1️⃣ **把你 RN 的某个真实组件样式，完整翻译成 NativeWind**
2️⃣ 给你一份 **「Flex 布局 → NativeWind 心智图（口诀版）」**

你选一个，我继续。
