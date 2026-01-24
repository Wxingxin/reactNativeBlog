下面是一份 **「RN → NativeWind 对照速查表（精简版）」**，目标只有一个：
👉 **让你看到 RN 样式，就能立刻写出 NativeWind 的 className**

我只保留 **最常用、最值得背、覆盖 80% 场景** 的内容。

---

# 🧠 使用方式（先看）

* **左边：你熟悉的 RN Style**
* **右边：你要写的 NativeWind**
* 不追求 100% 精准像素，只追求 **语义等价**

---

# ① 布局 / Flex（最重要）

| RN Style                          | NativeWind        |
| --------------------------------- | ----------------- |
| `flex: 1`                         | `flex-1`          |
| `flex: 0`                         | `flex-none`       |
| `flexDirection: 'row'`            | `flex-row`        |
| `flexDirection: 'column'`         | `flex-col`        |
| `justifyContent: 'flex-start'`    | `justify-start`   |
| `justifyContent: 'center'`        | `justify-center`  |
| `justifyContent: 'space-between'` | `justify-between` |
| `alignItems: 'flex-start'`        | `items-start`     |
| `alignItems: 'center'`            | `items-center`    |
| `alignItems: 'stretch'`           | `items-stretch`   |
| `alignSelf: 'center'`             | `self-center`     |
| `flexWrap: 'wrap'`                | `flex-wrap`       |
| `gap: 8`                          | `gap-2`           |

📌 口诀：
**主轴 → `justify-*`｜交叉轴 → `items-*`**

---

# ② 间距（Padding / Margin）

> 记住：**1 个单位 = 4px**

| RN Style                | NativeWind |
| ----------------------- | ---------- |
| `padding: 4`            | `p-1`      |
| `padding: 8`            | `p-2`      |
| `padding: 16`           | `p-4`      |
| `paddingHorizontal: 16` | `px-4`     |
| `paddingVertical: 8`    | `py-2`     |
| `marginTop: 12`         | `mt-3`     |
| `marginBottom: 8`       | `mb-2`     |
| `marginLeft: 16`        | `ml-4`     |
| `marginRight: 16`       | `mr-4`     |

📌 方向记忆：

* `x`：左右
* `y`：上下
* `t b l r`：上/下/左/右

---

# ③ 尺寸（Width / Height）

| RN Style         | NativeWind      |
| ---------------- | --------------- |
| `width: '100%'`  | `w-full`        |
| `height: '100%'` | `h-full`        |
| `width: 100`     | `w-[100px]`     |
| `height: 48`     | `h-12`          |
| `minHeight: 48`  | `min-h-12`      |
| `maxWidth: 320`  | `max-w-[320px]` |

📌 **数字不整除 4 时** → 用 `[]`

---

# ④ 背景 & 颜色

| RN Style                     | NativeWind      |
| ---------------------------- | --------------- |
| `backgroundColor: '#fff'`    | `bg-white`      |
| `backgroundColor: '#000'`    | `bg-black`      |
| `backgroundColor: '#f5f5f5'` | `bg-gray-100`   |
| `color: '#000'`              | `text-black`    |
| `color: '#666'`              | `text-gray-600` |
| `opacity: 0.5`               | `opacity-50`    |

📌 Tailwind 用 **语义色**，不是精确 hex

---

# ⑤ 文本（Text）

| RN Style              | NativeWind      |
| --------------------- | --------------- |
| `fontSize: 12`        | `text-xs`       |
| `fontSize: 14`        | `text-sm`       |
| `fontSize: 16`        | `text-base`     |
| `fontSize: 20`        | `text-xl`       |
| `fontWeight: 'bold'`  | `font-bold`     |
| `fontWeight: '600'`   | `font-semibold` |
| `textAlign: 'center'` | `text-center`   |
| `lineHeight: 24`      | `leading-6`     |

---

# ⑥ 圆角 / 边框

| RN Style                 | NativeWind        |
| ------------------------ | ----------------- |
| `borderRadius: 6`        | `rounded-md`      |
| `borderRadius: 8`        | `rounded-lg`      |
| `borderRadius: 12`       | `rounded-xl`      |
| `borderWidth: 1`         | `border`          |
| `borderColor: '#e5e7eb'` | `border-gray-200` |

---

# ⑦ 阴影（常用即可）

| RN Style       | NativeWind              |
| -------------- | ----------------------- |
| `elevation: 1` | `elevation-xs`          |
| `elevation: 2` | `elevation-sm`          |
| iOS 阴影组合       | `shadow-sm / shadow-md` |

📌 v5 阴影是 **boxShadow 语义**，不再完全等价 RN shadow

---

# ⑧ 定位（Position）

| RN Style               | NativeWind |
| ---------------------- | ---------- |
| `position: 'absolute'` | `absolute` |
| `top: 0`               | `top-0`    |
| `bottom: 0`            | `bottom-0` |
| `left: 0`              | `left-0`   |
| `right: 0`             | `right-0`  |
| `zIndex: 10`           | `z-10`     |

---

# ⑨ 常见组合模板（直接套）

### 居中容器

```tsx
<View className="flex-1 items-center justify-center bg-white" />
```

### 横向列表项

```tsx
<View className="flex-row items-center px-4 py-3">
```

### 按钮

```tsx
<Pressable className="rounded-xl bg-black px-4 py-3">
  <Text className="text-white text-center">Submit</Text>
</Pressable>
```

### 卡片

```tsx
<View className="rounded-2xl bg-white p-4 shadow-sm">
```

---

# ⑩ 学习顺序（真的很重要）

1️⃣ Flex + 对齐
2️⃣ Padding / Margin
3️⃣ 背景 / 文本
4️⃣ 圆角 / 边框
5️⃣ 阴影 / 定位（用到再查）

---

## ✅ 一句判断你是否“入门成功”

当你看到：

```js
{
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
}
```

你能立刻写出：

```tsx
<View className="flex-1 items-center justify-between px-4" />
```

你就已经**完全走在正确的路上了**。

---

如果你愿意，下一步我可以：

* 拿 **你真实项目中的 StyleSheet**，逐行帮你翻成 NativeWind
* 或给你做一份 **可打印 A4 的速查图表（极限精简）**

你选一个，我继续带你。
