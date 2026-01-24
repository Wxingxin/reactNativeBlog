下面给你一套在真实项目里可长期沿用的方案：**多 slice 组合 reducer**、**feature-based 目录结构**、以及**命名规范（slice name / action）**。默认 Redux Toolkit + React-Redux。

---

## 1) 多 slice 组合 reducer：两种主流方式

### 方式 A：在 `configureStore` 里用对象组合（最常见）

```js
// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import counterReducer from "../features/counter/counterSlice";
import profileReducer from "../features/profile/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
    profile: profileReducer,
  },
});
```

**要点**

* `reducer` 的 key 就是 state 的一级命名空间：`state.auth`、`state.counter`。
* 这个 key 是你整个项目的“API”，尽量不要随意改，否则 selector 全部要改。

---

### 方式 B：集中一个 `rootReducer`（适合做 reset / 注入 preloadedState 等）

```js
// src/store/rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import counterReducer from "../features/counter/counterSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  counter: counterReducer,
});
```

```js
// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
});
```

**什么时候用 rootReducer 更值**

* 想做“全局登出清空状态”这类逻辑（root 层拦一次 action）
* 想做 reducer 注入（大型项目/微前端）
* 想把 store 初始化逻辑集中管理

---

## 2) Feature-based 结构：建议目录（推荐长期使用）

目标：让 Redux 代码跟业务 feature 走，而不是按技术分层散落。

### 推荐目录

```
src/
  app/
    store.js
    rootReducer.js        (可选)
  features/
    auth/
      authSlice.js
      authSelectors.js
      authThunks.js       (可选：async)
      authApi.js          (可选：请求封装)
      index.js            (可选：统一导出)
    counter/
      counterSlice.js
      counterSelectors.js
  shared/
    ...
```

**要点**

* `features/<featureName>/` 下放该 feature 的 slice、selector、thunk、API。
* `app/` 只放“全局装配”：store、rootReducer、Provider 包装等。
* 组件层也建议 feature 化：`features/auth/components/...`（看团队偏好）。

---

## 3) 命名规范：slice name / action / state key

### 3.1 state key（configureStore 的 key）：用“feature 名”

```js
reducer: {
  auth: authReducer,
  cart: cartReducer,
  profile: profileReducer,
}
```

**规范**

* 小写、简短、稳定：`auth / cart / profile / settings`
* 尽量不要复数与单数混用（统一风格）
* 避免与通用词冲突：如 `data`、`common`（容易失控）

---

### 3.2 slice `name`：建议与 state key 一致（非常重要）

```js
createSlice({
  name: "auth",
  initialState,
  reducers: { ... }
})
```

**为什么要一致**

* action type 默认是：`<slice.name>/<reducerKey>`
* 一致后 action type 具有稳定且可预测的命名：`auth/loginSuccess`

---

### 3.3 reducer key（也就是 action 名）：用“动词 + 宾语/状态”

```js
reducers: {
  loginRequested() {},
  loginSucceeded(state, action) {},
  loginFailed(state, action) {},
  logout() {},
  tokenRefreshed(state, action) {},
}
```

**规范建议**

* 事件型（推荐）：`xxxRequested / xxxSucceeded / xxxFailed`

  * 非常适合 async 流程与日志排查
* 业务动作：`addItem / removeItem / updateProfile`
* 状态变更：`setUser / clearUser / setStatus / setError`

---

### 3.4 action type 的最终样子（你调试时看到的）

* `auth/logout`
* `auth/loginSucceeded`
* `cart/addItem`
* `profile/setAvatar`

这对排查问题、做埋点、写测试都很友好。

---

## 4) 可直接复用的范例：auth feature（命名与导出习惯）

```js
// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth", // 与 store key 保持一致
  initialState,
  reducers: {
    loginRequested(state) {
      state.status = "loading";
      state.error = null;
    },
    loginSucceeded(state, action) {
      state.status = "succeeded";
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    loginFailed(state, action) {
      state.status = "failed";
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const { loginRequested, loginSucceeded, loginFailed, logout } =
  authSlice.actions;

export default authSlice.reducer;
```

```js
// src/features/auth/authSelectors.js
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthed = (state) => Boolean(state.auth.accessToken);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
```

**要点**

* selector 文件统一集中出口，组件不直接手写 `state.auth.xxx`，降低耦合。
* 后面 state 结构变化，你只改 selector。

---

## 5) 团队协作的“硬规则”（建议你直接采纳）

1. `store.reducer key` 与 `slice.name` 必须一致
2. 每个 feature 的 selector 统一导出，组件只用 selector
3. action 命名以事件/动词为核心，禁止含糊：`updateData`、`handleThing`
4. `features/<name>/` 内聚，`app/` 只负责装配，不写业务逻辑

---

如果你告诉我你当前项目有哪些 feature（例如：`auth / posts / upload / chat / ui`），我可以按你的业务帮你把完整目录与每个 slice 的 state shape、命名、selector 约定一次性规划好，并给出对应的 `rootReducer` 与 store 装配模板。
