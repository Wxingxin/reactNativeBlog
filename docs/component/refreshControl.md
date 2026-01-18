下面给你一份 **React Native 内置 `RefreshControl`（下拉刷新）知识点大全 + 配置大全**，覆盖：用法模式、所有常见 props、平台差异（iOS/Android）、在 `ScrollView/FlatList/SectionList` 的正确接入方式、常见坑与工程化建议。

> 官方定位：`RefreshControl` 用在 `ScrollView`/列表容器里，为其增加“下拉刷新”。当滚动在顶部（`scrollY: 0`）时，下拉触发 `onRefresh`。并且 `refreshing` 是**受控属性**，必须由你控制其 true/false，否则指示器会立刻停止。 ([React Native][1])

---

## 1) 最核心的受控模型（Controlled）

`refreshing` 决定“转圈是否展示”，你必须：

1. 触发刷新时把 `refreshing` 置为 `true`
2. 异步请求结束后置为 `false`

官方特别强调：`refreshing` 是受控属性。 ([React Native][1])

---

## 2) 在不同容器中的标准接入方式

### A. `ScrollView`：通过 `refreshControl` 属性挂载

`ScrollView` 有 `refreshControl` 属性（仅垂直滚动有效）。 ([React Native][2])

要点：

* `horizontal` 必须为 `false`（默认就是）
* 传入一个 `<RefreshControl />`

### B. `FlatList`：两种方式

1. **推荐方式**：直接用 `FlatList` 自带的 `onRefresh` + `refreshing`（内部会自动加标准 `RefreshControl`）。 ([React Native][3])
2. **自定义方式**：用 `refreshControl={<RefreshControl ... />}`（当你需要更深度的外观/偏移配置）

---

## 3) Props 配置大全（按“必用/常用/平台专有”分类）

### 3.1 必用（几乎所有项目都需要）

* **`refreshing: boolean`（必填）**
  是否正在刷新（受控）。 ([React Native][4])
* **`onRefresh?: () => void`**
  开始刷新时回调。 ([React Native][1])

> 经验建议：`onRefresh` 里尽量只做“触发刷新”的动作（置 `refreshing=true`、调用统一的 `refetch()`），不要塞太多 UI 逻辑。

---

### 3.2 外观与体验（常用）

* **`progressViewOffset?: number`**（iOS/Android 常用）
  指示器距离顶部的偏移。适合你有自定义 Header、吸顶搜索框时避免遮挡（常见）。
* **`enabled?: boolean`（Android）**
  是否启用下拉刷新。 ([React Native][4])
* **`colors?: string[]`（Android）**
  Android 旋转指示器颜色数组。 ([React Native][4])
* **`progressBackgroundColor?: string`（Android）**
  Android 指示器圆环背景色（有些设计会用到）。
* **`tintColor?: string`（iOS）**
  iOS 指示器颜色。
* **`title?: string`（iOS）**
  iOS 下拉时显示的文字（例如“下拉刷新中…”）。
* **`titleColor?: string`（iOS）**
  iOS `title` 文本颜色。

> 注意：不同 RN 版本对 props 的完整列表可能略有扩展，但以上是工程里最常用且稳定的一组（官方与社区长期一致）。

---

## 4) 经典代码模板（可直接套用）

### 4.1 `FlatList`（推荐：内置 onRefresh）

适用：大多数列表页。

关键点：`refreshing` 必须与请求生命周期绑定；不要用 `setTimeout` 假刷新。

```tsx
import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";

export function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<string[]>(["A", "B", "C"]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      // 这里换成你的真实请求
      await new Promise((r) => setTimeout(r, 800));
      setData((prev) => [...prev].reverse());
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 16 }}>{item}</Text>}
      refreshing={refreshing}
      onRefresh={refetch}
    />
  );
}
```

`FlatList` 文档明确：如果提供 `onRefresh`，会加入标准下拉刷新控件，并且你要正确设置 `refreshing`。 ([React Native][3])

---

### 4.2 `ScrollView`（自定义 RefreshControl）

适用：页面是“杂项内容 + 若干模块”，不是纯列表。

```tsx
import React, { useCallback, useState } from "react";
import { ScrollView, RefreshControl, Text, View } from "react-native";

export function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={64} // 避免被顶部Header挡住（示例）
        />
      }
    >
      <View style={{ padding: 16 }}>
        <Text>模块 1</Text>
        <Text>模块 2</Text>
      </View>
    </ScrollView>
  );
}
```

---

## 5) 常见坑与排查清单（高频）

1. **指示器一闪而过**：你没把 `refreshing` 设为 `true`（受控属性没跟上）。官方有明确提示。 ([React Native][1])
2. **FlatList 下拉没反应**：

   * 列表没有滚到顶部（或有 `ListHeaderComponent` + sticky 行为导致手势被消耗）
   * 外层又套了 `ScrollView`（双滚动容器会冲突）
3. **下拉刷新触发时机不对**：页面有吸顶 Header 时，调整 `progressViewOffset`；必要时把 Header 做成列表的 `ListHeaderComponent`，避免“顶部不是 0”带来的手势体验问题。
4. **重复触发请求**：在 `onRefresh` 内做并发保护（例如如果 `refreshing===true` 直接 return），或用请求库的“去重/取消”能力。
5. **刷新结束但列表不更新**：确认数据源引用变化（不可变更新），以及 `keyExtractor` 稳定、`extraData`（如需要）配置正确。

---

## 6) 实战建议（你做 RN 项目时更省心）

* **把刷新逻辑做成“统一 refetch()”**：页面初次加载、下拉刷新、返回页面时刷新都走同一条路径，减少状态分叉。
* **与 React Query/Zustand 集成**：`refreshing` 可以由 `isRefetching` 派生（或手动包一层），避免本地状态与请求状态不一致。
* **错误处理**：刷新失败也要 `finally setRefreshing(false)`，并给用户 toast/snackbar。

---

如果你告诉我：你现在的列表是 `FlatList` 还是 `ScrollView`（以及有没有顶部自定义 Header / 吸顶），我可以把上面的模板按你的页面结构改成“直接可粘贴进项目”的版本（含 `progressViewOffset`、Android 颜色、iOS title 的推荐配置）。

[1]: https://reactnative.dev/docs/next/refreshcontrol?utm_source=chatgpt.com "RefreshControl"
[2]: https://reactnative.dev/docs/scrollview?utm_source=chatgpt.com "ScrollView"
[3]: https://reactnative.dev/docs/flatlist?utm_source=chatgpt.com "FlatList"
[4]: https://reactnative.cn/docs/refreshcontrol?utm_source=chatgpt.com "RefreshControl"
