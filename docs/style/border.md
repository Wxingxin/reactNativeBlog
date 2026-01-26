---
outline: false
---


下面把 **React Native 中“边框宽度 / 边框颜色 / 圆角”** 三块一次讲透，全部用**项目里真实会用到的写法**，并配上可直接粘贴的经典代码。

---

# 一、边框宽度（Border Width）

## 1.1 全边框：`borderWidth`

最常见，用于卡片、输入框、按钮描边。

```tsx
<View
  style={{
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 12,
    borderRadius: 12,
  }}
/>
```

---

## 1.2 单边框：Top / Bottom / Left / Right

用于 **分割线 / Header 底线 / List Item 底线**。

### 底部分割线（最常见）

```tsx
<View
  style={{
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  }}
>
  <Text>List Item</Text>
</View>
```

### Header 底部描边

```tsx
<View
  style={{
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  }}
>
  <Text style={{ fontSize: 18, fontWeight: "600" }}>Header</Text>
</View>
```

---

## 1.3 左侧强调边（状态 / 选中态 / 信息条）

```tsx
<View
  style={{
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    padding: 12,
    backgroundColor: "#f5f9ff",
    borderRadius: 12,
  }}
>
  <Text>Info Message</Text>
</View>
```

---

# 二、边框颜色（Border Color）

## 2.1 全边框颜色

必须配合 `borderWidth` 才会显示。

```tsx
<View
  style={{
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
  }}
/>
```

---

## 2.2 单边颜色（和单边宽度搭配）

```tsx
<View
  style={{
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  }}
>
  <Text>Only Top Border</Text>
</View>
```

---

## 2.3 状态驱动边框颜色（输入框 / 错误态）

```tsx
const hasError = true;

<View
  style={{
    borderWidth: 1,
    borderColor: hasError ? "#ef4444" : "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  }}
>
  <TextInput placeholder="Email" />
</View>
```

---

# 三、圆角（Border Radius）

## 3.1 全圆角：`borderRadius`

### 卡片 / 按钮 / 输入框

```tsx
<View
  style={{
    borderRadius: 16,
    backgroundColor: "#f3f3f3",
    padding: 16,
  }}
>
  <Text>Card</Text>
</View>
```

---

## 3.2 单角圆角（常见于卡片顶部 / 底部）

### 只给顶部圆角（Modal / Sheet）

```tsx
<View
  style={{
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    padding: 16,
  }}
>
  <Text>Bottom Sheet</Text>
</View>
```

### 左侧圆角（标签 / Badge）

```tsx
<View
  style={{
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  }}
>
  <Text>Tag</Text>
</View>
```

---

## 3.3 完全圆形（Avatar / Icon Button）

规则：`borderRadius >= width / 2`

```tsx
<View
  style={{
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Text>🙂</Text>
</View>
```

---

## 3.4 圆角 + 边框组合（最常用）

```tsx
<View
  style={{
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
  }}
>
  <Text>Rounded Card with Border</Text>
</View>
```

---

# 四、边框 + 圆角的经典实战组合

## 4.1 列表 Item（底部分割线 + 左右留白）

```tsx
<View
  style={{
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  }}
>
  <Text>List Item</Text>
</View>
```

---

## 4.2 输入框（圆角 + 状态边框）

```tsx
function Input({ error }: { error?: boolean }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: error ? "#ef4444" : "#d1d5db",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <TextInput placeholder="Type here..." />
    </View>
  );
}
```

---

## 4.3 可点击卡片（边框 Hover / Active 思路）

```tsx
<Pressable
  style={({ pressed }) => ({
    borderWidth: 1,
    borderColor: pressed ? "#3b82f6" : "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
  })}
>
  <Text style={{ fontWeight: "600" }}>Press me</Text>
</Pressable>
```

---

## 4.4 图片裁剪成圆角（**重要坑位**）

⚠️ **圆角对 Image 生效，必须配合 `overflow: "hidden"`（Android 尤其重要）**

```tsx
<View style={{ borderRadius: 16, overflow: "hidden" }}>
  <Image
    source={{ uri: "https://picsum.photos/400/300" }}
    style={{ width: "100%", height: 180 }}
    resizeMode="cover"
  />
</View>
```

---

# 五、常见坑位 & 规范建议

### 1️⃣ `borderColor` 不生效？

> 没写 `borderWidth`

### 2️⃣ 圆角没裁剪内容？

> 容器缺少 `overflow: "hidden"`

### 3️⃣ 只想要分割线？

> 用 `borderBottomWidth: StyleSheet.hairlineWidth`

```tsx
import { StyleSheet } from "react-native";

<View
  style={{
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  }}
/>
```

### 4️⃣ 圆角统一规范（推荐）

```ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
```

---

# 六、完整示例：卡片列表（可直接运行）

