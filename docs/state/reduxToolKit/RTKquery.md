下面给你一套“真实项目可落地”的认证与 Token 刷新方案，覆盖你列的所有必学点：**token 存 Redux 还是 storage、axios/fetch 注入 token、401→refresh、并发只刷新一次（锁/队列）、Redux + axios 拦截器、Store 外部 dispatch**。我按“工程决策 + 可直接复制代码”的方式给出。

---

## 1) Token 存 Redux 还是 storage：真实项目的取舍

### 结论优先（常见最佳实践）

* **Access Token（短期）**：建议“运行时内存为主”，可放 **Redux**（便于注入与 UI 反应），但要配合持久化策略谨慎
* **Refresh Token（长期）**：尽量不要放 Redux/LocalStorage

  * 更安全：**HttpOnly Secure Cookie**（服务端种 cookie，前端 JS 不可读，抗 XSS）
  * 如果只能前端存：尽量放 **Secure storage**（Web 仍然难完全安全），并做好风控（短过期、绑定设备、旋转 refresh token）

### 为什么很多人不把 token 直接放 LocalStorage？

* LocalStorage 可被 XSS 直接读走 → 风险最高
* Redux 状态也会被 XSS 读到，但至少你可以不持久化（刷新页面就没了），减少长期暴露面

### 推荐落地组合（最常见）

* **accessToken：Redux（内存态）+ 可选 sessionStorage（仅会话）**
* **refreshToken：HttpOnly cookie（推荐）**
* 刷新流程：前端拿不到 refreshToken，直接 `POST /auth/refresh`，由 cookie 带上 refresh 凭证，服务端返回新的 accessToken

---

## 2) axios 注入 token：统一入口做，不要每次请求手写

### authSlice：只管“accessToken + 登录态”

```js
// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user ?? state.user;
    },
    clearAuth(state) {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAccessToken = (s) => s.auth.accessToken;
```

---

## 3) Store 外部 dispatch：让拦截器能用 Redux（你前面提过的点）

### store 导出（关键：导出 store 本身）

```js
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: { auth: authReducer },
});
```

### 外部调用示例（不在 React 组件内）

```js
// 任意非 React 文件
import { store } from "../app/store";
import { clearAuth } from "../features/auth/authSlice";

store.dispatch(clearAuth());
```

这就是你说的“Store 外部 dispatch”。

---

## 4) 401 → refresh token：并发只刷新一次（锁 + 队列）——核心实现（axios）

下面是生产项目最常用的并发安全方案：

* 多个请求同时 401
* **只发一次 refresh**
* 其他 401 请求“排队等待”
* refresh 成功：重放所有失败请求
* refresh 失败：清空登录态并跳转登录

### 4.1 创建 axios 实例 + request 注入 token

```js
// src/api/http.js
import axios from "axios";
import { store } from "../app/store";
import { selectAccessToken, setCredentials, clearAuth } from "../features/auth/authSlice";

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true, // 如果 refresh token 走 HttpOnly cookie，必须开启
});

// request：自动注入 access token
http.interceptors.request.use((config) => {
  const state = store.getState();
  const token = selectAccessToken(state);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4.2 刷新锁 + 队列（只刷新一次）

```js
let isRefreshing = false;
let refreshPromise = null;

// 队列：把等待 refresh 的请求挂起来
function createRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      // 你的 refresh API：服务端验证 cookie 中 refreshToken，返回新 accessToken
      const res = await axios.post("/api/auth/refresh", null, { withCredentials: true });
      return res.data; // { accessToken, user? }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
```

### 4.3 response 拦截：捕获 401，执行刷新与重放

```js
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 非 401 直接抛
    if (status !== 401) return Promise.reject(error);

    // 防止死循环：refresh 接口自己 401，不要再进来
    if (originalRequest?.url?.includes("/auth/refresh")) {
      store.dispatch(clearAuth());
      return Promise.reject(error);
    }

    // 标记：同一个请求只重试一次
    if (originalRequest._retry) {
      store.dispatch(clearAuth());
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      // 关键：并发只刷新一次
      if (!isRefreshing) {
        isRefreshing = true;
        const data = await createRefreshPromise();
        isRefreshing = false;

        // 刷新成功：写入新 token
        store.dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      } else {
        // 已在刷新：等待同一个 refreshPromise
        const data = await createRefreshPromise();
        store.dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      }

      // 取最新 token 重放请求
      const token = selectAccessToken(store.getState());
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return http(originalRequest);
    } catch (refreshErr) {
      isRefreshing = false;
      store.dispatch(clearAuth());
      return Promise.reject(refreshErr);
    }
  }
);
```

> 这套实现的关键点是：所有 401 都等待同一个 `refreshPromise`，从而“并发只刷新一次”。

---

## 5) fetch 注入 token：同样能做（用 wrapper），并发锁逻辑复用

如果你不用 axios，可以封一层 `fetchWithAuth`：

* request 前加 `Authorization`
* response 401 → 走同一个 refreshPromise
* 成功后重试一次

思路与上面完全一致，只是拦截点从 axios interceptor 换成 wrapper。

---

## 6) “thunk vs 拦截器”边界：真实项目怎么分工

### 拦截器（系统级横切逻辑）

* 注入 token
* 401 刷新
* 重放请求
* 全局错误上报（可选）

### thunk / RTK Query（业务级数据逻辑）

* 拉取列表、详情、提交表单
* 业务错误展示与页面流程控制

一句话：**刷新 token 是系统级能力，适合放在拦截器或 baseQuery；业务请求逻辑不应该重复写刷新处理。**

---

## 7) RTK Query 场景：更“官方”的 reauth 写法（可替代 axios 方案）

如果你已经在用 RTK Query，推荐把刷新逻辑放到自定义 `baseQuery`，实现方式与拦截器等价，效果是：

* 所有 endpoints 自动获得“401 刷新 + 重试一次”
* 仍然需要“并发只刷新一次”的锁（同理）

如果你要我给 RTK Query 的 `baseQueryWithReauth` 完整版（带并发锁），我可以按你现有的 API 结构直接补齐。

---

## 8) 你必须验证的行为清单（落地验收）

1. accessToken 过期时，任何请求 401 会触发 refresh
2. 多个请求同时 401：只打一次 refresh
3. refresh 成功：所有失败请求自动重放成功
4. refresh 失败：清空 auth，跳登录（或提示重新登录）
5. refresh 接口 401 不会进入无限循环
6. 重试次数受控（每个请求最多重试一次）

---

如果你希望我把这套方案直接“集成进你前面那个 RTK Query 列表/详情项目”，我建议走两条路线任选其一（我会直接给出对应代码）：

* 路线 A：继续用 axios（上面拦截器方案）+ 普通 React 请求
* 路线 B：RTK Query + `baseQueryWithReauth`（数据层更干净，几乎不写 reducer）
