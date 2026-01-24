## Zustand 异步逻辑使用案例大全（JSONPlaceholder）

本文使用免费 API：JSONPlaceholder 的 `users` 接口来演示常见异步场景。  
目标：让学生掌握 **加载态、错误处理、缓存、取消请求、按需查询** 等实用模式。

---

## 1）Store 基础结构（状态 + 动作）

```js
// user.store.js
import { create } from 'zustand'

// 免费接口：用户数据
const API_BASE = 'https://jsonplaceholder.typicode.com'

// 用于取消请求，避免“后发先至”的数据乱序
let usersAbortController = null
let userAbortController = null

export const useUserStore = create((set, get) => ({
  // ===== 基础状态 =====
  users: [],
  user: null,

  // 列表请求状态
  status: 'idle', // idle | loading | success | error
  error: null,

  // 单用户请求状态
  userStatus: 'idle',
  userError: null,

  // 其他辅助状态
  lastFetchedAt: null,
  searchTerm: '',
  searchResults: [],

  // ===== 异步动作：拉取用户列表 =====
  fetchUsers: async () => {
    // 1) 取消上一次列表请求
    if (usersAbortController) usersAbortController.abort()
    usersAbortController = new AbortController()

    // 2) 进入 loading 态
    set({ status: 'loading', error: null })
    try {
      // 3) 发起请求
      const response = await fetch(`${API_BASE}/users`, {
        signal: usersAbortController.signal,
      })
      if (!response.ok) throw new Error('Fetch users failed')

      // 4) 解析数据并更新 store
      const data = await response.json()
      set({
        users: data,
        status: 'success',
        lastFetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      // 5) 如果是取消请求，不做错误处理
      if (err?.name === 'AbortError') return
      set({ status: 'error', error: err?.message ?? 'Unknown error' })
    }
  },

  // ===== 异步动作：拉取单个用户 =====
  fetchUserById: async (id) => {
    // 1) 参数校验
    const userId = Number(id)
    if (!Number.isFinite(userId)) {
      set({ userStatus: 'error', userError: 'Invalid user id' })
      return
    }

    // 2) 简单缓存：列表里有就直接用
    const cached = get().users.find((u) => u.id === userId)
    if (cached) {
      set({ user: cached, userStatus: 'success', userError: null })
      return
    }

    // 3) 取消上一次单用户请求
    if (userAbortController) userAbortController.abort()
    userAbortController = new AbortController()

    // 4) 进入 loading 态并请求
    set({ userStatus: 'loading', userError: null })
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        signal: userAbortController.signal,
      })
      if (!response.ok) throw new Error('Fetch user failed')

      // 5) 更新单个用户数据
      const data = await response.json()
      set({ user: data, userStatus: 'success' })
    } catch (err) {
      if (err?.name === 'AbortError') return
      set({ userStatus: 'error', userError: err?.message ?? 'Unknown error' })
    }
  },

  // ===== 异步动作：刷新列表（语义更清晰） =====
  refreshUsers: async () => {
    await get().fetchUsers()
  },

  // ===== 异步动作：搜索（先拉取，再本地过滤） =====
  searchUsersByName: async (term) => {
    const keyword = term.trim()
    set({ searchTerm: keyword })

    // 1) 空关键词：清空结果
    if (!keyword) {
      set({ searchResults: [] })
      return
    }

    // 2) 列表为空则先拉取
    if (get().users.length === 0) {
      await get().fetchUsers()
    }

    // 3) 本地过滤（不走网络）
    const results = get().users.filter((u) =>
      u.name.toLowerCase().includes(keyword.toLowerCase())
    )
    set({ searchResults: results })
  },

  // ===== 纯同步动作 =====
  clearSearch: () => set({ searchTerm: '', searchResults: [] }),
  clearUser: () => set({ user: null, userStatus: 'idle', userError: null }),
}))

```

**课堂提示**：  
- `status / error` 是异步必备的“过程状态”  
- `AbortController` 能避免多次请求引发的数据乱序  
- `get()` 可读 store 当前数据，用于缓存/复用  

---

## 2）案例一：列表加载 + Loading/Error

```jsx
import { useEffect } from "react";
import { useUserStore } from "./store/user.store";

export default function UserList() {
  const { users, status, error, fetchUsers } = useUserStore((s) => ({
    users: s.users,
    status: s.status,
    error: s.error,
    fetchUsers: s.fetchUsers,
  }));

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

---

## 3）案例二：刷新按钮（重新请求）

```jsx
const { refreshUsers, lastFetchedAt } = useUserStore((s) => ({
  refreshUsers: s.refreshUsers,
  lastFetchedAt: s.lastFetchedAt,
}));

