下面我把你上面 `createSlice` 的示例，改成“**显式使用 immer**”的写法来演示；同时解释清楚：**为什么在 RTK 里可以直接改 state**。

---

## 1) 显式使用 immer：用 `produce` 来写不可变更新

在 Redux 里，reducer 本质要求 **不可变更新**：不能直接改原对象，而是要返回新对象。

`immer` 的核心是：你在 `produce` 的回调里“看起来在改 draft”，最终返回的是 **新的不可变对象**。

```js
// src/store/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { produce } from "immer";

const initialState = { value: 0 };

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state, action) =>
      produce(state, (draft) => {
        draft.value += 1;
      }),

    decrement: (state, action) =>
      produce(state, (draft) => {
        draft.value -= 1;
      }),

    addBy: (state, action) =>
      produce(state, (draft) => {
        draft.value += action.payload;
      }),

    reset: () => initialState,
  },
});

export const { increment, decrement, addBy, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

这个版本的 reducer 仍然是纯函数：输入 oldState，输出 newState（但你写起来像“改 draft”）。

---

## 2) 为什么 RTK 的 `createSlice` 里可以直接改 `state`？

关键点：**createSlice 内部默认集成了 immer**。

* 你在 reducers 里写的 `(state) => { state.value += 1 }`
* 这个 `state` 并不是“真实 store 里的 state 对象”
* 它是 immer 提供的 **draft（代理对象）**
* 你对 draft 做的修改会被 immer 记录成“变更补丁”
* 最终 immer 会基于原 state 生成一个 **新的 state（不可变）** 并返回给 Redux

所以看似“直接改 state”，实际上：

* 你改的是 **draft**
* Redux 收到的是 **newState**
* 原 state 没被修改（不可变性仍然成立）

---

## 3) 两种写法的对比（你该用哪种）

### RTK 默认写法（推荐，最常见）

```js
increment(state) {
  state.value += 1;
}
```

### 显式 immer 写法（少见，但能帮助理解）

```js
increment: (state) =>
  produce(state, (draft) => {
    draft.value += 1;
  })
```

结论：

* 在 **Redux Toolkit** 里，通常不需要手写 `produce`，因为 `createSlice` 已经包了一层 immer。
* 显式 `produce` 更适合教学、或者你在“非 RTK reducer”里想用 immer 简化不可变更新。

---

## 4) 一个很重要的边界：什么时候“不能”直接改 state？

在 RTK reducer 里，你可以：

* 改 draft（推荐）
* 或者 return 一个全新的对象（也可以）

但不要：

* 一边改 draft，一边又 return 新对象（会让逻辑混乱，RTK 会以 return 为准/或产生不可预期理解成本）

示例（避免这样写）：

```js
increment(state) {
  state.value += 1;
  return { value: 999 }; // 不要混用
}
```

---

如果你愿意，我可以再把 `userSlice`（包含对象、数组嵌套更新）也用“显式 immer produce”写一遍，让你看到：深层更新为什么会比手写展开运算符简单很多。
