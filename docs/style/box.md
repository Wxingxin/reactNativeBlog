---
outline: false
---

下面按你给的四块（尺寸控制 / 补充规则 / Margin / Padding），给出 RN 项目里最常用的用法大全与经典代码模板。示例均基于 `View/Text/Image` 的 `style`。

---

## 1) 尺寸控制（width / height / min* / max* / aspectRatio）

### 1.1 固定尺寸：width / height

用于按钮、头像、卡片高度等“设计稿明确尺寸”的元素。

```tsx
<View style={{ width: 120, height: 44, borderRadius: 12, backgroundColor: "#eee" }} />
```

### 1.2 最小尺寸：minWidth / minHeight（常用于按钮可点击区域）

用于：小图标按钮也要有足够点击面积（建议至少 44x44）。

```tsx
<Pressable
  style={{
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#eee",
  }}
>
  <Text>OK</Text>
</Pressable>
```

### 1.3 最大尺寸：maxWidth / maxHeight（常用于限制内容撑爆）

用于：限制图片/卡片/气泡最大宽度。

```tsx
<View style={{ maxWidth: 320, padding: 12, borderRadius: 12, backgroundColor: "#f3f3f3" }}>
  <Text>
    这段文字很多，但容器最大宽度被限制住了，避免在平板或大屏上过宽影响可读性。
  </Text>
</View>
```

### 1.4 自适应尺寸：百分比宽度（常用），百分比高度（有限制）

**宽度 `%` 在 RN 很常见**（网格、占满屏幕等）。
**高度 `%` 只有在父容器高度已确定时才可靠**（你提到的补充点）。

```tsx
<View style={{ width: "100%", height: 56, backgroundColor: "#eee" }} />
```

### 1.5 宽高比：aspectRatio（图片/视频/封面卡片）

* `aspectRatio: 1` → 正方形
* `aspectRatio: 16 / 9` → 16:9

```tsx
<View style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: "#ddd" }} />
```

图片典型写法（封面图铺满容器）：

```tsx
<Image
  source={{ uri: "https://picsum.photos/800/450" }}
  style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 16 }}
  resizeMode="cover"
/>
```

---

## 2) 📌 补充：RN 里“% 高度”为什么经常不生效（以及正确写法）

### 2.1 错误示例：父容器没高度，子元素 height: "50%" 无意义

```tsx
<View>
  <View style={{ height: "50%", backgroundColor: "#eee" }} />
</View>
```

### 2.2 正确示例 A：父容器高度固定/已确定

```tsx
<View style={{ height: 300, backgroundColor: "#fafafa" }}>
  <View style={{ height: "50%", backgroundColor: "#ddd" }} />
</View>
```

### 2.3 正确示例 B：用 flex 替代百分比高度（更推荐）

```tsx
<View style={{ height: 300 }}>
  <View style={{ flex: 1, backgroundColor: "#ddd" }} />
  <View style={{ flex: 1, backgroundColor: "#bbb" }} />
</View>
```

---

## 3) 外边距（Margin）使用大全（布局间距、卡片间距、分隔）

### 3.1 单值 margin：四周一致

```tsx
<View style={{ margin: 16, padding: 12, backgroundColor: "#eee", borderRadius: 12 }} />
```

### 3.2 单方向 marginTop / marginBottom / marginLeft / marginRight

常用：标题与列表、组件之间的垂直间距。

```tsx
<Text style={{ marginBottom: 12, fontSize: 18, fontWeight: "600" }}>Section</Text>
```

### 3.3 水平/垂直快捷：marginHorizontal / marginVertical

用于：页面左右留白、卡片上下分组。

```tsx
<View style={{ marginHorizontal: 16, marginVertical: 10, backgroundColor: "#eee", borderRadius: 12, height: 80 }} />
```

### 3.4 列表场景：item 间距（经典）

更稳的方式：**给 item 加 marginBottom**（比依赖 gap 更兼容）。

```tsx
{data.map((x) => (
  <View key={x.id} style={{ padding: 12, borderRadius: 12, backgroundColor: "#f3f3f3", marginBottom: 12 }}>
    <Text style={{ fontWeight: "600" }}>{x.title}</Text>
  </View>
))}
```

### 3.5 “顶到底”布局：marginTop: "auto"（可用但要谨慎）

在 flex 容器里把某个子项推到底部（在 RN 中通常更推荐用 `justifyContent: "space-between"`）。

