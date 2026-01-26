---
outline: false
---

下面按“你在项目里真正会用到的方式”把 RN（React Native）Flex 布局讲清楚，并给出可直接复制的经典代码片段。RN 的 Flex 默认与 Web 有两个关键差异：**默认主轴是 column**，且 **多数布局都靠 flex 体系完成**。

---

## 0) Flex 在 RN 的核心心智模型

* **容器（父）**决定：主轴方向、主轴/交叉轴对齐、换行、间距等
* **子项（子）**决定：占比（flex）、自我对齐（alignSelf）、是否允许收缩/增长等
* 轴的定义：

  * `flexDirection: "row"` → 主轴 X（水平），交叉轴 Y（垂直）
  * `flexDirection: "column"`（默认）→ 主轴 Y（垂直），交叉轴 X（水平）

---

## 1) 你必须掌握的父容器属性

### 1.1 flexDirection（主轴方向）

```tsx
<View style={{ flexDirection: "row" }}>
  <View style={{ width: 50, height: 50, backgroundColor: "#ddd" }} />
  <View style={{ width: 50, height: 50, backgroundColor: "#bbb" }} />
</View>
```

### 1.2 justifyContent（主轴对齐）

常见值：`flex-start | center | flex-end | space-between | space-around | space-evenly`

```tsx
<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
  <Box />
  <Box />
  <Box />
</View>
```

### 1.3 alignItems（交叉轴对齐）

常见值：`stretch | flex-start | center | flex-end | baseline(少用)`

```tsx
<View style={{ height: 120, flexDirection: "row", alignItems: "center" }}>
  <Box size={40} />
  <Box size={70} />
</View>
```

### 1.4 flexWrap（换行）+ alignContent（多行对齐）

做标签/网格时常用：

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start" }}>
  {Array.from({ length: 12 }).map((_, i) => (
    <View key={i} style={{ padding: 10, margin: 6, backgroundColor: "#ddd", borderRadius: 8 }} />
  ))}
</View>
```

### 1.5 gap / rowGap / columnGap（可用但要注意版本）

RN 新版本逐步支持 `gap`，但部分旧环境不稳定；更稳的做法是用 `margin`。

```tsx
<View style={{ flexDirection: "row", gap: 12 }}>
  <Box />
  <Box />
</View>
```

---

## 2) 你必须掌握的子项属性

### 2.1 flex（占比 / 填充剩余空间）

在 RN 里，`flex: 1` 代表“占据可用剩余空间”，多个子项按比例分配：

```tsx
<View style={{ flexDirection: "row", height: 60 }}>
  <View style={{ flex: 1, backgroundColor: "#ddd" }} />
  <View style={{ flex: 2, backgroundColor: "#bbb" }} />
</View>
```

### 2.2 flexGrow / flexShrink / flexBasis（更细粒度控制）

* `flexGrow`：有剩余空间时，是否长大以及长多少
* `flexShrink`：空间不足时，是否收缩
* `flexBasis`：分配前的“基础尺寸”（类似起始宽/高）

```tsx
<View style={{ flexDirection: "row", width: 260 }}>
  <View style={{ flexBasis: 140, flexShrink: 1, backgroundColor: "#ddd", height: 40 }} />
  <View style={{ flexBasis: 140, flexShrink: 1, backgroundColor: "#bbb", height: 40 }} />
</View>
```

### 2.3 alignSelf（单个子项的交叉轴对齐覆盖）

```tsx
<View style={{ height: 120, flexDirection: "row", alignItems: "flex-start" }}>
  <Box size={40} />
  <Box size={40} style={{ alignSelf: "flex-end" }} />
</View>
```

---

## 3) 项目中最常见的布局“模板”（经典写法）

下面这些你基本每天都用。

### 3.1 两端对齐：左标题 + 右按钮（Header 行）

```tsx
<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
  <Text style={{ fontSize: 18, fontWeight: "600" }}>Profile</Text>
  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#eee", borderRadius: 10 }}>
    <Text>Edit</Text>
  </Pressable>
</View>
```

### 3.2 图标 + 文本：左固定宽，右自适应（常见列表项）

关键点：右侧用 `flex: 1` 撑开。

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#ddd" }} />
  <View style={{ flex: 1 }}>
    <Text style={{ fontWeight: "600" }}>Title</Text>
    <Text numberOfLines={1} style={{ color: "#666" }}>A long long description that should truncate…</Text>
  </View>
  <Text style={{ color: "#999" }}>{">"}</Text>
</View>
```

