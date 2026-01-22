---
outline: false
---
> 本表用于系统回答：**哪些 React Native 组件可以使用哪些 Flex 布局样式**。
> 已补充你遗漏但**最核心的组件：`View`**，并作为判断基准。

说明：

- ✅：完全支持，推荐使用
- ⚠️：可用但有语义或平台限制
- ❌：不支持 / 无意义

---

## 一、Flex 样式范围

| Flex 样式                  |
| -------------------------- |
| `flex`                     |
| `flexDirection`            |
| `justifyContent`           |
| `alignItems`               |
| `alignSelf`                |
| `flexWrap`                 |
| `gap / rowGap / columnGap` |
| `flexGrow / flexShrink`    |
| `flexBasis`                |

---

## 二、布局基准组件（Layout Base）

### 1️⃣ View（布局核心组件）

| 样式                    | 支持 | 说明             |
| ----------------------- | ---- | ---------------- |
| `flex`                  | ✅   | 最常用，占满空间 |
| `flexDirection`         | ✅   | 默认 `column`    |
| `justifyContent`        | ✅   | 主轴布局         |
| `alignItems`            | ✅   | 交叉轴布局       |
| `alignSelf`             | ✅   | 控制自身         |
| `flexWrap`              | ✅   | 支持换行         |
| `gap`                   | ⚠️   | RN 新版本支持    |
| `flexGrow / flexShrink` | ✅   | 完整支持         |
| `flexBasis`             | ✅   | 完整支持         |

📌 **结论：View 是 RN 中唯一的“标准 Flex 容器基准”**

---

## 三、展示类组件（Display）

### 2️⃣ Text（文本）

| 样式                    | 支持 | 说明                 |
| ----------------------- | ---- | -------------------- |
| `flex`                  | ⚠️   | 仅占位，不当容器     |
| `flexDirection`         | ❌   | 不是布局容器         |
| `justifyContent`        | ❌   | 无子布局             |
| `alignItems`            | ❌   | 无意义               |
| `alignSelf`             | ✅   | 控制在父容器中的位置 |
| `flexWrap`              | ❌   | 文本换行不走 flex    |
| `gap`                   | ❌   | 不支持               |
| `flexGrow / flexShrink` | ⚠️   | 在父 flex 中生效     |
| `flexBasis`             | ⚠️   | 少见                 |

---

### 3️⃣ Image（图片）

| 样式                    | 支持 | 说明             |
| ----------------------- | ---- | ---------------- |
| `flex`                  | ✅   | 常用于自适应图片 |
| `flexDirection`         | ❌   | 非容器           |
| `justifyContent`        | ❌   | 无子布局         |
| `alignItems`            | ❌   | 无意义           |
| `alignSelf`             | ✅   | 常用             |
| `flexWrap`              | ❌   | 不支持           |
| `gap`                   | ❌   | 不支持           |
| `flexGrow / flexShrink` | ✅   | 正常             |
| `flexBasis`             | ⚠️   | 偶尔             |

---

### 4️⃣ ImageBackground（背景容器）

| 样式                    | 支持 | 说明       |
| ----------------------- | ---- | ---------- |
| `flex`                  | ✅   | 常用       |
| `flexDirection`         | ✅   | 作为容器   |
| `justifyContent`        | ✅   | 子元素布局 |
| `alignItems`            | ✅   | 子元素布局 |
| `alignSelf`             | ✅   | 控制自身   |
| `flexWrap`              | ⚠️   | 可用但慎用 |
| `gap`                   | ⚠️   | 版本相关   |
| `flexGrow / flexShrink` | ✅   | 正常       |
| `flexBasis`             | ✅   | 正常       |

---

## 四、交互类组件（Interactive）

### 5️⃣ Pressable

| 样式                    | 支持 | 说明      |
| ----------------------- | ---- | --------- |
| `flex`                  | ✅   | 常用      |
| `flexDirection`         | ✅   | 等价 View |
| `justifyContent`        | ✅   | 按钮布局  |
| `alignItems`            | ✅   | 常用      |
| `alignSelf`             | ✅   | 常用      |
| `flexWrap`              | ✅   | 支持      |
| `gap`                   | ⚠️   | 新版本    |
| `flexGrow / flexShrink` | ✅   | 正常      |
| `flexBasis`             | ✅   | 正常      |

---

### 6️⃣ Button（系统按钮）

