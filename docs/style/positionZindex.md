---
outline: false
---
判定标准：**是否真实生效、是否可控、是否推荐在实际项目中使用**。

符号说明：

* ✅ 可正常使用
* ⚠️ 有限制 / 需注意使用场景
* ❌ 不支持 / 基本无效

---

## 一、`position` 支持情况

> RN 支持：`relative`（默认） / `absolute`
> 不支持：`fixed` / `sticky`

| 组件                  | position | 说明                 |
| ------------------- | -------- | ------------------ |
| **View**            | ✅        | RN 定位基石            |
| **Text**            | ⚠️       | 可用，但文本是内联盒，定位行为不稳定 |
| **Image**           | ✅        | 行为等同 View          |
| **ImageBackground** | ✅        | 容器可定位              |
| **Pressable**       | ✅        | 等同 View            |
| **Button**          | ❌        | 无法控制               |
| **TextInput**       | ✅        | 可用于绝对定位输入框         |
| **Switch**          | ⚠️       | 可设置但视觉和交互不可靠       |
| **ScrollView**      | ⚠️       | 容器可定位，内容滚动仍受自身影响   |
| **FlatList**        | ⚠️       | 同 ScrollView       |
| **SectionList**     | ⚠️       | 同 ScrollView       |
| **SafeAreaView**    | ✅        | 等同 View            |

---

## 二、`top / bottom / left / right` 支持情况

> **只有在 `position: 'absolute'` 或 `'relative'`（相对自身偏移）时才生效**

| 组件                  | top | bottom | left | right | 说明              |
| ------------------- | --- | ------ | ---- | ----- | --------------- |
| **View**            | ✅   | ✅      | ✅    | ✅     | 标准定位            |
| **Text**            | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 行内文本偏移，可能影响排版   |
| **Image**           | ✅   | ✅      | ✅    | ✅     | 可控              |
| **ImageBackground** | ✅   | ✅      | ✅    | ✅     | 可控              |
| **Pressable**       | ✅   | ✅      | ✅    | ✅     | 可控              |
| **Button**          | ❌   | ❌      | ❌    | ❌     | 不可用             |
| **TextInput**       | ✅   | ✅      | ✅    | ✅     | 常用于浮动输入框        |
| **Switch**          | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 原生控件，表现不一致      |
| **ScrollView**      | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 定位的是“滚动容器”，不是内容 |
| **FlatList**        | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 同上              |
| **SectionList**     | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 同上              |
| **SafeAreaView**    | ✅   | ✅      | ✅    | ✅     | 常用于全屏定位         |

---

## 三、`inset` 支持情况

> `inset` 是 RN 新增的 **top/right/bottom/left 简写属性**
> 等价于：`top + right + bottom + left`

| 组件                  | inset | 说明                       |
| ------------------- | ----- | ------------------------ |
| **View**            | ⚠️    | 新版本 RN 可用，需配合 `position` |
| **Text**            | ❌     | 文本不推荐                    |
| **Image**           | ⚠️    | 需新 RN 版本                 |
| **ImageBackground** | ⚠️    | 同 Image                  |
| **Pressable**       | ⚠️    | 同 View                   |
| **Button**          | ❌     | 不支持                      |
| **TextInput**       | ⚠️    | 支持度取决 RN 版本              |
| **Switch**          | ❌     | 不支持                      |
| **ScrollView**      | ❌     | 不推荐                      |
| **FlatList**        | ❌     | 不推荐                      |
| **SectionList**     | ❌     | 不推荐                      |
| **SafeAreaView**    | ⚠️    | 可用但使用较少                  |

📌 **实战建议**：

> 除非你明确项目 RN 版本支持，否则 **优先使用 top / bottom / left / right**，而不是 inset。

---

## 四、`zIndex` 支持情况

> `zIndex` **只在同一父级 + 非 static（即 RN 的 relative / absolute）下生效**

| 组件                  | zIndex | 说明                 |
| ------------------- | ------ | ------------------ |
| **View**            | ✅      | 标准使用               |
| **Text**            | ⚠️     | 文本层级不稳定            |
| **Image**           | ✅      | 可叠加                |
| **ImageBackground** | ✅      | 可叠加                |
| **Pressable**       | ✅      | 常用于遮罩/弹层           |
| **Button**          | ❌      | 不可控                |
| **TextInput**       | ⚠️     | iOS/Android 表现略有差异 |
| **Switch**          | ❌      | 原生控件，不参与 RN 层级     |
| **ScrollView**      | ⚠️     | 容器层级可控，内部内容不       |
| **FlatList**        | ⚠️     | 同 ScrollView       |
| **SectionList**     | ⚠️     | 同上                 |
| **SafeAreaView**    | ✅      | 等同 View            |

---

## 五、非常重要的结论（面试级）

### 1️⃣ RN 没有 `fixed / sticky`

* 悬浮按钮、顶部栏
  👉 **用 `position: 'absolute'` + 父容器撑满屏幕**

### 2️⃣ zIndex 不生效的 90% 原因

* 不在同一父容器
* 没有设置 position
* 被原生控件（如 Switch）遮挡

### 3️⃣ 列表组件永远是“容器定位”

你定位的是：

```txt
FlatList 外壳
不是 item
```

---

## 一句话速记

> **能当 View 用的组件 → 定位和 zIndex 基本都能用**
> **原生控件（Button / Switch）→ 基本不行**
> **列表组件 → 只能定位外壳，不能管内容**

如果你愿意，我可以下一步把
**display / overflow / background / shadow(elevation)**
继续按同样表格方式给你整理完一整套 RN 样式速查表。
