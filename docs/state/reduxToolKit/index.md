下面这份是 **“面向真实项目 + 面试友好” 的 Redux Toolkit（RTK）在 React 中的完整学习路线**。
假设前置条件：**你已经会 React Hooks（useState / useEffect / props）** —— 这与你当前背景是匹配的。

我会按 **阶段 → 目标 → 必会点 → 产出物** 来规划，而不是堆 API。

---

# Redux Toolkit × React 学习路线（实战导向）

---

## 阶段 0：什么时候「该用 Redux Toolkit」

> ❗这是很多人一开始就走偏的地方

### 你应该用 RTK 的场景

* 多个页面 / 组件共享状态
* 登录态、用户信息、主题、权限
* 列表数据需要缓存、复用
* 复杂异步（并发 / 竞态 / 重放）

### 不适合 RTK 的场景

* 组件内部临时状态
* 表单输入（优先 React Hook Form）
* UI 展示状态（hover / open）

📌 **认知产出**

* 能明确说出「为什么不用 useState / useContext」

---

## 阶段 1：Redux Toolkit 基础（必须非常熟）

### 学习目标

> 能独立搭建 store，并在组件中稳定读写

### 核心知识点

1. `configureStore`
2. `createSlice`
3. `Provider`
4. `useSelector`
5. `useDispatch`
6. Immer（为什么可以直接改 state）

### 关键概念

* 单一数据源
* reducer 是“纯函数”
* action 自动生成

### 典型案例（必做）

* 计数器
* 主题切换（light / dark）
* 登录 token 存储

### 产出物

```txt
store/
 ├─ index.ts
 └─ counterSlice.ts
```

📌 **你应该能脱口而出**

* 为什么不再写 switch-case
* slice = reducer + action + name

---

## 阶段 2：状态拆分与模块化（项目级必会）

### 学习目标

> 能组织「可维护」的 Redux 结构

### 核心知识点

1. 多 slice 组合 reducer
2. feature-based 结构
3. 命名规范（slice name / action）

### 推荐结构

```txt
store/
 ├─ index.ts
 └─ features/
     ├─ auth/
     │   ├─ authSlice.ts
     │   └─ types.ts
     ├─ user/
     └─ ui/
```

### 必须理解

* state 树结构设计
* selector 解耦组件

```ts
export const selectUser = (state) => state.user.info
```

📌 **产出物**

* 一个“登录 + 用户信息”模块

---

## 阶段 3：异步逻辑 —— createAsyncThunk（高频）

### 学习目标

> 正确处理加载 / 成功 / 失败 / 并发

### 核心知识点

1. `createAsyncThunk`
2. `pending / fulfilled / rejected`
3. loading / error 状态设计
4. thunk 参数与返回值

```ts
export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (id) => {
    const res = await api.get(`/user/${id}`)
    return res.data
  }
)
```

### 必须掌握的模式

* 页面 loading
* 错误提示
* 防止重复请求

📌 **面试必问点**

* thunk 和 useEffect 的边界
* thunk 是否可以访问 state（getState）

---

## 阶段 4：RTK 中间件 & 工程能力

### 学习目标

> 知道 Redux Toolkit「还能做什么」

### 核心知识点

1. middleware 是什么
2. 默认内置 middleware
3. logger / 自定义 middleware
4. 严格模式 & serializableCheck

```ts
configureStore({
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }),
})
```

📌 **认知产出**

* 为什么 RTK 默认“很安全”
* 为什么要关 serializableCheck

---

## 阶段 5：RTK Query（强烈建议重点）

> ⚠️ 这是 **现代 Redux 的核心竞争力**

### 学习目标

> 用 RTK Query 取代 80% 手写 thunk

### 核心知识点

1. `createApi`
2. `fetchBaseQuery`
3. query vs mutation
4. 自动缓存 & 失效
5. loading / error 自动管理

```ts
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
    }),
  }),
})
```

