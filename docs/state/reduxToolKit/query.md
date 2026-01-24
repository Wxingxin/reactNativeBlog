下面给你一套“**用 RTK Query 取代 80% 手写 thunk**”的完整学习与落地方案：涵盖 `createApi`、`fetchBaseQuery`、`query vs mutation`、自动缓存/失效、loading/error 自动管理、Token 注入，并给出**必做案例：列表 + 详情 + 新增/删除自动刷新**。最终产出是：**几乎不写 reducer 的数据层**。

---

## 1) 你要达成的目标：为什么 RTK Query 能替代大多数 thunk？

### 手写 thunk 通常要写的内容

* `status/error/data` 三件套 state
* `pending/fulfilled/rejected` 三段 extraReducers
* 缓存、去重、过期、刷新、重试（要自己补）

### RTK Query 自带（你基本不用写）

* 自动生成 hooks：`useGetPostsQuery()`、`useAddPostMutation()` 等
* 自动缓存（按 queryKey）
* 自动去重（相同参数请求共用）
* 自动管理 `isLoading / isFetching / error / data`
* 通过 tags 做“失效刷新”：新增/删除后自动让列表重新拉取

> 所以：RTK Query 负责“数据层”，Redux slice 更适合“UI 状态/跨页状态”（如主题、弹窗、临时筛选条件、表单草稿等）。

---

## 2) 核心概念速记（面试+实战都要会）

### createApi

* 定义一套 API 服务：baseQuery + endpoints
* 自动生成 reducer + middleware + hooks

### fetchBaseQuery

* RTK Query 内置的轻量 fetch 封装（够用且推荐）
* 支持 `prepareHeaders` 注入 token
* 支持 `params/body/method`

### query vs mutation

* **query**：读数据（GET），结果会缓存
* **mutation**：写数据（POST/PUT/DELETE），默认不缓存结果，常用于触发失效（刷新相关 query）

### 自动缓存 & 失效

* 缓存：同样的 query 参数会命中缓存，组件卸载后也会保留一段时间（默认 60s）
* 失效：mutation 成功后 `invalidatesTags`，相关 query `providesTags` 会自动重拉

---

## 3) 最小可运行结构（“几乎不写 reducer 的数据层”）

建议目录（feature-based）：

```
src/
  app/
    store.js
  features/
    auth/
      authSlice.js              # 只放 token 等“非服务端数据”
    posts/
      postsApi.js               # RTK Query 核心
      PostsList.jsx
      PostDetail.jsx
      PostCreate.jsx
  App.jsx
  main.jsx
```

你会发现：**posts 不需要写 postsSlice**，数据由 RTK Query 管。

---

## 4) 完整代码（可直接用）

### 4.1 authSlice：只存 token（数据层不在这里）

```js
// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: "demo-token", // 示例：真实项目来自登录
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
```

---

### 4.2 postsApi：createApi + fetchBaseQuery + Token 注入 + tags

这里用 JSONPlaceholder 做演示（它对写操作是模拟的，但足够演练 RTKQ 模式）。baseUrl 你可改成 `'/api'` 接你的后端。

```js
// src/features/posts/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi", // store 里挂载用
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Posts", "Post"],

  endpoints: (builder) => ({
    // 列表：GET /posts
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: (result) =>
        result
          ? [
              { type: "Posts", id: "LIST" },
              ...result.map((p) => ({ type: "Post", id: p.id })),
            ]
          : [{ type: "Posts", id: "LIST" }],
    }),

    // 详情：GET /posts/:id
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    // 新增：POST /posts
    addPost: builder.mutation({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      // 新增成功后让列表失效 -> 自动重拉列表
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),

    // 删除：DELETE /posts/:id
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      // 删除后让列表失效，同时也让该详情失效
      invalidatesTags: (result, error, id) => [
        { type: "Posts", id: "LIST" },
        { type: "Post", id },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddPostMutation,
  useDeletePostMutation,
} = postsApi;
```

---

### 4.3 store：挂载 RTK Query reducer + middleware（关键步骤）

```js
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { postsApi } from "../features/posts/postsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [postsApi.reducerPath]: postsApi.reducer, // 自动缓存数据在这里
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

---

### 4.4 main.jsx：Provider

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

---

## 5) 必做案例：列表 + 详情 + 新增/删除自动刷新

### 5.1 列表：PostsList（自动 loading/error）

```jsx
// src/features/posts/PostsList.jsx
import React from "react";
import { useGetPostsQuery, useDeletePostMutation } from "./postsApi";

