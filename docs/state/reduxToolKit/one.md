下面按“你在 Redux 项目里真正会用到的东西”来讲：`configureStore`、`createSlice`、`Provider`、`useSelector`、`useDispatch` 的用法与知识点。默认你用的是 **Redux Toolkit（RTK）+ React-Redux**（这是当前主流写法）。

---

## 1) configureStore：创建 Store（项目入口级）

### 你会怎么用

```js
// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
  // middleware / devTools / preloadedState 都可在这里配置（见下）
});
```

### 核心知识点

* **RTK 默认帮你做了很多“正确的事”**

  * 自动组合 reducer（你传对象即可）
  * 默认启用常用 middleware：`redux-thunk`、以及开发期的不可变性/序列化检查等
  * 默认支持 Redux DevTools（开发环境）
* **state 结构由 reducer key 决定**

  * 上面配置后，state 是：`state.counter`、`state.user`
* **常见扩展点**

  * `middleware`: 增加自定义中间件（日志、埋点等）
  * `devTools`: 控制是否启用 DevTools
  * `preloadedState`: 注入初始状态（SSR、持久化恢复）

#### middleware 常见写法

```js
export const store = configureStore({
  reducer: { counter: counterReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true, // 默认 true
      immutableCheck: true,    // 默认 true
    }),
});
```

---

## 2) createSlice：写 reducer + action 的“标准方式”

### 你会怎么用（最常见）

```js
// src/store/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment(state) {
      // 这里可以“直接改 state”，因为底层用 immer 做了不可变更新
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    addBy(state, action) {
      // action.payload 是你 dispatch 时传的参数
      state.value += action.payload;
    },
    reset() {
      return initialState; // 也可以直接返回新 state
    },
  },
});

export const { increment, decrement, addBy, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

### 核心知识点

* `createSlice` 产出两样东西：

  1. `slice.reducer`：给 `configureStore` 用
  2. `slice.actions`：给组件 `dispatch` 用
* `reducers` 里每个函数就是一个 **case reducer**

  * 参数：`(state, action)`
  * `action.payload` 是最常用的数据载体
* **可以写“看起来可变”的更新**：因为 RTK 用 immer 帮你做了不可变更新
* reducer 必须是 **纯函数语义**

  * 不能在 reducer 里发请求、读写 localStorage、随机数等副作用（这些放 thunk / middleware / 组件里）

---

## 3) Provider：把 store 注入 React 组件树

### 你会怎么用（入口文件）

```jsx
// src/main.jsx 或 src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### 核心知识点

* `Provider` 做的是把 store 放进 React Context
* 没有 Provider，`useSelector/useDispatch` 会直接报错
* 通常全局只放一个 Provider（除非你明确要多 store 的隔离场景）

---

## 4) useSelector：从 store 读数据（订阅更新）

### 你会怎么用

```jsx
import { useSelector } from "react-redux";

export function CounterValue() {
  const value = useSelector((state) => state.counter.value);
  return <div>Count: {value}</div>;
}
```

### 核心知识点（很重要）

* `useSelector` 会 **订阅 store**，当选择到的值变化时触发组件重渲染
* 默认比较方式是 **严格相等 `===`**

  * 如果你 selector 每次都返回新对象/新数组，会导致频繁重渲染
* 最佳实践

  * 尽量 selector 返回 **原始值或稳定引用**
  * 需要组合多个字段时：

    * 要么拆成多个 `useSelector`
    * 要么用 memo selector（reselect）
    * 或者用 `shallowEqual`（了解即可）

#### 常见“坑”示例

```js
// 每次返回新对象，导致每次都“变了”
const obj = useSelector((state) => ({ v: state.counter.value }));
```

改法（拆开）

```js
const v = useSelector((state) => state.counter.value);
```

---

## 5) useDispatch：派发 action（触发状态变化）

### 你会怎么用

```jsx
import { useDispatch } from "react-redux";
import { increment, addBy } from "../store/counterSlice";

export function CounterButtons() {
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(addBy(5))}>+5</button>
    </div>
  );
}
```

### 核心知识点

* `dispatch(action)` 是 Redux 唯一的“写入口”
* action 一般来自 slice 的 `slice.actions`
* `dispatch` 本身引用稳定，通常不需要包 `useCallback`（除非你作为依赖传很深）

---

## 6) 把 5 个东西串起来：一个最小可运行结构

### 目录建议（React 项目常见）

```
src/
  store/
    index.js
    counterSlice.js
  App.jsx
  main.jsx
```

### App.jsx 示例

```jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, addBy, reset } from "./store/counterSlice";

export default function App() {
  const value = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  const [n, setN] = useState(3);

  return (
    <div style={{ padding: 16 }}>
      <h1>Redux Toolkit Counter</h1>

      <p>Count: {value}</p>

      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(reset())}>Reset</button>

      <hr />

      <input
        type="number"
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
      />
      <button onClick={() => dispatch(addBy(n))}>Add N</button>
    </div>
  );
}
```

---

## 7) 你在项目里必须掌握的“知识点清单”（面试/实战高频）

### Store 层（configureStore）

* reducer 结构决定 state 结构
* middleware 的用途：拦截 action、做日志/鉴权/刷新 token/错误上报等
* preloadedState：SSR 或本地持久化恢复

### Slice 层（createSlice）

* action 与 reducer 的对应关系
* `action.payload` 约定
* immer 的“可变写法”本质仍是不可变更新
* reducer 不做副作用（请求、存储、随机等）

### React 绑定层（Provider / hooks）

* Provider 必须放在应用根节点
* useSelector 的订阅机制与 `===` 比较
* useDispatch 派发 action；UI -> dispatch -> reducer -> state -> re-render

---

如果你下一步要把 Redux 用到“真实项目”（登录态、请求、token 刷新、持久化），我可以在这个基础上继续补一套常见的：`createAsyncThunk`、请求状态管理（loading/error）、以及与 axios 拦截器/路由守卫的最佳实践结构。
