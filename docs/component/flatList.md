下面这份是 **React Native `FlatList` 的「属性大全 + 知识点大全」工程版总结**。
我不是照官方文档抄，而是**按你真实开发中“用不用 / 怎么用 / 不用会踩什么坑”**来讲。
你可以把这当成 **FlatList 终极速查表**。

---

# 一、FlatList 是什么？先给你一个清晰定位

* `FlatList` = **高性能长列表组件**
* 适合：

  * 长列表
  * 无限滚动
  * 下拉刷新
  * 大数据量渲染
* 内部是 **虚拟列表（VirtualizedList）**

  * 屏幕外的 item 不渲染（性能关键）

👉 **只要列表 > 20 条，优先用 FlatList，不用 map**

---

# 二、最小可用示例（必会）

```tsx
import { FlatList, Text, View } from "react-native";

const data = [
  { id: "1", title: "Apple" },
  { id: "2", title: "Banana" },
];

export default function Demo() {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```

### FlatList 的三大核心（缺一不可）

1. `data`
2. `renderItem`
3. `keyExtractor`

---

# 三、核心属性大全（90% 用在这里）

## 1️⃣ `data`

```ts
data: Array<any>
```

* 列表数据源
* **必须是数组**
* 改变引用才会触发更新（重要）

❌ 错误示例（原地 push）：

```js
list.push(newItem);
setList(list); // FlatList 可能不刷新
```

✅ 正确：

```js
setList([...list, newItem]);
```

---

## 2️⃣ `renderItem`

```ts
renderItem: ({ item, index, separators }) => ReactNode
```

```tsx
renderItem={({ item }) => (
  <View>
    <Text>{item.title}</Text>
  </View>
)}
```

⚠️ 性能点：

* **不要在 renderItem 里创建匿名组件 + 重逻辑**
* item 组件尽量拆出来 + memo

---

## 3️⃣ `keyExtractor`（非常重要）

```ts
keyExtractor: (item, index) => string
```

```tsx
keyExtractor={(item) => item.id}
```

❌ 不推荐：

```js
keyExtractor={(item, index) => index.toString()}
```

👉 **增删改时会引发错位、闪烁、性能问题**

---

# 四、列表布局相关

## 4️⃣ `horizontal`

```ts
horizontal?: boolean
```

* 横向列表

```tsx
<FlatList horizontal />
```

常用于：标签、banner、横滑卡片

---

## 5️⃣ `numColumns`

```ts
numColumns?: number
```

* 多列布局（瀑布流不是它）

```tsx
<FlatList numColumns={2} />
```

⚠️ 注意：

* `horizontal` ❌ 不能和 `numColumns` 一起用
* item 样式必须处理好宽度

---

## 6️⃣ `columnWrapperStyle`

* **多列时每一行的容器样式**

```tsx
<FlatList
  numColumns={2}
  columnWrapperStyle={{ justifyContent: "space-between" }}
/>
```

---

# 五、滚动与交互

## 7️⃣ `onScroll`

```ts
onScroll?: (event) => void
```

* 滚动监听（动画 / 吸顶 / 渐变）
* ⚠️ 高频触发，慎用重逻辑

```tsx
onScroll={e => {
  const y = e.nativeEvent.contentOffset.y;
}}
```

---

## 8️⃣ `scrollEnabled`

```ts
scrollEnabled?: boolean
```

* 是否允许滚动（做嵌套滚动时用）

---

## 9️⃣ `showsVerticalScrollIndicator`

```ts
showsVerticalScrollIndicator?: boolean
```

* 是否显示滚动条（UI 常关）

---

# 六、下拉刷新（极常用）

## 🔟 `refreshing` + `onRefresh`

```tsx
<FlatList
  data={list}
  refreshing={loading}
  onRefresh={fetchData}
/>
```

规则：

* `refreshing = true` → 显示 loading
* `onRefresh` → 下拉触发

⚠️ `refreshing` 必须是 **state**

---

# 七、分页 & 无限滚动（必考）

## 1️⃣1️⃣ `onEndReached`

```ts
onEndReached?: () => void
onEndReachedThreshold?: number
```

```tsx
<FlatList
  onEndReached={loadMore}
  onEndReachedThreshold={0.2}
/>
```

### 常见坑（一定要看）

* 会触发 **多次**
* 列表过短时也会触发

✅ 防抖示例：

```js
if (loading || noMore) return;
```

---

# 八、空态 / 头部 / 尾部（UI 必备）

## 1️⃣2️⃣ `ListEmptyComponent`

```tsx
<ListEmptyComponent={<Text>暂无数据</Text>} />
```

---

## 1️⃣3️⃣ `ListHeaderComponent`

```tsx
<ListHeaderComponent={<Banner />} />
```

---

## 1️⃣4️⃣ `ListFooterComponent`

```tsx
<ListFooterComponent={<Loading />} />
```

👉 分页 loading 常用

---

# 九、性能优化（FlatList 的灵魂）

## 1️⃣5️⃣ `initialNumToRender`

```ts
initialNumToRender?: number
```

* 首屏渲染多少条
* 默认够用，大列表可调小

---

## 1️⃣6️⃣ `windowSize`

```ts
windowSize?: number
```

* 渲染区域 = 当前屏 + 前后几屏
* 数字越大，内存越多

---

## 1️⃣7️⃣ `removeClippedSubviews`

```ts
removeClippedSubviews?: boolean
```

* Android 常开：`true`
* iOS 有时会闪（谨慎）

---

## 1️⃣8️⃣ `getItemLayout`（性能大杀器）

```ts
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})}
```

✔ 用于：

* 固定高度列表
* `scrollToIndex`
* 大数据量

---

# 十、控制 FlatList（ref）

## 1️⃣9️⃣ 常用方法

```tsx
const ref = useRef<FlatList>(null);

ref.current?.scrollToIndex({ index: 10 });
ref.current?.scrollToOffset({ offset: 200 });
ref.current?.scrollToEnd();
```

---

# 十一、常见“坑”和最佳实践（重点）

## ❗ 1. FlatList 不刷新？

👉 99% 原因：**data 没变引用**

---

## ❗ 2. renderItem 卡？

* item 拆组件
* `React.memo`
* 避免匿名函数

---

## ❗ 3. 嵌套 FlatList / ScrollView

* 能避免就避免
* 必须嵌套时：

  * 关闭内层滚动
  * 或用 `nestedScrollEnabled`

---

## ❗ 4. FlatList + 表单

* TextInput 在 item 中 → 要注意 key 稳定
* 否则输入会丢焦点

---

# 十二、工程级结论（一句话）

> **FlatList 是 RN 列表的“标准答案”**
>
> 核心在三点：
> **稳定 key / 正确更新 data / 控制渲染数量**

---

## 下一步我可以继续带你进阶（选一个）

1️⃣ **FlatList + 分页接口完整实战**
2️⃣ **FlatList 性能优化 checklist（万条数据）**
3️⃣ **FlatList vs ScrollView vs SectionList 深度对比**
4️⃣ **FlatList 中 TextInput 不丢焦点的正确写法**

你选一个，我直接给你项目级代码。
