下面把你给的 **RN 边框宽度 / 边框颜色 / 圆角**，**完整、精确地转换为 NativeWind（Tailwind / NativeWind v5）**。
我会按 **“能 1:1 映射的直接记，不能 1:1 的给工程级正确解法”** 来讲。

---

# 6️⃣ 边框宽度（Border Width）

## 1) `borderWidth`

| RN               | NativeWind     | 说明     |
| ---------------- | -------------- | ------ |
| `borderWidth: 0` | `border-0`     |        |
| `borderWidth: 1` | `border`       | 默认 1px |
| `borderWidth: 2` | `border-2`     |        |
| `borderWidth: 4` | `border-4`     |        |
| `borderWidth: 3` | `border-[3px]` | 非常规值   |

```tsx
<View className="border" />
<View className="border-2" />
```

---

## 2) 单边边框宽度

| RN                     | NativeWind   |
| ---------------------- | ------------ |
| `borderTopWidth: 1`    | `border-t`   |
| `borderBottomWidth: 1` | `border-b`   |
| `borderLeftWidth: 1`   | `border-l`   |
| `borderRightWidth: 1`  | `border-r`   |
| `borderTopWidth: 2`    | `border-t-2` |
| `borderBottomWidth: 4` | `border-b-4` |

```tsx
<View className="border-t border-b-2" />
```

📌 **规则**

* `t / b / l / r` = 上 / 下 / 左 / 右
* 非 1px 用 `-2 / -4 / [px]`

---

# 6️⃣ 边框颜色（Border Color）

## 1) `borderColor`

| RN                       | NativeWind         |
| ------------------------ | ------------------ |
| `borderColor: '#000'`    | `border-black`     |
| `borderColor: '#fff'`    | `border-white`     |
| `borderColor: '#e5e7eb'` | `border-gray-200`  |
| `borderColor: '#3b82f6'` | `border-blue-500`  |
| 自定义颜色                    | `border-[#ff0000]` |

```tsx
<View className="border border-gray-200" />
```

---

## 2) 单边边框颜色

| RN                             | NativeWind           |
| ------------------------------ | -------------------- |
| `borderTopColor: '#000'`       | `border-t-black`     |
| `borderBottomColor: '#e5e7eb'` | `border-b-gray-200`  |
| `borderLeftColor: '#3b82f6'`   | `border-l-blue-500`  |
| `borderRightColor: '#ff0000'`  | `border-r-[#ff0000]` |

```tsx
<View className="border-t border-t-black border-b border-b-gray-200" />
```

📌 **重要提醒**

> 单边颜色 **一定要配合单边宽度**，否则“看不到”。

---

# 7️⃣ 圆角（Border Radius）

## 1) `borderRadius`

| RN                  | NativeWind       | 近似 px |
| ------------------- | ---------------- | ----- |
| `borderRadius: 4`   | `rounded`        | 4px   |
| `borderRadius: 6`   | `rounded-md`     | 6px   |
| `borderRadius: 8`   | `rounded-lg`     | 8px   |
| `borderRadius: 12`  | `rounded-xl`     | 12px  |
| `borderRadius: 16`  | `rounded-2xl`    | 16px  |
| `borderRadius: 999` | `rounded-full`   | 圆形    |
| `borderRadius: 10`  | `rounded-[10px]` | 非常规   |

```tsx
<View className="rounded-xl" />
```

---

## 2) 单角圆角（非常重要）

| RN                            | NativeWind          |
| ----------------------------- | ------------------- |
| `borderTopLeftRadius: 12`     | `rounded-tl-xl`     |
| `borderTopRightRadius: 12`    | `rounded-tr-xl`     |
| `borderBottomLeftRadius: 12`  | `rounded-bl-xl`     |
| `borderBottomRightRadius: 12` | `rounded-br-xl`     |
| `borderTopLeftRadius: 8`      | `rounded-tl-lg`     |
| `borderBottomRightRadius: 6`  | `rounded-br-md`     |
| `borderTopLeftRadius: 10`     | `rounded-tl-[10px]` |

```tsx
<View className="rounded-tl-xl rounded-br-xl" />
```

---

## 3) 组合写法（项目中最常见）

### RN

```js
{
  borderWidth: 1,
  borderColor: "#e5e7eb",
  borderRadius: 12
}
```

### NativeWind

```tsx
<View className="border border-gray-200 rounded-xl" />
```

---

### RN（卡片只上边有边框）

```js
{
  borderTopWidth: 1,
  borderTopColor: "#000",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12
}
```

### NativeWind

```tsx
<View className="border-t border-t-black rounded-tl-xl rounded-tr-xl" />
```

---

# 🧠 必须记住的 3 条“工程级规则”

### 规则 1️⃣

**没有宽度，颜色无效**

```tsx
border-red-500 ❌
border border-red-500 ✅
```

---

### 规则 2️⃣

**非常规数值 → 用 `[]`**

```tsx
border-[3px]
rounded-[10px]
```

---

### 规则 3️⃣

**圆角优先用语义级别**

* UI 不追求精确 px
* 用 `rounded-lg / xl / 2xl` 更统一

---

## ✅ 和 v5 的关系再强调一次

* 这些 **边框 / 圆角 class**
* **完全不依赖 v4 / v5**
* 属于 Tailwind 的**基础能力**
* v5 中 **100% 可直接使用**

---

如果你愿意，下一步我可以：
1️⃣ 把你一个真实 RN 组件（含边框/圆角）**完整翻成 NativeWind**
2️⃣ 给你一份 **「UI 组件（按钮 / 卡片 / 输入框）NativeWind 模板」**

你选一个，我继续。