| 样式                    | 支持 | 说明       |
| ----------------------- | ---- | ---------- |
| `flex`                  | ❌   | 不支持     |
| `flexDirection`         | ❌   | 不支持     |
| `justifyContent`        | ❌   | 不支持     |
| `alignItems`            | ❌   | 不支持     |
| `alignSelf`             | ⚠️   | 有平台差异 |
| `flexWrap`              | ❌   | 不支持     |
| `gap`                   | ❌   | 不支持     |
| `flexGrow / flexShrink` | ❌   | 不支持     |
| `flexBasis`             | ❌   | 不支持     |

---

### 7️⃣ TextInput

| 样式                    | 支持 | 说明     |
| ----------------------- | ---- | -------- |
| `flex`                  | ✅   | 表单常用 |
| `flexDirection`         | ❌   | 非容器   |
| `justifyContent`        | ❌   | 无意义   |
| `alignItems`            | ❌   | 无意义   |
| `alignSelf`             | ✅   | 常用     |
| `flexWrap`              | ❌   | 不支持   |
| `gap`                   | ❌   | 不支持   |
| `flexGrow / flexShrink` | ✅   | 正常     |
| `flexBasis`             | ⚠️   | 少见     |

---

### 8️⃣ Switch

| 样式                    | 支持 | 说明       |
| ----------------------- | ---- | ---------- |
| `flex`                  | ❌   | 固定尺寸   |
| `flexDirection`         | ❌   | 不支持     |
| `justifyContent`        | ❌   | 不支持     |
| `alignItems`            | ❌   | 不支持     |
| `alignSelf`             | ⚠️   | 父容器控制 |
| `flexWrap`              | ❌   | 不支持     |
| `gap`                   | ❌   | 不支持     |
| `flexGrow / flexShrink` | ❌   | 不支持     |
| `flexBasis`             | ❌   | 不支持     |

---

## 五、列表类组件（Scrollable）

### 9️⃣ ScrollView

| 样式                    | 支持 | 说明                       |
| ----------------------- | ---- | -------------------------- |
| `flex`                  | ✅   | 外层常用                   |
| `flexDirection`         | ⚠️   | 写在 contentContainerStyle |
| `justifyContent`        | ⚠️   | 同上                       |
| `alignItems`            | ⚠️   | 同上                       |
| `alignSelf`             | ✅   | 控制自身                   |
| `flexWrap`              | ⚠️   | 内容容器支持               |
| `gap`                   | ⚠️   | 版本相关                   |
| `flexGrow / flexShrink` | ✅   | 正常                       |
| `flexBasis`             | ✅   | 正常                       |

---

### 🔟 FlatList / SectionList

| 样式                    | 支持 | 说明                  |
| ----------------------- | ---- | --------------------- |
| `flex`                  | ✅   | 外层容器              |
| `flexDirection`         | ⚠️   | contentContainerStyle |
| `justifyContent`        | ⚠️   | 同上                  |
| `alignItems`            | ⚠️   | 同上                  |
| `alignSelf`             | ✅   | 控制自身              |
| `flexWrap`              | ❌   | 不支持                |
| `gap`                   | ⚠️   | 新版本                |
| `flexGrow / flexShrink` | ✅   | 正常                  |
| `flexBasis`             | ✅   | 正常                  |

---

## 六、布局安全区组件

### 1️⃣1️⃣ SafeAreaView

| 样式                    | 支持 | 说明     |
| ----------------------- | ---- | -------- |
| `flex`                  | ✅   | 几乎必写 |
| `flexDirection`         | ✅   | 根布局   |
| `justifyContent`        | ✅   | 常用     |
| `alignItems`            | ✅   | 常用     |
| `alignSelf`             | ✅   | 支持     |
| `flexWrap`              | ✅   | 支持     |
| `gap`                   | ⚠️   | 版本相关 |
| `flexGrow / flexShrink` | ✅   | 正常     |
| `flexBasis`             | ✅   | 正常     |

---

## 七、终极速记结论

- **View / Pressable / SafeAreaView / ImageBackground** → 完整 Flex 容器
- **Text / Image / TextInput** → 只能作为 Flex Item
- **ScrollView / FlatList** → 子布局写在 `contentContainerStyle`
- **Button / Switch** → 不参与布局，避免使用

这套表已经是**RN Flex 能力的完整判断模板**。