```tsx
import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";

export default function BorderShowcase() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: pressed ? "#3b82f6" : "#e5e5e5",
            borderRadius: 16,
            padding: 16,
            backgroundColor: "#fff",
            marginBottom: 12,
          })}
        >
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Card {i + 1}</Text>
          <Text style={{ color: "#666", marginBottom: 10 }}>
            Border + Radius 是 RN UI 的基础积木
          </Text>

          <View
            style={{
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "#eee",
              paddingTop: 10,
            }}
          >
            <Text style={{ color: "#999" }}>Detail</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

---

## 总结一句话（记住就够）

* **描边用 borderWidth + borderColor**
* **分割线用 borderBottomWidth**
* **卡片/按钮靠 borderRadius**
* **图片圆角记得 overflow: "hidden"**
* **hairlineWidth 做细分割线**

如果你愿意，下一步我可以把 **border + spacing + flex** 合成一套 **RN UI 设计规范（Design Tokens + 基础组件 Card / ListItem / Input）**，让你在项目里几乎不用再重复写样式。

## 1) Border Width（边框宽度）支持表

| 组件                  | borderWidth | borderTopWidth | borderBottomWidth | borderLeftWidth | borderRightWidth | 备注                            |
| ------------------- | ----------- | -------------- | ----------------- | --------------- | ---------------- | ----------------------------- |
| **View**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 盒模型完整支持                       |
| **Text**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用，但受文本布局影响（行高/换行）            |
| **Image**           | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用（边框围绕图片）                    |
| **ImageBackground** | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用（容器视角）                      |
| **Pressable**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 等价 View                       |
| **Button**          | ❌           | ❌              | ❌                 | ❌               | ❌                | Button 基本无法自定义边框样式            |
| **TextInput**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 常用于输入框描边                      |
| **Switch**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 这是原生控件，边框样式基本不生效              |
| **ScrollView**      | ✅           | ✅              | ✅                 | ✅               | ✅                | 边框作用于容器本身                     |
| **FlatList**        | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 ScrollView（本质基于 ScrollView） |
| **SectionList**     | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 ScrollView                  |
| **SafeAreaView**    | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 View                        |

---

## 2) Border Color（边框颜色）支持表

| 组件                  | borderColor | borderTopColor | borderBottomColor | borderLeftColor | borderRightColor | 备注             |
| ------------------- | ----------- | -------------- | ----------------- | --------------- | ---------------- | -------------- |
| **View**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 完整支持           |
| **Text**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用，但视觉上受文本区域影响 |
| **Image**           | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **ImageBackground** | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **Pressable**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **Button**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 不可控            |
| **TextInput**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 常用             |
| **Switch**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 基本无效           |
| **ScrollView**      | ✅           | ✅              | ✅                 | ✅               | ✅                | 作用于容器          |
| **FlatList**        | ✅           | ✅              | ✅                 | ✅               | ✅                | 同上             |
| **SectionList**     | ✅           | ✅              | ✅                 | ✅               | ✅                | 同上             |
| **SafeAreaView**    | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 View         |

---

## 3) Border Radius（圆角）支持表

| 组件                  | borderRadius | TL | TR | BL | BR | 备注                                     |
| ------------------- | ------------ | -- | -- | -- | -- | -------------------------------------- |
| **View**            | ✅            | ✅  | ✅  | ✅  | ✅  | 完整支持                                   |
| **Text**            | ✅            | ✅  | ✅  | ✅  | ✅  | 可用，但有时需要配合 `overflow: 'hidden'` 才更“干净” |
| **Image**           | ✅            | ✅  | ✅  | ✅  | ✅  | 可用；部分场景也需 `overflow: 'hidden'`（尤其包裹层）  |
| **ImageBackground** | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 容器圆角可行，但**背景图圆角**常需 `imageStyle` 配合    |
| **Pressable**       | ✅            | ✅  | ✅  | ✅  | ✅  | 可用                                     |
| **Button**          | ❌            | ❌  | ❌  | ❌  | ❌  | 不可控                                    |
| **TextInput**       | ✅            | ✅  | ✅  | ✅  | ✅  | 常见输入框圆角                                |
| **Switch**          | ❌            | ❌  | ❌  | ❌  | ❌  | 基本无效                                   |
| **ScrollView**      | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 容器圆角可用；若要裁剪内容通常需 `overflow: 'hidden'`  |
| **FlatList**        | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 同 ScrollView（裁剪/圆角表现依赖 overflow）       |
| **SectionList**     | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 同上                                     |
| **SafeAreaView**    | ✅            | ✅  | ✅  | ✅  | ✅  | 同 View                                 |

> TL/TR/BL/BR 分别是：`borderTopLeftRadius / borderTopRightRadius / borderBottomLeftRadius / borderBottomRightRadius`

---

## 关键注意点（你做项目会频繁遇到）

### 1) Button / Switch 的结论很简单

* **Button：几乎不能自定义边框/圆角/颜色**
* **Switch：border 相关样式基本不生效（原生控件）**
  通常用 **Pressable + 自定义 UI** 替代 Button；Switch 要美化一般用第三方组件或自绘。

### 2) ImageBackground 的圆角要用 `imageStyle`

如果你要“背景图也跟着圆角”，常见写法是：

* 容器：`style={{ borderRadius: 12, overflow: 'hidden' }}`
* 背景图：`imageStyle={{ borderRadius: 12 }}`

（这里我不展开代码，除非你要求“给我示例代码”。）

### 3) 列表容器圆角经常要 `overflow: 'hidden'`

`ScrollView / FlatList / SectionList` 圆角想要“裁剪内容”，一般需要 `overflow: 'hidden'`，否则圆角只是“边框圆”，内容可能仍然是直角。

---

如果你接下来还要继续同样格式，我可以把 **backgroundColor / opacity / elevation/shadow / position** 也按同样表格给你整理出来。