### 3.3 底部固定按钮：上面内容滚动，底部操作区固定

关键点：外层 `flex:1`，内容区 `flex:1`，底部不设 flex。

```tsx
<View style={{ flex: 1 }}>
  <View style={{ flex: 1, padding: 16 }}>
    {/* 内容区（可换 ScrollView） */}
    <Text>Content...</Text>
  </View>

  <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#eee" }}>
    <Pressable style={{ height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#eee" }}>
      <Text>Submit</Text>
    </Pressable>
  </View>
</View>
```

### 3.4 两列布局：左侧固定宽侧边栏 + 右侧内容自适应

```tsx
<View style={{ flex: 1, flexDirection: "row" }}>
  <View style={{ width: 240, backgroundColor: "#f2f2f2" }}>
    <Text style={{ padding: 16 }}>Sidebar</Text>
  </View>
  <View style={{ flex: 1, padding: 16 }}>
    <Text>Main</Text>
  </View>
</View>
```

### 3.5 “卡片网格”：两列等宽 + 自动换行

关键点：使用 `flexWrap` + 每个 item 用百分比宽度。

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 16 }}>
  {Array.from({ length: 8 }).map((_, i) => (
    <View
      key={i}
      style={{
        width: "48%",
        height: 90,
        marginBottom: 12,
        borderRadius: 14,
        backgroundColor: "#eee",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <Text style={{ fontWeight: "600" }}>Card {i + 1}</Text>
    </View>
  ))}
</View>
```

### 3.6 经典“左对齐 + 右自适应换行”：聊天气泡/评论布局

关键点：头像固定，内容 `flex:1`，文本允许换行。

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#ddd" }} />
  <View style={{ flex: 1 }}>
    <Text style={{ fontWeight: "600" }}>User</Text>
    <Text style={{ marginTop: 6 }}>
      This is a message that can wrap into multiple lines without breaking the layout.
    </Text>
  </View>
</View>
```

---

## 4) 常见坑位（你迟早会遇到）

1. **默认是 column**：你以为水平排列但没写 `flexDirection:"row"`
2. **子项不缩**：文本超出一行时，右侧内容容易撑爆

   * 常用解法：右侧 `flex: 1` + 文本 `numberOfLines` 或 `flexShrink: 1`
3. **ScrollView/FlatList 外层必须有 `flex:1`**：否则高度不对
4. **想“撑满高度”**：外层容器要 `flex: 1`，不然里面 `flex:1` 不生效

---

## 5) 给你一个可直接运行的“Flex 示例页面”

```tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

function Box({ size = 40, style }: { size?: number; style?: any }) {
  return <View style={[{ width: size, height: size, borderRadius: 10, backgroundColor: "#ddd" }, style]} />;
}

export default function FlexShowcase() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Flex Showcase</Text>
        <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#eee", borderRadius: 10 }}>
          <Text>Action</Text>
        </Pressable>
      </View>

      {/* Proportional */}
      <View style={{ height: 56, flexDirection: "row", borderRadius: 14, overflow: "hidden" }}>
        <View style={{ flex: 1, backgroundColor: "#ddd" }} />
        <View style={{ flex: 2, backgroundColor: "#bbb" }} />
      </View>

      {/* Align */}
      <View style={{ height: 120, flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#f6f6f6", borderRadius: 14 }}>
        <Box size={36} />
        <Box size={56} />
        <Box size={46} />
      </View>

      {/* Wrap grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={{ width: "48%", height: 80, marginBottom: 12, backgroundColor: "#eee", borderRadius: 14, justifyContent: "center", padding: 12 }}>
            <Text style={{ fontWeight: "600" }}>Card {i + 1}</Text>
          </View>
        ))}
      </View>

      {/* List item */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#f6f6f6", borderRadius: 14 }}>
        <Box size={40} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600" }}>Title</Text>
          <Text numberOfLines={1} style={{ color: "#666" }}>
            A long description that should truncate properly...
          </Text>
        </View>
        <Text style={{ color: "#999" }}>{">"}</Text>
      </View>
    </ScrollView>
  );
}
```

---

如果你希望我进一步“按你的项目风格”整理：

* 你用的是 **NativeWind** 还是纯 `StyleSheet`？
* 你更常做的是 **列表页/详情页/表单页** 哪一类？

我可以把上面这些模板整理成一套“可复用的布局组件”（Row/Column/Spacer/Stack），让你项目里写布局更快更统一。

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
