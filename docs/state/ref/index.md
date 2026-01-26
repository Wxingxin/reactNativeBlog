在 React Native 项目中，**Refs 的作用非常明确：用于“绕过 props/状态更新流程，直接操作某个实例或节点”**。
它是**少量、克制、必要时才用**的能力，而不是日常数据流工具。

下面我按 **“能干什么 → 什么时候用 → 怎么用 → 误区”** 给你系统讲清楚。

---

## 一、一句话理解 Refs（RN 语境）

> **Refs = 获取某个组件 / 原生节点的“引用句柄”，用于命令式操作**

它解决的是：
**“这件事不适合用 props/state 表达”** 的问题。

---

## 二、RN 中 Refs 的核心用途（99% 场景）

### ✅ 1. 操作输入框（最高频）

#### 常见需求

* 自动聚焦
* 失焦
* 清空输入
* 手动调用 `blur / focus`

```tsx
const inputRef = React.useRef<TextInput>(null);

<TextInput
  ref={inputRef}
  placeholder="请输入"
/>

<Button
  title="聚焦"
  onPress={() => inputRef.current?.focus()}
/>
```

**知识点**

* `TextInput` 暴露了命令式 API：`focus / blur / clear`
* 这是 refs 最正统、最推荐的使用场景

---

### ✅ 2. 控制滚动（ScrollView / FlatList）

#### 场景

* 滚动到顶部
* 定位到某一项
* 切 tab 时重置滚动

```tsx
const listRef = React.useRef<FlatList>(null);

<FlatList
  ref={listRef}
  data={data}
  renderItem={renderItem}
/>

listRef.current?.scrollToOffset({
  offset: 0,
  animated: true,
});
```

**常用 API**

* `scrollToOffset`
* `scrollToIndex`
* `scrollToEnd`

---

### ✅ 3. 调用第三方组件的命令式方法

#### 场景

* Modal / BottomSheet
* Toast / ActionSheet
* Video / Camera

```tsx
const sheetRef = useRef<BottomSheet>(null);

<BottomSheet ref={sheetRef} />

sheetRef.current?.expand();
sheetRef.current?.close();
```

**知识点**

* 很多第三方库本质是“命令式 UI”
* refs 是它们的**标准入口**

---

### ✅ 4. 暴露子组件能力（forwardRef + useImperativeHandle）

#### 场景

* 父组件控制子组件行为
* 不想暴露内部 state

```tsx
const CustomInput = React.forwardRef((props, ref) => {
  const innerRef = React.useRef<TextInput>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => innerRef.current?.focus(),
    clear: () => innerRef.current?.clear(),
  }));

  return <TextInput ref={innerRef} {...props} />;
});
```

```tsx
const ref = useRef(null);

<CustomInput ref={ref} />

ref.current?.focus();
```

**知识点**

* `forwardRef`：允许父组件传 ref
* `useImperativeHandle`：控制暴露给父组件的 API（很重要）

---

### ✅ 5. 与动画系统配合（Animated / Reanimated）

```tsx
const viewRef = useRef(null);

<Animated.View ref={viewRef} />
```

* 用于动画驱动
* 获取 native 节点句柄
* **不走 React 更新流程**

---

## 三、RN 中你不应该用 Refs 的场景（非常重要）

### ❌ 1. 用 ref 当 state 用（错误）

```tsx
// ❌ 错误
const countRef = useRef(0);
countRef.current++;
```

为什么错？

* UI 不会更新
* 破坏 React 的声明式模型

👉 正确：`useState`

---

### ❌ 2. 父组件用 ref 操作子组件内部数据

```tsx
// ❌ 不推荐
childRef.current.value = "xxx";
```

👉 正确：

* 通过 `props`
* 或 `onChange` 回调

---

### ❌ 3. 滥用“命令式 UI”

如果可以用：

* `props`
* `state`
* `条件渲染`

👉 **优先用声明式**

---

## 四、RN 中 Refs 的分类（你要分清）

### 1️⃣ DOM / 原生组件 Ref

```tsx
useRef<TextInput>(null)
useRef<FlatList>(null)
```

### 2️⃣ 组件实例 Ref（forwardRef）

```tsx
useRef<{ focus: () => void }>(null)
```

### 3️⃣ 非 UI Ref（存可变值，不触发渲染）

```tsx
const timerRef = useRef<NodeJS.Timeout | null>(null);
```

#### 典型用途

* 定时器
* requestId
* 上一次值缓存

---

## 五、为什么 Refs 不会触发重新渲染？

```tsx
const ref = useRef(0);
ref.current++;
```

* `useRef` 修改 `.current`
* React **不会感知变化**
* 所以不会 render

📌 这正是它“绕过更新系统”的本质

---

## 六、RN 项目里的 Refs 使用规范（建议你遵守）

1. **只在“必须命令式”的地方用**
2. **输入 / 滚动 / 第三方组件优先**
3. **组件封装时配合 `forwardRef`**
4. **暴露最小 API（useImperativeHandle）**
5. **不要用 ref 传业务数据**

---

## 七、你在真实 RN 项目里会看到的 Refs 场景汇总

| 场景                 | 是否推荐  |
| ------------------ | ----- |
| 自动聚焦输入框            | ✅ 必用  |
| 控制 FlatList 滚动     | ✅ 必用  |
| Modal / Sheet 打开关闭 | ✅ 必用  |
| 保存定时器 / requestId  | ✅ 推荐  |
| 保存表单值              | ❌ 不推荐 |
| 替代 state           | ❌ 错误  |

---

## 八、一句话总结

> **Refs 在 RN 中是“命令式逃生通道”，不是数据流工具。**

* 用来 **调用方法**
* 用来 **拿实例**
* 用来 **做 React 不擅长的事**

---

如果你愿意，我可以下一步直接帮你：

* 用 refs 手写一个 **可控 + 命令式混合 Input**
* 讲 **refs + 表单库（React Hook Form）怎么协作**
* 讲 **refs 在复杂动画里的真实使用方式**

你选一个我继续深入。