export default function PostsList({ onSelect }) {
  const { data, error, isLoading, isFetching, refetch } = useGetPostsQuery();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts.</div>;

  const posts = data?.slice(0, 10) ?? [];

  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Posts (top 10)</h3>
        <button onClick={refetch} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refetch"}
        </button>
      </div>

      <ul>
        {posts.map((p) => (
          <li key={p.id} style={{ margin: "8px 0" }}>
            <button onClick={() => onSelect(p.id)} style={{ marginRight: 8 }}>
              View #{p.id}
            </button>
            <span>{p.title}</span>

            <button
              style={{ marginLeft: 8 }}
              onClick={() => deletePost(p.id)}
              disabled={isDeleting}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.2 详情：PostDetail（按 id 缓存）

```jsx
// src/features/posts/PostDetail.jsx
import React from "react";
import { useGetPostQuery } from "./postsApi";

export default function PostDetail({ id }) {
  const { data, error, isLoading, isFetching } = useGetPostQuery(id, {
    skip: !id, // 没有 id 就不请求
  });

  if (!id) return <div style={{ padding: 12 }}>Select a post.</div>;
  if (isLoading) return <div style={{ padding: 12 }}>Loading detail...</div>;
  if (error) return <div style={{ padding: 12 }}>Error loading detail.</div>;

  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Post #{data.id}</h3>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          {isFetching ? "Updating..." : "Cached"}
        </span>
      </div>
      <p>
        <b>{data.title}</b>
      </p>
      <p>{data.body}</p>
    </div>
  );
}
```

### 5.3 新增：PostCreate（mutation + invalidatesTags 自动刷新列表）

```jsx
// src/features/posts/PostCreate.jsx
import React, { useState } from "react";
import { useAddPostMutation } from "./postsApi";

export default function PostCreate() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [addPost, { isLoading, error, isSuccess }] = useAddPostMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addPost({ title, body, userId: 1 }).unwrap();
    setTitle("");
    setBody("");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Create Post</h3>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </button>
      </form>

      {error ? <div style={{ marginTop: 8 }}>Create failed.</div> : null}
      {isSuccess ? (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Created. List will refresh automatically via invalidatesTags.
        </div>
      ) : null}
    </div>
  );
}
```

### 5.4 App：把“列表 + 详情 + 新增”串起来

```jsx
// src/App.jsx
import React, { useState } from "react";
import PostsList from "./features/posts/PostsList";
import PostDetail from "./features/posts/PostDetail";
import PostCreate from "./features/posts/PostCreate";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1>RTK Query Demo</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <PostCreate />
          <PostsList onSelect={setSelectedId} />
        </div>
        <PostDetail id={selectedId} />
      </div>
    </div>
  );
}
```

---

## 6) 这套案例如何满足你的“学习目标”？

### 列表 + 详情

* `useGetPostsQuery()` 缓存列表
* `useGetPostQuery(id)` 缓存每个 id 的详情
* 组件卸载后缓存仍在（默认 60s），回来秒开（命中缓存）

### 新增 / 删除自动刷新

* `addPost` 成功：`invalidatesTags: Posts/LIST` → 列表 query 自动重拉
* `deletePost` 成功：同理刷新列表，并使详情失效

### Token 注入

* `fetchBaseQuery.prepareHeaders` 里读 `getState().auth.token`
* 自动给每次请求加 `Authorization`

### 产出物：几乎不写 reducer 的数据层

* posts 数据没有写 `postsSlice`
* UI 的 `loading/error/data` 没写状态机
* 一切由 RTK Query 管控

---

## 7) 你必须掌握的几个“关键点”（避免踩坑）

1. **store 必须接入**

* `postsApi.reducer`
* `postsApi.middleware`
  否则 hooks 不工作或缓存/失效不生效

2. **query 用 providesTags，mutation 用 invalidatesTags**

* 不配 tags，新增/删除不会自动刷新

3. **区分 isLoading vs isFetching**

* `isLoading`：第一次加载（没有缓存）
* `isFetching`：刷新/重新拉取（可能已有缓存）

4. **用 unwrap 获取 mutation 的真实异常**

* `await addPost(...).unwrap()` 便于 try/catch 与表单处理

---

如果你下一步要把它升级到“生产级”：

* 401 自动刷新 token（并发只刷新一次）
* 分页 / 无限滚动
* 乐观更新（新增/删除先更新 UI，再回滚）
  我可以在这套结构上继续扩展，仍然保持“几乎不写 reducer”的数据层风格。
