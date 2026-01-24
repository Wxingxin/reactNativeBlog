下面把你列的 **RN 尺寸类 + 内外边距**，系统转换成 **NativeWind（Tailwind/NativeWind v5）** 的写法。保持“精简但可直接用”。

---

# 一、尺寸类（Size）

## 1) width / height

| RN               | NativeWind  | 说明                 |
| ---------------- | ----------- | ------------------ |
| `width: '100%'`  | `w-full`    | 最常用                |
| `height: '100%'` | `h-full`    |                    |
| `width: 0`       | `w-0`       |                    |
| `height: 0`      | `h-0`       |                    |
| `width: 48`      | `w-12`      | 48px = 12×4        |
| `height: 48`     | `h-12`      |                    |
| `width: 100`     | `w-[100px]` | 非 4 倍数/不在预设里用 `[]` |
| `height: 72`     | `h-[72px]`  |                    |

**常用预设（记住这几个就够）**

* `w-full / h-full`
* `w-screen / h-screen`（如果你的环境支持对应语义；不确定时优先 `w-full/h-full`）
* `w-1/2 / w-1/3 / w-2/3`（比例）

示例：

```tsx
<View className="w-full h-12" />
<View className="w-[100px] h-[72px]" />
```

---

## 2) minWidth / minHeight

| RN                 | NativeWind      |
| ------------------ | --------------- |
| `minWidth: 48`     | `min-w-12`      |
| `minHeight: 48`    | `min-h-12`      |
| `minWidth: 100`    | `min-w-[100px]` |
| `minHeight: '50%'` | `min-h-[50%]`   |

示例：

```tsx
<View className="min-w-12 min-h-12" />
```

---

## 3) maxWidth / maxHeight

| RN                  | NativeWind      |
| ------------------- | --------------- |
| `maxWidth: 320`     | `max-w-[320px]` |
| `maxHeight: 400`    | `max-h-[400px]` |
| `maxWidth: '100%'`  | `max-w-full`    |
| `maxHeight: '100%'` | `max-h-full`    |

示例：

```tsx
<View className="max-w-[320px] max-h-[400px]" />
```

---

## 4) aspectRatio

| RN                  | NativeWind                       | 说明   |
| ------------------- | -------------------------------- | ---- |
| `aspectRatio: 1`    | `aspect-square` 或 `aspect-[1]`   | 1:1  |
| `aspectRatio: 16/9` | `aspect-video` 或 `aspect-[16/9]` | 16:9 |
| `aspectRatio: 4/3`  | `aspect-[4/3]`                   | 常用   |

示例：

```tsx
<View className="w-full aspect-video" />
<View className="w-40 aspect-square" />
```

---

# 二、内边距（Padding）

## 1) padding

| RN            | NativeWind       |
| ------------- | ---------------- |
| `padding: 4`  | `p-1`            |
| `padding: 8`  | `p-2`            |
| `padding: 12` | `p-3`            |
| `padding: 16` | `p-4`            |
| `padding: 20` | `p-5`            |
| `padding: 24` | `p-6`            |
| `padding: 10` | `p-[10px]`（不常见值） |

示例：

```tsx
<View className="p-4" />
```

---

## 2) paddingTop / Bottom / Left / Right

| RN                 | NativeWind |
| ------------------ | ---------- |
| `paddingTop: 16`   | `pt-4`     |
| `paddingBottom: 8` | `pb-2`     |
| `paddingLeft: 12`  | `pl-3`     |
| `paddingRight: 20` | `pr-5`     |

示例：

```tsx
<View className="pt-4 pb-2 pl-3 pr-5" />
```

---

## 3) paddingHorizontal / paddingVertical

| RN                      | NativeWind |
| ----------------------- | ---------- |
| `paddingHorizontal: 16` | `px-4`     |
| `paddingVertical: 8`    | `py-2`     |

示例：

```tsx
<View className="px-4 py-2" />
```

---

# 三、外边距（Margin）

## 1) margin

| RN           | NativeWind |
| ------------ | ---------- |
| `margin: 4`  | `m-1`      |
| `margin: 8`  | `m-2`      |
| `margin: 12` | `m-3`      |
| `margin: 16` | `m-4`      |
| `margin: 24` | `m-6`      |
| `margin: 10` | `m-[10px]` |

示例：

```tsx
<View className="m-4" />
```

---

## 2) marginTop / Bottom / Left / Right

| RN                | NativeWind |
| ----------------- | ---------- |
| `marginTop: 16`   | `mt-4`     |
| `marginBottom: 8` | `mb-2`     |
| `marginLeft: 12`  | `ml-3`     |
| `marginRight: 20` | `mr-5`     |

示例：

```tsx
<View className="mt-4 mb-2 ml-3 mr-5" />
```

---

## 3) marginHorizontal / marginVertical

| RN                     | NativeWind |
| ---------------------- | ---------- |
| `marginHorizontal: 16` | `mx-4`     |
| `marginVertical: 8`    | `my-2`     |

示例：

```tsx
<View className="mx-4 my-2" />
```

---

# 四、两条必须记住的规则（避免你卡住）

### 规则 1：Tailwind 默认间距单位是 4px

* `p-4` = 16px
* `mt-3` = 12px
  所以 RN 的 8/12/16/20/24 很好映射。

### 规则 2：遇到“不规则值”，直接用 `[]`

* `width: 37` → `w-[37px]`
* `padding: 10` → `p-[10px]`
* `height: '45%'` → `h-[45%]`

---

# 五、整合示例（你会在项目里经常写）

### RN

```js
{
  width: "100%",
  minHeight: 48,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginTop: 8
}
```

### NativeWind

```tsx
<View className="w-full min-h-12 px-4 py-3 mt-2" />
```

---

如果你把你某个真实组件的 RN 样式（StyleSheet 那段）贴出来，我可以把它完整翻译成 NativeWind，并给你解释每一段为什么这么映射。
