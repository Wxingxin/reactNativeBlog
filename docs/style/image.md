---
outline: false
---

> **这些属性并不是都“只属于 Image”，但它们的“语义核心”确实来自 Image。**
> 其中只有 `resizeMode / tintColor / overlayColor` 是 **Image 体系专属或近乎专属**，
> `borderRadius` 则是 **通用视图样式，不是 Image 专用**。

---

## 一、总览结论表（先看）

| 属性               | Image       | ImageBackground | Text | View / Pressable | 其他组件    |
| ---------------- | ----------- | --------------- | ---- | ---------------- | ------- |
| **resizeMode**   | ✅           | ⚠️（imageStyle）  | ❌    | ❌                | ❌       |
| **tintColor**    | ✅           | ⚠️（imageStyle）  | ❌    | ❌                | ❌       |
| **overlayColor** | ⚠️（Android） | ⚠️（Android）     | ❌    | ❌                | ❌       |
| **borderRadius** | ✅           | ✅               | ✅    | ✅                | ✅（大多支持） |

---

## 二、逐个属性详细说明（重点）

### 1️⃣ `resizeMode`

#### 作用

控制 **图片如何在容器中缩放/裁剪**

```txt
cover / contain / stretch / repeat / center
```

#### 支持组件

| 组件                  | 支持情况 | 说明               |
| ------------------- | ---- | ---------------- |
| **Image**           | ✅    | 原生支持             |
| **ImageBackground** | ⚠️   | 需写在 `imageStyle` |
| 其他所有组件              | ❌    | 没有“图片内容”概念       |

📌 关键结论

> **resizeMode 是“图片内容级”属性，不是样式级通用属性**

---

### 2️⃣ `tintColor`

#### 作用

给 **图片本身** 上色（类似 SVG 填充色）

#### 支持组件

| 组件                      | 支持情况 | 说明              |
| ----------------------- | ---- | --------------- |
| **Image**               | ✅    | 常用于 icon / 单色图  |
| **ImageBackground**     | ⚠️   | 通过 `imageStyle` |
| Text / View / Pressable | ❌    | 不渲染图片           |
| Button / Switch         | ❌    | 系统控件            |

⚠️ 注意点（很重要）

* `tintColor` **对彩色照片通常无意义**
* 最适合：**单色 PNG / 图标**

---

### 3️⃣ `overlayColor`

#### 作用

Android 下，用于 `resizeMode="contain"` 时填充空白区域

#### 支持组件

| 组件                  | 支持情况 | 说明           |
| ------------------- | ---- | ------------ |
| **Image**           | ⚠️   | Android only |
| **ImageBackground** | ⚠️   | Android only |
| 其他组件                | ❌    | 不支持          |

📌 实战结论

> * iOS **基本不用**
> * 新项目里使用频率很低
> * 更常见做法：外层 View + backgroundColor 遮罩

---

### 4️⃣ `borderRadius`（⚠️ 重点纠正认知）

#### 作用

圆角 —— **这是通用 View 样式，不是 Image 专用**

#### 支持组件（非常多）

| 组件                        | 支持情况 | 说明                                     |
| ------------------------- | ---- | -------------------------------------- |
| **Image**                 | ✅    | 常用于头像                                  |
| **ImageBackground**       | ⚠️   | 常需 `imageStyle` + `overflow: 'hidden'` |
| **Text**                  | ✅    | 文本背景圆角                                 |
| **View**                  | ✅    | 最常见                                    |
| **Pressable**             | ✅    | 按钮圆角                                   |
| **TextInput**             | ✅    | 输入框                                    |
| **ScrollView / FlatList** | ⚠️   | 需 `overflow: 'hidden'` 才裁剪             |
| **SafeAreaView**          | ✅    | 同 View                                 |

📌 关键认知

> **borderRadius 属于“盒模型样式”，不是图片属性**

---

## 三、为什么你会觉得它们是 “Image 专用”

这是一个**非常典型的学习阶段错觉**，原因有三：

1. `resizeMode / tintColor / overlayColor`

   * **只对图片有意义**
   * 写在其他组件上不会报错，但不会生效

2. `borderRadius`

   * 在 Image 上**使用频率极高**
   * 容易误以为是 Image 特有

3. RN 样式是**弱校验**

   * 不像 CSS 会强提示
   * 很多“无效样式”是“静默失败”

---

## 四、最终权威总结（可以直接记）

### ✅ 真正「Image 体系专属」的属性

```txt
resizeMode
tintColor
overlayColor（Android）
```

### ❌ 不是 Image 专属（通用盒模型）

```txt
borderRadius
```

### 🧠 判断口诀

> **只要属性是“控制图片内容本身的” → Image 专属
> 只要属性是“控制盒子形状的” → 通用 View 样式**

---

如果你愿意，下一步我可以帮你整理一份：

* **Image vs ImageBackground 样式差异速查表**
* **RN 中“写了但 100% 无效”的样式黑名单**
* **图片相关属性在 iOS / Android 的差异清单**

你选一个继续即可。
