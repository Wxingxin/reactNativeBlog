下面这份是 **React Native `ScrollView` 的「属性大全 + 知识点大全」工程级总结**。
我会非常直白地告诉你：**什么时候该用、什么时候绝对不该用、用了会踩什么坑**。
这比死记属性重要得多。

---

# 一、ScrollView 是什么？一句话定位

> **ScrollView = 一次性渲染所有子组件的滚动容器**

* 所有子元素 **一次性渲染进内存**
* 没有虚拟化
* 非常适合：

  * 内容少
  * 固定结构
  * 表单 / 详情页 / 设置页

👉 **不适合长列表**

---

# 二、最基础示例（你一定写过）

```tsx
import { ScrollView, Text } from "react-native";

export default function Demo() {
  return (
    <ScrollView>
      <Text>内容 1</Text>
      <Text>内容 2</Text>
      <Text>内容 3</Text>
    </ScrollView>
  );
}
```

---

# 三、什么时候用 / 什么时候不用（非常重要）

## ✅ 适合用 ScrollView

* 表单页（输入框很多）
* 详情页（图文混排）
* 设置页（选项固定）
* 内容总量 **确定且不大**

## ❌ 绝对不要用 ScrollView

* 长列表
* 无限滚动
* 聊天列表
* 数据量 > 30 条且不确定

👉 这些场景 **必须用 FlatList / SectionList**

---

# 四、核心属性大全（90% 用在这里）

## 1️⃣ `children`

* ScrollView **直接包子元素**
* 不像 FlatList 有 `data`

---

## 2️⃣ `contentContainerStyle`（非常重要）

```tsx
<ScrollView contentContainerStyle={{ padding: 16 }}>
```

👉 **这是给“内容容器”加样式，不是 ScrollView 本身**

常见用途：

* padding
* 垂直居中
* 空态居中

⚠️ 很多人写错成 `style`，导致布局异常

---

## 3️⃣ `style`

* 控制 ScrollView 本身尺寸、背景

```tsx
<ScrollView style={{ flex: 1 }}>
```

---

# 五、滚动方向 & 交互

## 4️⃣ `horizontal`

```ts
horizontal?: boolean
```

* 横向滚动

```tsx
<ScrollView horizontal />
```

---

## 5️⃣ `scrollEnabled`

```ts
scrollEnabled?: boolean
```

* 是否允许滚动
* 嵌套滚动时常用

---

## 6️⃣ `showsVerticalScrollIndicator`

```ts
showsVerticalScrollIndicator?: boolean
```

* 是否显示滚动条（UI 常关）

---

## 7️⃣ `bounces`（iOS）

* 是否允许回弹

---

# 六、键盘 & 输入框（非常关键）

## 8️⃣ `keyboardDismissMode`

```ts
keyboardDismissMode?: "none" | "on-drag" | "interactive"
```

```tsx
<ScrollView keyboardDismissMode="on-drag" />
```

👉 表单页强烈推荐

---

## 9️⃣ `keyboardShouldPersistTaps`（必会）

```ts
keyboardShouldPersistTaps?: "always" | "never" | "handled"
```

| 值       | 含义           |
| ------- | ------------ |
| never   | 点击空白关闭键盘（默认） |
| always  | 点击不关闭        |
| handled | 点击可处理组件不关闭   |

```tsx
<ScrollView keyboardShouldPersistTaps="handled" />
```

👉 否则：按钮点不动、体验很差

---

# 七、滚动事件（慎用）

## 🔟 `onScroll`

```ts
onScroll?: (event) => void
```

* 高频触发
* 动画 / 吸顶 / 渐变

⚠️ 不要写重逻辑

---

## 1️⃣1️⃣ `scrollEventThrottle`

```ts
scrollEventThrottle?: number
```

* 控制 onScroll 触发频率
* 动画常设 `16`

---

# 八、内容大小监听

## 1️⃣2️⃣ `onContentSizeChange`

```ts
onContentSizeChange?: (w, h) => void
```

* 表单高度变化
* 自动滚到底部

```tsx
onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
```

---

# 九、分页 & 吸附（不常用但要知道）

## 1️⃣3️⃣ `pagingEnabled`

* 一屏一屏滑（引导页）

---

## 1️⃣4️⃣ `snapToInterval`

* 按固定距离吸附（横向卡片）

---

# 十、嵌套滚动（Android 易踩坑）

## 1️⃣5️⃣ `nestedScrollEnabled`

```ts
nestedScrollEnabled?: boolean
```

* Android 嵌套 ScrollView / FlatList 时必开

---

# 十一、控制滚动（ref）

```tsx
const ref = useRef<ScrollView>(null);

ref.current?.scrollTo({ y: 200, animated: true });
ref.current?.scrollToEnd();
```

---

# 十二、完整属性速览（常用）

| 属性                           | 说明              |
| ---------------------------- | --------------- |
| style                        | ScrollView 自身样式 |
| contentContainerStyle        | 内容容器样式          |
| horizontal                   | 横向滚动            |
| scrollEnabled                | 是否可滚            |
| showsVerticalScrollIndicator | 滚动条             |
| keyboardDismissMode          | 拖动关闭键盘          |
| keyboardShouldPersistTaps    | 点击行为            |
| onScroll                     | 滚动监听            |
| pagingEnabled                | 分页滑动            |
| nestedScrollEnabled          | 嵌套滚动            |

---

# 十三、常见坑（一定要看）

## ❗ 1. ScrollView 包 FlatList

🚫 几乎一定是设计错误
👉 会导致：

* 性能暴跌
* 滚动冲突

---

## ❗ 2. ScrollView 高度不滚？

👉 没有 `flex:1` 或父容器高度不确定

---

## ❗ 3. 大量子组件导致卡顿

👉 ScrollView **没有虚拟化**

---

# 十四、工程级结论（一句话）

> **ScrollView 是“内容型页面”的最佳工具**
>
> 列表型页面 → FlatList
> 内容型页面 → ScrollView

---

## 下一步你可以选一个继续深入

1️⃣ **ScrollView + 表单 + 键盘完整模板**
2️⃣ **ScrollView vs FlatList vs SectionList 终极对比**
3️⃣ **ScrollView 嵌套滚动完整解决方案（Android）**

你选，我直接给你项目级代码。