### 必做案例

* 列表 + 详情
* 新增 / 删除自动刷新
* Token 注入

📌 **产出物**

* 几乎不写 reducer 的数据层

---

## 阶段 6：认证 & Token 刷新（真实项目）

### 学习目标

> 处理真实后台的复杂情况

### 必学内容

1. token 存 Redux 还是 storage
2. axios / fetch 注入 token
3. 401 → refresh token
4. 并发请求只刷新一次（锁）

📌 **这是你前面已经接触过的高阶点**

* Redux + axios 拦截器
* Store 外部 dispatch

---

## 阶段 7：Redux Toolkit 与其他库协作

### 必会组合

* RTK + React Router（路由守卫）
* RTK + React Hook Form（表单）
* RTK + Zod（校验）
* RTK + redux-persist（持久化）

### 重点认知

> Redux 管 **全局状态**，
> 表单 / UI / 派生状态交给专用工具

---

## 阶段 8：性能 & 进阶（加分项）

### 学习点

* memo + selector
* createSelector（避免重复计算）
* 避免“全量 rerender”
* 不要滥用 Redux

---

## 推荐学习顺序（可直接照着走）

```txt
第 1 天：阶段 1 + 2
第 2 天：阶段 3
第 3 天：阶段 5（RTK Query）
第 4 天：阶段 6（认证）
第 5 天：实战整合
```

---

## 最终目标（你应该达到）

你能做到：

* 清楚说明 **什么时候该用 Redux**
* 能写出结构清晰的 RTK 项目
* 能处理真实后端的异步与认证
* React / React Native 可迁移使用

---

如果你愿意，下一步我可以：

* 给你 **每个阶段的最小可运行代码**
* 或直接带你做一个 **「X 平台 / 后台管理系统」的 Redux Toolkit 数据层设计**

你更想走哪条？

--------------------------
Redux Toolkit（RTK）在 **React** 和 **React Native（RN）** 中的**使用方式、核心 API、思想几乎完全一致**。
区别主要集中在 **运行环境、与平台相关的集成方式，以及常见的配套库选择**，而不是 Redux Toolkit 本身。

下面我从**“完全相同的部分”**和**“真正有区别的地方”**两条线，给你一份工程化视角的对照说明。

---

## 一、完全相同的部分（90% 一致）

### 1️⃣ Redux Toolkit 核心 API —— 一模一样

以下内容在 React / RN 中 **无任何差异**：

* `configureStore`
* `createSlice`
* `createAsyncThunk`
* `createEntityAdapter`
* `createSelector`
* `RTK Query`（核心逻辑）

```ts
// store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})
```

```ts
// userSlice.ts
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: { token: null },
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
  },
})

export const { setToken } = userSlice.actions
export default userSlice.reducer
```

➡️ **这套代码在 React 和 RN 中可以原封不动复用**

---

### 2️⃣ react-redux 的使用方式一致

```tsx
import { Provider } from 'react-redux'
import { store } from './store'

export default function App() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  )
}
```

```tsx
import { useSelector, useDispatch } from 'react-redux'

const token = useSelector(state => state.user.token)
const dispatch = useDispatch()
```

* `Provider`
* `useSelector`
* `useDispatch`
* `useStore`

**完全一致**

---

### 3️⃣ Redux 的设计思想完全一致

* 单一数据源
* 不可变数据（Immer）
* 单向数据流
* 全局状态管理
* 异步逻辑集中（Thunk / RTK Query）

**React 和 RN 没有任何理念差异**

---

## 二、真正有区别的地方（重点）

区别不在 Redux Toolkit 本身，而在 **运行平台 & 周边生态**

---

## 1️⃣ Store 挂载位置不同（平台差异）

### React（Web）

```tsx
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

### React Native

```tsx
import { AppRegistry } from 'react-native'