<button onClick={refreshUsers}>refresh</button>;
<div>last: {lastFetchedAt ?? "-"}</div>;
```

---

## 4）案例三：按 ID 获取单个用户（含缓存）

```jsx
const { user, userStatus, userError, fetchUserById } = useUserStore((s) => ({
  user: s.user,
  userStatus: s.userStatus,
  userError: s.userError,
  fetchUserById: s.fetchUserById,
}));

<button onClick={() => fetchUserById(3)}>load user 3</button>;
{userStatus === "loading" && <div>Loading user...</div>}
{userStatus === "error" && <div>{userError}</div>}
{user && <div>{user.name}</div>}
```

**说明**：  
如果 `users` 列表已有数据，会直接从缓存命中。  

---

## 5）案例四：本地搜索（先拉取再过滤）

```jsx
const { searchTerm, searchResults, searchUsersByName, clearSearch } =
  useUserStore((s) => ({
    searchTerm: s.searchTerm,
    searchResults: s.searchResults,
    searchUsersByName: s.searchUsersByName,
    clearSearch: s.clearSearch,
  }));

<input
  value={searchTerm}
  onChange={(e) => searchUsersByName(e.target.value)}
  placeholder="search by name"
/>;
<button onClick={clearSearch}>clear</button>;
<div>{searchResults.map((u) => u.name).join(", ")}</div>;
```

---

## 6）案例五：取消上一次请求（避免乱序）

当快速点击“刷新”时，后发请求可能比先发请求更早返回。  
使用 `AbortController` 可以保证“只保留最后一次请求的结果”。

**关键代码（store 内部）**：

```js
if (usersAbortController) usersAbortController.abort();
usersAbortController = new AbortController();

const response = await fetch(`${API_BASE}/users`, {
  signal: usersAbortController.signal,
});
```

---

## 7）教学要点总结（建议学生背下来）

1) **异步必备 3 件套**：`loading / error / data`  
2) **避免重复请求**：先查缓存，再决定 fetch  
3) **避免乱序**：用 `AbortController`  
4) **衍生数据不放 store**：组件计算即可  
5) **把业务写进 store，把 UI 留给组件**
```js
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "../store/user.store";

export default function A() {
  // Selector：取出异步相关状态与动作
  const {
    users,
    user,
    status,
    userStatus,
    error,
    userError,
    lastFetchedAt,
    fetchUsers,
    fetchUserById,
    refreshUsers,
    searchTerm,
    searchResults,
    searchUsersByName,
    clearSearch,
    clearUser,
  } = useUserStore(
    useShallow((s) => ({
      users: s.users,
      user: s.user,
      status: s.status,
      userStatus: s.userStatus,
      error: s.error,
      userError: s.userError,
      lastFetchedAt: s.lastFetchedAt,
      fetchUsers: s.fetchUsers,
      fetchUserById: s.fetchUserById,
      refreshUsers: s.refreshUsers,
      searchTerm: s.searchTerm,
      searchResults: s.searchResults,
      searchUsersByName: s.searchUsersByName,
      clearSearch: s.clearSearch,
      clearUser: s.clearUser,
    }))
  );

  // 输入框：按 ID 查询单个用户
  const [userIdInput, setUserIdInput] = useState("");

  return (
    <div>
      <h2>异步逻辑示例（Users）</h2>

      <div>
        <button onClick={fetchUsers}>load users</button>
        <button onClick={refreshUsers}>refresh</button>
        <span> last: {lastFetchedAt ?? "-"}</span>
      </div>

      {status === "loading" && <div>Loading users...</div>}
      {status === "error" && <div>Error: {error}</div>}
      {status === "success" && (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}

      <hr />

      <div>
        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          placeholder="User id (1-10)"
        />
        <button onClick={() => fetchUserById(userIdInput)}>load by id</button>
        <button onClick={clearUser}>clear</button>
      </div>

      {userStatus === "loading" && <div>Loading user...</div>}
      {userStatus === "error" && <div>Error: {userError}</div>}
      {user && (
        <div>
          <div>name: {user.name}</div>
          <div>email: {user.email}</div>
        </div>
      )}

      <hr />

      <div>
        <input
          value={searchTerm}
          onChange={(e) => searchUsersByName(e.target.value)}
          placeholder="Search by name"
        />
        <button onClick={clearSearch}>clear</button>
      </div>
      <div>{searchResults.map((u) => u.name).join(", ")}</div>
    </div>
  );
}
```