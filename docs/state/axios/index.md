下面给你一条**面向 React 项目实战**的 Axios 学习路线（从“会用”到“工程化可复用”），按阶段推进。你按顺序做，基本就能把 Axios 在 React 里的常见坑、最佳实践和面试点一起覆盖掉。

---

## 阶段 0：先建立正确认知（0.5 天）

你要先明确三件事：

1. **Axios 是 HTTP Client**：负责发请求、处理响应、拦截、取消、超时、上传下载等。
2. **React 不负责请求**：React 负责 UI 与状态；请求层要工程化（封装、错误处理、鉴权、重试、缓存策略）。
3. **Axios vs Fetch**：Fetch 更底层，Axios 更“工程化”（拦截器、默认 JSON、XSRF、请求取消、超时等更顺手）。

目标：知道 Axios 在项目中的职责边界——**请求层**，而不是组件里到处散落 `axios.get()`。

---

## 阶段 1：Axios 基础 API（1–2 天）

把最常用的用法吃透，重点是“请求配置”和“响应结构”。

### 1.1 安装与基础调用

* `axios.get/post/put/patch/delete`
* `axios({ method, url, params, data, headers })`
* `params`（querystring） vs `data`（request body）

### 1.2 常用配置项（必须熟）

* `baseURL`
* `timeout`
* `headers`
* `withCredentials`（Cookie/跨域）
* `responseType`（blob/arraybuffer/json）
* `validateStatus`（自定义哪些状态码算成功）

### 1.3 错误处理模型（关键）

你要清楚 Axios 报错时你能从 error 里拿到什么：

* `error.response`：服务端返回了非 2xx
* `error.request`：请求发出去了但没收到响应（网络问题）
* `error.message`：其他错误（配置等）

输出物：写一个 demo 页，完成 CRUD + 错误提示（toast / message），并能区分网络错误与业务错误。

---

## 阶段 2：Axios 实例化与模块化封装（1–2 天）

React 项目里不建议全局直接用默认 axios，建议创建实例。

### 2.1 创建 `httpClient`

* `axios.create({ baseURL, timeout })`
* 统一管理 headers、环境变量、API 前缀

### 2.2 分层设计（推荐结构）

* `src/api/http.ts`：axios 实例 + 拦截器
* `src/api/user.ts`：具体业务接口（login / profile / list…）
* `src/utils/token.ts`：token 读写
* `src/utils/error.ts`：错误文案与统一解析

目标：组件里只调用 `api.user.getProfile()`，而不是写 URL。

---

## 阶段 3：拦截器体系（2–4 天，工程化核心）

这是 Axios 在 React 项目里最“值钱”的部分。

### 3.1 Request Interceptor：自动携带 Token

* 从 localStorage/cookie 取 token
* 放到 `Authorization: Bearer <token>` 或自定义 header

### 3.2 Response Interceptor：统一解包与错误策略

常见后端返回结构：

* `{ code, message, data }`
  你要做的：
* 对 `code != 0` 抛出“业务错误”
* 对 `401` 做“登录失效”策略（跳转登录/清 token）
* 对 `5xx` 统一提示“服务器异常”

### 3.3 防止拦截器叠加（常见坑）

React 开发时热更新/重复挂载会导致拦截器重复注册。你要学会：

* 在模块初始化处注册一次
* 或保存 interceptor id，并在必要时 eject

输出物：形成“全局统一错误处理 + 401 处理”的可复用模板。

---

## 阶段 4：取消请求与竞态控制（1–2 天）

React 场景里非常常见：组件卸载 / 输入框联想 / 快速切换 tab。

### 4.1 AbortController（推荐）

* 每次请求创建 controller
* 新请求发起前 abort 上一次（搜索建议/联想）
* 组件卸载时 abort（避免 setState warning）

### 4.2 竞态：只保留最后一次请求结果

* “最后一次 wins”策略（尤其搜索）
* 搭配 requestId/时间戳 或 abort

输出物：做一个搜索框联想 demo（输入快速变化不乱跳、不闪回）。

---

## 阶段 5：鉴权与 Refresh Token（2–4 天，高频面试点）

你要把“token 过期自动刷新”做成**并发安全**的。

核心能力点：

* 401 触发 refresh
* 多个请求同时 401 时只刷新一次（队列/锁）
* 刷新成功后重放原请求
* 刷新失败清理登录态并跳转

输出物：实现 refresh token 方案，并写清楚并发控制逻辑。

---

## 阶段 6：文件上传/下载（1–2 天）

### 6.1 上传

* `multipart/form-data`
* `onUploadProgress` 做进度条
* 大文件：分片上传（了解思路即可）

### 6.2 下载

* `responseType: 'blob'`
* 解析 `content-disposition`（了解）
* 前端创建 URL 下载

输出物：上传头像 + 进度条；下载文件按钮。

---

## 阶段 7：与 React 状态方案结合（2–5 天）

这一步决定你在项目里“用 Axios 还是用更高层的请求库”。

### 7.1 组件内手写请求（入门必会）

* `useEffect` + `useState` + `loading/error`
* 处理取消、依赖、重复请求

### 7.2 推荐：与 TanStack Query（React Query）结合（强烈建议）

模式：**Axios 只做请求层**，缓存/重试/状态交给 React Query

* queryFn 用 axios
* 全局错误处理与 toast
* 401 策略与拦截器配合
* mutation 的乐观更新

输出物：用 React Query + axios 做列表分页、详情、编辑保存、删除、乐观更新。

---

## 阶段 8：生产级优化与规范（持续）

### 8.1 统一类型与规范（你用 JS/JSX 也建议了解）

* 统一响应结构解析
* 统一错误码字典
* 统一日志埋点（失败率、耗时）

### 8.2 安全与跨域

* CORS、Cookie、SameSite、withCredentials
* XSRF（Axios 支持 xsrf header/cookie 配置）
* 生产环境 baseURL 与代理配置（Vite/CRA）

### 8.3 可观测性

* 请求耗时统计
* trace-id 透传（header）

---

## 推荐的“练习项目路径”（最有效）

按这个顺序做，你学得最快：

1. **用户登录 + 个人信息**：token 自动注入 + 401 处理
2. **列表分页 + 详情**：params、取消请求、竞态
3. **编辑/删除**：统一错误、toast、乐观更新（配合 React Query）
4. **refresh token**：并发安全重放
5. **上传/下载**：进度条与 blob

---

## 你照着学的交付物清单（学完即项目可用）

* `axios.create()` 的 http 实例
* request/response 拦截器（token、解包、错误统一）
* 401 + refresh token 并发安全方案
* abort/取消请求工具
* 文件上传下载封装
* 与 React Query 的整合模板（query/mutation + 全局错误）

---

如果你希望我把这条路线进一步“落地成目录结构 + 代码模板”（JS/JSX 版本），我可以直接给你一套可复制到 React 项目里的 `src/api/*`、拦截器、refresh 并发队列、以及配套的 React Query 示例页面。你目前是 Vite + React 吗，还是 CRA/Next.js？
