下面把 **RN 的 Transform（变换 & 动画）**，**完整、工程可用地转换为 NativeWind（Tailwind / NativeWind v5）**。
我会非常明确地告诉你：**哪些是 1:1 的、哪些需要注意平台差异、哪些在动画里怎么用**。

---

# 八、Transform（RN → NativeWind 对照）

> RN：

```js
transform: [
  { translateX: 10 },
  { scale: 1.2 },
  { rotate: "45deg" }
];
```

> NativeWind（等价）：

```tsx
<View className="translate-x-2 scale-110 rotate-45" />
```

> 规则：

* **1 个单位 = 4px**
* transform 可以 **任意组合**
* 顺序在 NativeWind 中不敏感（RN 中顺序敏感）

---

## 1️⃣ 位移（translateX / translateY）

### translateX

| RN               | NativeWind           |
| ---------------- | -------------------- |
| `translateX: 4`  | `translate-x-1`      |
| `translateX: 8`  | `translate-x-2`      |
| `translateX: 16` | `translate-x-4`      |
| `translateX: -8` | `-translate-x-2`     |
| `translateX: 10` | `translate-x-[10px]` |

```tsx
<View className="translate-x-2" />
<View className="-translate-x-2" />
```

### translateY

| RN                | NativeWind       |
| ----------------- | ---------------- |
| `translateY: 8`   | `translate-y-2`  |
| `translateY: -16` | `-translate-y-4` |

```tsx
<View className="translate-y-2" />
```

---

## 2️⃣ 缩放（scale / scaleX / scaleY）

### scale

| RN            | NativeWind    |
| ------------- | ------------- |
| `scale: 1`    | `scale-100`   |
| `scale: 1.05` | `scale-105`   |
| `scale: 1.1`  | `scale-110`   |
| `scale: 1.25` | `scale-125`   |
| `scale: 1.2`  | `scale-[1.2]` |

```tsx
<View className="scale-110" />
<View className="scale-[1.2]" />
```

### scaleX / scaleY

| RN            | NativeWind                      |
| ------------- | ------------------------------- |
| `scaleX: 1.2` | `scale-x-125` 或 `scale-x-[1.2]` |
| `scaleY: 0.8` | `scale-y-75` 或 `scale-y-[0.8]`  |

```tsx
<View className="scale-x-125 scale-y-75" />
```

---

## 3️⃣ 旋转（rotate / rotateX / rotateY）

### rotate（2D）

| RN                 | NativeWind       |
| ------------------ | ---------------- |
| `rotate: "0deg"`   | `rotate-0`       |
| `rotate: "45deg"`  | `rotate-45`      |
| `rotate: "90deg"`  | `rotate-90`      |
| `rotate: "-45deg"` | `-rotate-45`     |
| `rotate: "30deg"`  | `rotate-[30deg]` |

```tsx
<View className="rotate-45" />
```

---

### rotateX / rotateY（3D）

⚠️ **重点说明（一定要看）**

* `rotateX / rotateY` 属于 **3D 变换**
* 在 RN 中依赖 **perspective**
* NativeWind **没有稳定的 1:1 工具类**

### 正确做法（工程级）

```tsx
<View
  className="rotate-x-[45deg]"
  style={{ perspective: 1000 }}
/>
```

或直接用 RN style（推荐）：

```tsx
<View
  style={{
    transform: [{ rotateY: "45deg" }],
    perspective: 1000,
  }}
/>
```

👉 **结论**：

> **2D rotate → 用 className**
> **3D rotate → 用 RN style / Reanimated**

---

## 4️⃣ 倾斜（skewX / skewY）

| RN               | NativeWind       |
| ---------------- | ---------------- |
| `skewX: "12deg"` | `skew-x-12`      |
| `skewY: "12deg"` | `skew-y-12`      |
| `skewX: "6deg"`  | `skew-x-6`       |
| `skewY: "-6deg"` | `-skew-y-6`      |
| `skewX: "10deg"` | `skew-x-[10deg]` |

```tsx
<View className="skew-x-12" />
```

---

# 5️⃣ 多 transform 组合（真实项目）

### RN

```js
transform: [
  { translateY: 8 },
  { scale: 1.05 },
  { rotate: "3deg" },
];
```

### NativeWind

```tsx
<View className="translate-y-2 scale-105 rotate-[3deg]" />
```

---

# 6️⃣ Transform + 状态（条件 className）

```tsx
<View
  className={`transition-transform duration-200 ${
    active ? "scale-110 rotate-3" : "scale-100 rotate-0"
  }`}
/>
```

> ⚠️ 注意
>
> * **动画 class（transition / duration）在 RN 中依赖 NativeWind + Reanimated**
> * 对复杂动画，仍然建议用 **react-native-reanimated**

---

# 7️⃣ 和 v5 的关系（非常重要）

### ✅ 完全不受 v5 影响

* `translate-*`
* `scale-*`
* `rotate-*`
* `skew-*`

这些都是 **Tailwind 核心 transform 类**。

### ⚠️ v5 特别说明

* v5 的动画底层切到 **Reanimated**
* **静态 transform**（你现在学的）完全没问题
* **复杂交互动画**：
  👉 NativeWind（样式） + Reanimated（动画值）

---

# 8️⃣ Transform 学习顺序（推荐）

1️⃣ `translateX / translateY`
2️⃣ `scale`
3️⃣ `rotate`
4️⃣ `skew`
5️⃣ 再考虑 `rotateX / rotateY`

---

## 一句“工程级结论”

> **布局用 Flex，位移/缩放/旋转用 Transform，动画交给 Reanimated**
> **NativeWind 负责“写得快、改得快”，不是替代动画引擎**

---

如果你愿意，下一步我可以：
1️⃣ 把 **Transform + Reanimated** 的常见动画（hover / press / enter）写成 NativeWind 风格模板
2️⃣ 给你一份 **「RN Transform → NativeWind 口诀表」**

你选一个，我继续。