```tsx
<View style={{ flex: 1 }}>
  <Text>Content</Text>
  <View style={{ marginTop: "auto", paddingVertical: 12 }}>
    <Text>Footer</Text>
  </View>
</View>
```

---

## 4) 内边距（Padding）使用大全（点击热区、卡片内容、输入框）

### 4.1 单值 padding：四周一致

```tsx
<View style={{ padding: 16, backgroundColor: "#eee", borderRadius: 16 }}>
  <Text>Card content</Text>
</View>
```

### 4.2 单方向 paddingTop / paddingBottom / paddingLeft / paddingRight

用于：只想增大某一侧的留白。

```tsx
<View style={{ paddingTop: 24, paddingHorizontal: 16 }}>
  <Text>顶部更“呼吸感”</Text>
</View>
```

### 4.3 paddingHorizontal / paddingVertical（最常用）

用于：按钮、输入框、卡片统一规范。

```tsx
<Pressable
  style={{
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
  }}
>
  <Text style={{ fontWeight: "600" }}>Button</Text>
</Pressable>
```

### 4.4 点击区域（推荐规范）

视觉上小按钮，但交互必须大：用 padding 或 minWidth/minHeight。

```tsx
<Pressable
  style={{
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  }}
>
  <Text>+</Text>
</Pressable>
```

### 4.5 输入框容器（经典）

```tsx
<View style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "#f3f3f3" }}>
  <TextInput placeholder="Search" style={{ fontSize: 16 }} />
</View>
```

---

## 5) 综合经典案例：页面容器 + 卡片列表 + 图文项（可直接粘贴）

```tsx
import React from "react";
import { View, Text, Image, ScrollView, Pressable } from "react-native";

export default function SpacingShowcase() {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
      {/* 标题：用 marginBottom 控制与内容距离 */}
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 14 }}>Spacing</Text>

      {/* 封面：用 aspectRatio 控制比例 */}
      <Image
        source={{ uri: "https://picsum.photos/800/450" }}
        style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 16, marginBottom: 16 }}
        resizeMode="cover"
      />

      {/* 卡片：padding 负责“内容留白”，margin 负责“卡片间距” */}
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: "#f3f3f3",
            borderRadius: 16,
            padding: 14,
            marginBottom: 12,
            maxWidth: 520,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Card {i + 1}</Text>
          <Text style={{ color: "#666", marginBottom: 12 }}>
            padding 控制卡片内部空间，margin 控制卡片之间的空间。
          </Text>

          <Pressable
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 10,
              minHeight: 44,
              borderRadius: 12,
              backgroundColor: "#e9e9e9",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Action</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
```

---

## 6) 实战建议（你做项目时的默认规则）

* **卡片内部用 padding**；卡片与卡片之间用 marginBottom
* **按钮点击区域**：优先用 `minWidth/minHeight >= 44` 或较大的 padding
* **% 高度能不用就不用**：优先用 `flex` 或确保父容器高度已确定
* **图片/视频统一用 aspectRatio**：少用写死 height（适配更稳）

如果你愿意，我可以按你现在的 RN 技术栈（Expo Router / NativeWind / StyleSheet）把这些整理成一份“项目级 spacing/typography 规范 + 可复用组件（Stack、Spacer、Card）”，让你后续布局几乎不需要重复写 margin/padding。

说明符号含义：

* ✅ **完全支持，常规可用**
* ⚠️ **有限支持 / 不推荐 / 需注意**
* ❌ **不支持 / 基本无效**

---

## 一、样式分类（你给的）

* **尺寸类**

  * `width / height`
  * `minWidth / minHeight`
  * `maxWidth / maxHeight`
  * `aspectRatio`

* **内边距**

  * `padding`
  * `paddingTop / paddingBottom / paddingLeft / paddingRight`
  * `paddingHorizontal / paddingVertical`

* **外边距**

  * `margin`
  * `marginTop / marginBottom / marginLeft / marginRight`
  * `marginHorizontal / marginVertical`

---

## 二、组件 × 样式支持总表

### 1️⃣ 展示类组件

| 组件                  | width / height | min / max | aspectRatio | padding | margin | 说明               |
| ------------------- | -------------- | --------- | ----------- | ------- | ------ | ---------------- |
| **View**            | ✅              | ✅         | ✅           | ✅       | ✅      | RN 布局核心组件        |
| **Text**            | ✅              | ⚠️        | ⚠️          | ⚠️      | ⚠️     | 文本是“内联盒”，布局能力有限  |
| **Image**           | ✅              | ✅         | ✅           | ❌       | ✅      | padding 无效       |
| **ImageBackground** | ✅              | ✅         | ✅           | ✅       | ✅      | 本质是 View + Image |