const AppWithStore = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('main', () => AppWithStore)
```

📌 本质一致，只是 **入口不同**

---

## 2️⃣ 持久化方案不同（非常重要）

Redux Toolkit 本身 **不负责持久化**，差异主要体现在 **存储介质**

### React（Web）

常用：

* `localStorage`
* `sessionStorage`
* `IndexedDB`

```ts
import storage from 'redux-persist/lib/storage' // localStorage
```

---

### React Native

❌ **没有 localStorage**

常用：

* `@react-native-async-storage/async-storage`
* Expo：`expo-secure-store`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}
```

📌 **这是 RN 和 Web 最核心的区别之一**

---

## 3️⃣ 网络层差异（fetch / axios 行为不同）

RTK Query / Thunk 本身一致
但底层请求环境不同：

### React（Web）

* 浏览器 `fetch`
* 自动携带 cookie（同源）
* CORS 限制

### React Native

* `fetch` 是 polyfill
* **不自动处理 cookie**
* 无 CORS 概念
* 常配合 `axios`

📌 所以你会看到：

* Web 项目更常用 `fetch + RTK Query`
* RN 项目更偏向 `axios + thunk / RTK Query`

---

## 4️⃣ 与路由系统的配合不同

### React（Web）

* `react-router`
* 在 thunk / middleware 中跳转：

```ts
navigate('/login')
```

### React Native

* `react-navigation` / `expo-router`
* 通常通过：

```ts
navigationRef.navigate('Login')
```

📌 Redux 不变，但**副作用处理方式不同**

---

## 5️⃣ 调试工具不同（体验差异明显）

### React（Web）

* Redux DevTools 浏览器插件（极佳）

```ts
devTools: process.env.NODE_ENV !== 'production'
```

### React Native

* Flipper
* React Native Debugger
* Expo DevTools

📌 **RN 的 Redux 调试体验明显弱于 Web**

---

## 6️⃣ RTK Query 缓存策略使用频率不同（经验差异）

* Web：RTK Query 使用非常广泛（页面缓存、预取）
* RN：RTK Query 用得**稍少**，因为：

  * 页面常驻时间短
  * 更依赖手动请求控制
  * 离线 & 网络波动多

但 **技术上完全支持**

---

## 三、常见项目结构对比

### React 项目

```txt
src/
 ├─ store/
 │   ├─ index.ts
 │   ├─ userSlice.ts
 │   └─ api.ts
 ├─ pages/
 └─ main.tsx
```

### React Native 项目

```txt
src/
 ├─ store/
 │   ├─ index.ts
 │   ├─ userSlice.ts
 │   └─ api.ts
 ├─ screens/
 └─ App.tsx
```

➡️ **store 层结构几乎完全一样**

---

## 四、结论（你可以直接记）

### 一句话总结

> **Redux Toolkit 在 React 和 React Native 中的用法 90% 完全一致，差异主要来自平台环境，而不是 Redux 本身。**

### 核心差异速记表

| 对比点              | React        | React Native     |
| ---------------- | ------------ | ---------------- |
| RTK API          | 一样           | 一样               |
| Provider / hooks | 一样           | 一样               |
| 状态持久化            | localStorage | AsyncStorage     |
| 请求环境             | 浏览器 fetch    | RN fetch / axios |
| 路由集成             | react-router | react-navigation |
| 调试体验             | 非常好          | 一般               |

---

## 五、给你的学习建议（结合你当前背景）

你现在 **React 基础扎实，正在学 RN**，建议：

1. **先把 RTK 在 React 中吃透**

   * `createSlice`
   * `createAsyncThunk`
   * RTK Query
2. **RN 中只补 2 件事**

   * 持久化（AsyncStorage）
   * 导航副作用（navigationRef）

> 学会一次，双端通用，是 Redux Toolkit 最大的价值。

如果你愿意，下一步我可以直接给你一套
**“同一份 Redux Toolkit 代码，同时跑在 React + React Native”** 的实战示例。
