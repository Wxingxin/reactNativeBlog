下面把 **RN 定位 & 层级（Position & ZIndex）** 按你给的属性，转换为 **NativeWind（Tailwind/NativeWind v5）** 写法，并补充项目里最常见的组合模板与注意事项。

---

# 1) `position`（relative / absolute）

| RN                     | NativeWind | 说明                    |
| ---------------------- | ---------- | --------------------- |
| `position: 'relative'` | `relative` | 默认就是 relative，但写出来更清晰 |
| `position: 'absolute'` | `absolute` | 脱离文档流定位               |

示例：

```tsx
<View className="relative" />
<View className="absolute" />
```

---

# 2) `top / bottom / left / right`（偏移）

| RN          | NativeWind   |
| ----------- | ------------ |
| `top: 0`    | `top-0`      |
| `right: 0`  | `right-0`    |
| `bottom: 0` | `bottom-0`   |
| `left: 0`   | `left-0`     |
| `top: 8`    | `top-2`      |
| `left: 16`  | `left-4`     |
| `right: -8` | `-right-2`   |
| `top: 10`   | `top-[10px]` |

> 规则：Tailwind 仍是 **1 单位 = 4px**；不规则用 `[]`。

示例：

```tsx
<View className="absolute top-0 right-0" />
<View className="absolute -top-2 left-4" />
```

---

# 3) `inset`（同时设置四个方向）

## 3.1 四边同时设置

| RN                                     | NativeWind     |
| -------------------------------------- | -------------- |
| `top: 0; right: 0; bottom: 0; left: 0` | `inset-0`      |
| 四边 8                                   | `inset-2`      |
| 四边 16                                  | `inset-4`      |
| 四边自定义                                  | `inset-[10px]` |

示例：

```tsx
<View className="absolute inset-0" />
```

## 3.2 单轴 inset（很常用）

| RN                  | NativeWind  |
| ------------------- | ----------- |
| `left: 0; right: 0` | `inset-x-0` |
| `top: 0; bottom: 0` | `inset-y-0` |

示例：

```tsx
<View className="absolute inset-x-0 bottom-0" />
```

---

# 4) `zIndex`（层级）

| RN            | NativeWind | 说明  |
| ------------- | ---------- | --- |
| `zIndex: 0`   | `z-0`      |     |
| `zIndex: 10`  | `z-10`     | 常用  |
| `zIndex: 50`  | `z-50`     | 浮层  |
| `zIndex: 999` | `z-[999]`  | 自定义 |

示例：

```tsx
<View className="absolute z-50" />
```

---

# 5) 项目里最常用的“组合模板”

## 5.1 右上角角标 / Badge

```tsx
<View className="relative">
  <Image className="w-12 h-12 rounded-full" source={...} />
  <View className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full bg-red-500" />
</View>
```

## 5.2 全屏遮罩（Modal Backdrop）

```tsx
<View className="absolute inset-0 z-50 bg-black/50" />
```

## 5.3 底部固定栏（Bottom Bar）

```tsx
<View className="absolute inset-x-0 bottom-0 z-50 p-4 bg-white" />
```

## 5.4 贴边覆盖（填满父容器）

前提：父容器要 `relative`

```tsx
<View className="relative">
  <Image className="w-full h-60" source={...} />
  <View className="absolute inset-0 bg-black/30" />
</View>
```

---

# 6) 你写定位时必须记住的 3 条规则（RN 工程实战）

## 规则 1：子元素 absolute，父元素要 relative（最常见 bug）

```tsx
<View className="relative">
  <View className="absolute top-0 right-0" />
</View>
```

## 规则 2：zIndex 想稳定，尽量配合 position（absolute/relative）

你说的“需 absolute 才稳定”在工程上很常见：

* RN 在不同平台/层级嵌套下，单纯 `zIndex` 有时表现不一致
* 最稳定做法：**参与叠放的元素都设置 position（通常 absolute）**

## 规则 3：zIndex 只在“同一 stacking context”下比较

如果你的元素不在同一父级/层级树里，z 再大也可能压不住。此时要调整布局层级，而不是继续加大 z。

---

# 7) 和 NativeWind v5 的关系

定位与 zIndex 的这些类：

* `absolute/relative`
* `top-* / left-* / inset-*`
* `z-*`

都是 Tailwind 的基础类，**v4/v5 写法一致**。v5 主要影响工程配置与动画，并不影响这些定位类的语义。

---

如果你愿意，我可以再把“定位”最容易踩坑的两块补齐（都很实用）：

1. **安全区 SafeAreaView + 顶部状态栏偏移**怎么写（含 `top`/`pt`）
2. **Modal / Toast / Dropdown** 的 zIndex 组织方式（避免“盖不住”）

你想先看哪一个？