---

### 2️⃣ 交互类组件

| 组件            | width / height | min / max | aspectRatio | padding | margin | 说明        |
| ------------- | -------------- | --------- | ----------- | ------- | ------ | --------- |
| **Pressable** | ✅              | ✅         | ✅           | ✅       | ✅      | 完全等价 View |
| **Button**    | ❌              | ❌         | ❌           | ❌       | ⚠️     | 几乎不能样式化   |
| **TextInput** | ✅              | ✅         | ⚠️          | ✅       | ✅      | 高度与行数有关   |
| **Switch**    | ⚠️             | ❌         | ❌           | ❌       | ⚠️     | 尺寸基本不可控   |

---

### 3️⃣ 列表类组件

| 组件              | width / height | min / max | aspectRatio | padding | margin | 说明                                  |
| --------------- | -------------- | --------- | ----------- | ------- | ------ | ----------------------------------- |
| **ScrollView**  | ✅              | ✅         | ❌           | ⚠️      | ✅      | padding 推荐用 `contentContainerStyle` |
| **FlatList**    | ✅              | ✅         | ❌           | ⚠️      | ✅      | 同 ScrollView                        |
| **SectionList** | ✅              | ✅         | ❌           | ⚠️      | ✅      | 同 ScrollView                        |

---

### 4️⃣ 布局类组件

| 组件               | width / height | min / max | aspectRatio | padding | margin | 说明             |
| ---------------- | -------------- | --------- | ----------- | ------- | ------ | -------------- |
| **SafeAreaView** | ✅              | ✅         | ❌           | ⚠️      | ✅      | padding 常用于安全区 |

---

## 三、重点说明（非常重要）

### 1️⃣ Button 基本不能用样式（新手大坑）

```jsx
<Button title="确定" />
```

* ❌ 不能 padding
* ❌ 不能 width / height
* ❌ 不能自定义布局

✅ **正确做法**

```jsx
<Pressable style={{ padding: 12, backgroundColor: '#1677ff' }}>
  <Text style={{ color: '#fff' }}>确定</Text>
</Pressable>
```

---

### 2️⃣ ScrollView / FlatList 的 padding 特殊

❌ 不推荐：

```jsx
<ScrollView style={{ padding: 16 }} />
```

✅ 推荐：

```jsx
<ScrollView contentContainerStyle={{ padding: 16 }} />
```

原因：

* `style` 控制容器
* `contentContainerStyle` 控制内容

---

### 3️⃣ Text 的 padding / margin 是“伪支持”

```jsx
<Text style={{ padding: 10, margin: 10 }}>
  文本
</Text>
```

* 可能生效
* 不稳定
* 与平台 / 字体有关

✅ **建议：Text 外包 View**

```jsx
<View style={{ padding: 10 }}>
  <Text>文本</Text>
</View>
```

---

### 4️⃣ Image 没有 padding（新手常错）

```jsx
<Image style={{ padding: 10 }} /> // ❌ 无效
```

✅ 正确方式：

```jsx
<View style={{ padding: 10 }}>
  <Image />
</View>
```

---

## 四、记忆口诀（帮你快速判断）

> **能当 View 用的，样式基本都能用**

* ✅ View
* ✅ Pressable
* ✅ ImageBackground
* ✅ SafeAreaView

> **系统控件，样式能力弱**

* ❌ Button
* ⚠️ Switch

> **列表 padding 用 contentContainerStyle**

* ScrollView
* FlatList
* SectionList

---

如果你愿意，
我可以 **下一步给你一张「RN 组件 = View / 非 View」的分类速查表**，
或者帮你整理一份 **RN 布局样式避坑清单（面试 + 实战版）**。
下面给你一份**React Native 组件 × 布局样式支持表（以你给出的样式为准）**。
我按**是否“真正可用、可控”**来区分，而不是“语法上不报错但效果不可控”。

说明符号含义：

* ✅ **完全支持，常规可用**
* ⚠️ **有限支持 / 不推荐 / 需注意**
* ❌ **不支持 / 基本无效**

---

## 一、样式分类（你给的）

* **尺寸类**

  * `width / height`
  * `minWidth / minHeight`
  * `maxWidth / maxHeight`
  * `aspectRatio`

* **内边距**

  * `padding`
  * `paddingTop / Bottom / Left / Right`
  * `paddingHorizontal / Vertical`

