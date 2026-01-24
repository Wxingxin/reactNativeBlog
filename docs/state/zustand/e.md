下面我**系统、一步一步**教你：**为什么要在 Store 外部操作 Zustand 状态，以及如何在真实项目中正确使用**
（你给的例子 `useAuthStore.getState().logout()` 是**标准且推荐的高级用法**）

---

## 一、问题本质：为什么要「在 Store 外部」操作状态？

### React 组件内（常规方式）

```ts
const logout = useAuthStore((s) => s.logout);
logout();
```

**限制：**

* ❌ 只能在 React 组件 / Hook 中使用
* ❌ 不能在普通 JS / TS 文件里用
* ❌ 不能在 axios、router、utils 中直接用

---

### Store 外部（核心能力）

```ts
useAuthStore.getState().logout();
```

**优势：**

* ✅ 不依赖 React
* ✅ 任意文件都能用
* ✅ 非 UI 逻辑的「全局控制点」

这正是 Zustand **优于 Redux / Context 的地方之一**

---

## 二、核心 API：`getState()` 是什么？

### Zustand Store 本质

```ts
const useAuthStore = create((set, get) => ({
  token: null,
  logout: () => set({ token: null }),
}));
```

Zustand 的 Store **不是 Hook**，而是一个对象：

```ts
useAuthStore = {
  getState,
  setState,
  subscribe,
}
```

### `getState()`

```ts
useAuthStore.getState()
// => 返回当前最新状态（不触发渲染）
```

---

## 三、最小可用 Auth Store（标准结构）

```ts
// stores/auth.store.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  login: (token, user) =>
    set({ token, user }),

  logout: () =>
    set({ token: null, user: null }),
}));
```

---

## 四、用途 1：路由守卫（Router Guard）

### 场景

* 用户 token 失效
* 未登录禁止访问某些页面

---

### React Router 示例（推荐写法）

```ts
// router/guard.ts
import { useAuthStore } from '@/stores/auth.store';
import { Navigate } from 'react-router-dom';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const token = useAuthStore.getState().token;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

**重点**

* 不用 Hook
* 不受组件层级限制
* 可用于路由配置文件

---

### token 失效 → 强制退出

```ts
useAuthStore.getState().logout();
```

---

## 五、用途 2：axios 拦截器（最常见 & 最重要）

> **99% 的前端项目都会用到这一点**

---

### axios 实例

```ts
// utils/request.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});
```

---

### 请求拦截器：自动带 token

```ts
request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

---

### 响应拦截器：token 失效 → 退出登录

```ts
request.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**为什么必须用 `getState()`？**

* axios 不是 React
* 不能用 Hook
* Redux 要写中间件，Zustand 一行解决

---

## 六、用途 3：非 React 文件（utils / services / sdk）

### 示例 1：WebSocket

```ts
// ws/client.ts
import { useAuthStore } from '@/stores/auth.store';

export function connectWS() {
  const token = useAuthStore.getState().token;

  const ws = new WebSocket(`wss://xxx.com?token=${token}`);

  ws.onmessage = (e) => {
    if (e.data === 'INVALID_TOKEN') {
      useAuthStore.getState().logout();
    }
  };
}
```

---

### 示例 2：定时器 / 后台任务

```ts
setInterval(() => {
  const { token, logout } = useAuthStore.getState();

  if (!token) {
    logout();
  }
}, 60000);
```

---

## 七、什么时候**不要**用 `getState()`？

### ❌ 不要在 React 组件里滥用

```tsx
// 不推荐
const token = useAuthStore.getState().token;
```

原因：

* ❌ 不会触发重新渲染
* ❌ UI 不更新

---

### ✅ 正确：组件里用 Hook

```tsx
const token = useAuthStore((s) => s.token);
```

---

## 八、最佳实践总结（记住这张表）

| 场景            | 用法                           |
| ------------- | ---------------------------- |
| React 组件 UI   | `useAuthStore((s) => s.xxx)` |
| axios / fetch | `useAuthStore.getState()`    |
| router        | `useAuthStore.getState()`    |
| utils / sdk   | `useAuthStore.getState()`    |
| WebSocket     | `useAuthStore.getState()`    |

---

## 九、一句话记忆法（非常重要）

> **UI 用 Hook，逻辑用 getState**

---

## 十、如果你愿意，我可以继续教你

* Zustand + **persist**（登录态持久化）
* Zustand + **middleware**
* 多 Store 解耦（auth / user / app）
* Zustand vs Redux Toolkit 实战对比
* 如何防止 `getState()` 被滥用

你可以直接说：
**「继续教我 Zustand 的进阶用法」**
