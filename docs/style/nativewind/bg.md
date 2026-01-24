下面把 **RN 的 颜色 & 背景（Color & Background）**，**精确转换为 NativeWind（Tailwind / NativeWind v5）**，并把工程里**必须知道的差异与坑**一起说明清楚。

---

# 颜色 & 背景（RN → NativeWind）

> 先给结论：
> **背景色 → 用 `bg-*`**
> **整体透明 → 用 `opacity-*`（会影响子元素）**
> **只想背景半透明 → 用 `bg-*/xx`（不要用 opacity）**

---

## 1️⃣ `backgroundColor`（背景色）

### 基础映射（最常用）

| RN                           | NativeWind     |
| ---------------------------- | -------------- |
| `backgroundColor: '#fff'`    | `bg-white`     |
| `backgroundColor: '#000'`    | `bg-black`     |
| `backgroundColor: '#f5f5f5'` | `bg-gray-100`  |
| `backgroundColor: '#e5e7eb'` | `bg-gray-200`  |
| `backgroundColor: '#3b82f6'` | `bg-blue-500`  |
| 自定义颜色                        | `bg-[#ff5500]` |

```tsx
<View className="bg-white" />
<View className="bg-blue-500" />
<View className="bg-[#ff5500]" />
```

📌 **建议**：

* 优先用 **语义色**（`gray-100 / blue-500`）
* 设计稿要求精确色值时，再用 `[#hex]`

---

### 渐变背景（补充说明）

RN 原生 `View` 不支持渐变，NativeWind 也不会魔法支持。
👉 实际项目：**用 `expo-linear-gradient` / `react-native-linear-gradient`**

```tsx
<LinearGradient
  colors={["#3b82f6", "#9333ea"]}
  className="rounded-xl p-4"
/>
```

---

## 2️⃣ `opacity`（透明度：影响子元素）

### 基础映射

| RN              | NativeWind    |
| --------------- | ------------- |
| `opacity: 1`    | `opacity-100` |
| `opacity: 0.75` | `opacity-75`  |
| `opacity: 0.5`  | `opacity-50`  |
| `opacity: 0.25` | `opacity-25`  |
| `opacity: 0.1`  | `opacity-10`  |

```tsx
<View className="opacity-50" />
```

⚠️ **重要特性（一定要记住）**

> `opacity-*` **会影响整个组件树（子元素一起变透明）**

---

## 3️⃣ 只让「背景」半透明（最容易写错）

### ❌ 错误写法（新手常犯）

```tsx
<View className="bg-black opacity-50">
  <Text className="text-white">文字也会变淡 ❌</Text>
</View>
```

### ✅ 正确写法（工程级）

使用 **背景色 + alpha**：

| 效果        | NativeWind       |
| --------- | ---------------- |
| 黑色 50% 背景 | `bg-black/50`    |
| 白色 80% 背景 | `bg-white/80`    |
| 蓝色 30% 背景 | `bg-blue-500/30` |

```tsx
<View className="bg-black/50">
  <Text className="text-white">文字不受影响 ✅</Text>
</View>
```

📌 这是 **RN + NativeWind 中最重要的背景技巧之一**

---

## 4️⃣ `opacity` vs `bg-*/xx` 的选择表（记住这个）

| 需求            | 写法                             |
| ------------- | ------------------------------ |
| 整个组件（含子元素）都变淡 | `opacity-*`                    |
| 只想让背景半透明      | `bg-color/xx`                  |
| 遮罩层（不影响内容）    | `absolute inset-0 bg-black/50` |
| 禁用态（整体灰）      | `opacity-50`                   |

---

## 5️⃣ 常见组合模板（真实项目）

### 5.1 卡片

```tsx
<View className="rounded-xl bg-white p-4">
```

### 5.2 遮罩 / Backdrop

```tsx
<View className="absolute inset-0 bg-black/50" />
```

### 5.3 禁用按钮

```tsx
<Pressable className="rounded-lg bg-blue-500 px-4 py-2 opacity-50">
  <Text className="text-white">Disabled</Text>
</Pressable>
```

### 5.4 悬浮层（背景半透明 + 内容清晰）

```tsx
<View className="rounded-xl bg-white/90 p-4">
  <Text className="text-black">Content</Text>
</View>
```

---

## 6️⃣ 和 NativeWind v5 的关系（再次确认）

* `bg-*`
* `opacity-*`
* `bg-color/xx`

这些都是 **Tailwind 核心能力**
👉 **v4 / v5 写法完全一致**
👉 v5 不会影响你的颜色与背景写法

---

## 一句话总结（请记住）

> **背景色用 `bg-*`，
> 整体透明用 `opacity-*`，
> 背景半透明用 `bg-*/xx`，
> 不要把三者混着用。**

---

如果你愿意，下一步我可以继续帮你整理下一块高频内容之一：
1️⃣ **状态色（hover / press / active / disabled）在 RN 中怎么写**
2️⃣ **暗色模式（dark:）在 Expo + NativeWind v5 的正确用法**

你选一个，我继续。
