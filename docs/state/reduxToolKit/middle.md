下面我从**“Redux Toolkit 还能做什么”**这个高度，把 **middleware（中间件）** 这一整条能力线讲清楚：**是什么 → 默认有哪些 → 为什么重要 → 如何写 logger / 自定义 middleware → serializableCheck / 严格模式**。这是你从“会用 RTK”走向“理解 Redux 架构”的关键一步。

---

# 一、middleware 是什么（一句话模型）

> **middleware = action 到 reducer 之间的一层“拦截管道”**

Redux 的标准流程是：

```
dispatch(action)
   ↓
middleware1
   ↓
middleware2
   ↓
reducer
   ↓
state 更新
```

**middleware 能做什么**

* 在 action 到达 reducer 之前 / 之后插入逻辑
* 访问：`dispatch`、`getState`
* 拦截、修改、延迟、丢弃 action
* 执行副作用（日志、鉴权、刷新 token、埋点）

---

# 二、Redux Toolkit 默认内置了哪些 middleware？

### RTK 的“开箱即用”中间件组合

当你写：

```js
configureStore({
  reducer,
});
```

RTK 实际等价于：

```js
configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: true,
    }),
});
```

### 默认内置 middleware 一览

| middleware            | 作用                      | 是否必须 |
| --------------------- | ----------------------- | ---- |
| **redux-thunk**       | 允许 `dispatch(fn)`       | 必须   |
| **immutableCheck**    | 检测 reducer 是否非法修改 state | 开发期  |
| **serializableCheck** | 检测 action/state 是否可序列化  | 开发期  |

> ⚠️ 这些 **只在开发环境开启**，生产环境会自动移除，**不会影响性能**。

---

# 三、为什么 middleware 比 useEffect / 普通函数更重要？

### middleware 能做到 useEffect 做不到的事

* 拦截 **所有 action**（不局限某组件）
* 与 UI 解耦（全局行为）
* 精准控制 action 流向

### 典型场景

* 全局 401 → 自动登出
* 打点埋点
* 请求日志
* 权限校验
* 错误上报（Sentry）

---

# 四、logger middleware（你必须会写的第一个）

### 最简 logger middleware

```js
// src/middleware/logger.js
export const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("prev state:", store.getState());
  console.log("action:", action);

  const result = next(action); // 继续往下（给 reducer）

  console.log("next state:", store.getState());
  console.groupEnd();

  return result;
};
```

### 接入 store

```js
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import { loggerMiddleware } from "../middleware/logger";

export const store = configureStore({
  reducer: { user: userReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});
```

**你现在已经完整掌握 Redux middleware 写法了。**

---

# 五、自定义 middleware：一个真实业务例子（401 自动登出）

```js
// src/middleware/authMiddleware.js
import { logout } from "../features/auth/authSlice";

export const authMiddleware = (store) => (next) => (action) => {
  // 只关心 rejected 的 thunk
  if (action.type.endsWith("/rejected")) {
    if (action.error?.message === "401") {
      store.dispatch(logout());
    }
  }
  return next(action);
};
```

**说明**

* middleware 能监听 thunk 自动生成的 action
* 可以在中间层 dispatch 新 action
* 不依赖 React、页面、组件

---

# 六、middleware vs thunk：职责区分（面试常问）

| 能力          | thunk          | middleware |
| ----------- | -------------- | ---------- |
| 发请求         | ✅              | ❌（不直接）     |
| 访问 state    | ✅ (`getState`) | ✅          |
| 拦截所有 action | ❌              | ✅          |
| 全局行为        | ❌              | ✅          |
| UI 解耦       | 一般             | 很强         |

**一句话总结**

> thunk 管“一个业务动作的异步流程”，middleware 管“系统级的横切逻辑”。

---

# 七、serializableCheck 是什么？为什么重要？

### 什么叫“可序列化”？

* 可以被 `JSON.stringify` 的数据
* 不包含：函数、Promise、Symbol、DOM、class 实例、Date（有争议）

### serializableCheck 在干嘛？

* 检查：

  * action.payload
  * state
* 一旦发现不可序列化值：

  * 控制台报警（开发期）

### 常见违规例子（❌）

```js
dispatch({
  type: "test",
  payload: new Date(), // ❌
});
```

```js
state.timer = setTimeout(() => {}, 1000); // ❌
```

### 为什么 Redux 要求可序列化？

* DevTools 时间旅行
* 状态可预测
* 日志、回放、持久化

---

# 八、什么时候需要关掉 serializableCheck？

### 合理关闭的场景（很少）

* 第三方库强制塞不可序列化对象
* 已知且可控（例如 AbortController.signal）

```js
getDefaultMiddleware({
  serializableCheck: {
    ignoredActions: ["user/fetch/fulfilled"],
    ignoredPaths: ["user.abortController"],
  },
});
```

> ⚠️ 面试中要强调：**不是默认关掉，而是“精确忽略”**

---

# 九、严格模式 & immutableCheck

### immutableCheck 做什么？

* 检测 reducer 是否直接修改了 state
* 在开发期抛出警告

```js
state.user.name = "xxx"; // reducer 外 ❌
```

### 什么时候可能关掉？

* state 极大（大型列表）
* 性能敏感
* 开发完成后

```js
getDefaultMiddleware({
  immutableCheck: false,
});
```

---

# 十、你现在已经“知道 RTK 还能做什么”了

你已经理解了：

* middleware 在 Redux 架构中的位置
* RTK 默认中间件的设计目的
* 如何写 logger / auth middleware
* serializableCheck / immutableCheck 的意义与边界
* thunk 与 middleware 的职责区分

---

## 如果你继续往「高阶 Redux」走，下一步我建议你学这三个（我可以继续带你）：

1. **thunk + middleware 实现 token 刷新并发锁**
2. **RTK Query：什么时候应该“不用 thunk”**
3. **Redux DevTools 时间旅行 + 调试技巧**

你想从哪一个继续？