* **外边距**

  * `margin`
  * `marginTop / Bottom / Left / Right`
  * `marginHorizontal / Vertical`

---

## 二、组件 × 样式支持总表

### 1️⃣ 展示类组件

| 组件                  | width / height | min / max | aspectRatio | padding | margin | 说明               |
| ------------------- | -------------- | --------- | ----------- | ------- | ------ | ---------------- |
| **View**            | ✅              | ✅         | ✅           | ✅       | ✅      | RN 布局核心组件        |
| **Text**            | ✅              | ⚠️        | ⚠️          | ⚠️      | ⚠️     | 文本是“内联盒”，布局能力有限  |
| **Image**           | ✅              | ✅         | ✅           | ❌       | ✅      | padding 无效       |
| **ImageBackground** | ✅              | ✅         | ✅           | ✅       | ✅      | 本质是 View + Image |

---

### 2️⃣ 交互类组件

| 组件            | width / height | min / max | aspectRatio | padding | margin | 说明        |
| ------------- | -------------- | --------- | ----------- | ------- | ------ | --------- |
| **Pressable** | ✅              | ✅         | ✅           | ✅       | ✅      | 完全等价 View |
| **Button**    | ❌              | ❌         | ❌           | ❌       | ⚠️     | 几乎不能样式化   |
| **TextInput** | ✅              | ✅         | ⚠️          | ✅       | ✅      | 高度与行数有关   |
| **Switch**    | ⚠️             | ❌         | ❌           | ❌       | ⚠️     | 尺寸基本不可控   |

---

### 3️⃣ 列表类组件

| 组件              | width / height | min / max | aspectRatio | padding | margin | 说明                                  |
| --------------- | -------------- | --------- | ----------- | ------- | ------ | ----------------------------------- |
| **ScrollView**  | ✅              | ✅         | ❌           | ⚠️      | ✅      | padding 推荐用 `contentContainerStyle` |
| **FlatList**    | ✅              | ✅         | ❌           | ⚠️      | ✅      | 同 ScrollView                        |
| **SectionList** | ✅              | ✅         | ❌           | ⚠️      | ✅      | 同 ScrollView                        |

---

### 4️⃣ 布局类组件

| 组件               | width / height | min / max | aspectRatio | padding | margin | 说明             |
| ---------------- | -------------- | --------- | ----------- | ------- | ------ | -------------- |
| **SafeAreaView** | ✅              | ✅         | ❌           | ⚠️      | ✅      | padding 常用于安全区 |

---

## 三、重点说明（非常重要）

### 1️⃣ Button 基本不能用样式（新手大坑）

```jsx
<Button title="确定" />
```

* ❌ 不能 padding
* ❌ 不能 width / height
* ❌ 不能自定义布局

✅ **正确做法**

```jsx
<Pressable style={{ padding: 12, backgroundColor: '#1677ff' }}>
  <Text style={{ color: '#fff' }}>确定</Text>
</Pressable>
```

---

### 2️⃣ ScrollView / FlatList 的 padding 特殊

❌ 不推荐：

```jsx
<ScrollView style={{ padding: 16 }} />
```

✅ 推荐：

```jsx
<ScrollView contentContainerStyle={{ padding: 16 }} />
```

原因：

* `style` 控制容器
* `contentContainerStyle` 控制内容

---

### 3️⃣ Text 的 padding / margin 是“伪支持”

```jsx
<Text style={{ padding: 10, margin: 10 }}>
  文本
</Text>
```

* 可能生效
* 不稳定
* 与平台 / 字体有关

✅ **建议：Text 外包 View**

```jsx
<View style={{ padding: 10 }}>
  <Text>文本</Text>
</View>
```

---

### 4️⃣ Image 没有 padding（新手常错）

```jsx
<Image style={{ padding: 10 }} /> // ❌ 无效
```

✅ 正确方式：

```jsx
<View style={{ padding: 10 }}>
  <Image />
</View>
```

---

## 四、记忆口诀（帮你快速判断）

> **能当 View 用的，样式基本都能用**

* ✅ View
* ✅ Pressable
* ✅ ImageBackground
* ✅ SafeAreaView

> **系统控件，样式能力弱**

* ❌ Button
* ⚠️ Switch

> **列表 padding 用 contentContainerStyle**

* ScrollView
* FlatList
* SectionList

---

如果你愿意，
我可以 **下一步给你一张「RN 组件 = View / 非 View」的分类速查表**，
或者帮你整理一份 **RN 布局样式避坑清单（面试 + 实战版）**。
