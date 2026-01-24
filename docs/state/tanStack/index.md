下面给你一条在 **React 中学习 TanStack（以 TanStack Query 为核心）** 的详细路线，按“从能用 → 用对 → 用好 → 工程化/高阶”的顺序规划。你是前端背景（React 基础已具备），这条路线会更偏项目落地与最佳实践。

---

## 0. 先明确 TanStack 你要学什么

TanStack 是一组库的集合，最常用的是：

- **TanStack Query（最优先）**：服务端状态（Server State）管理，数据获取、缓存、同步、失效、分页、乐观更新等。
- TanStack Table：表格（列定义、排序筛选、分页、虚拟滚动）
- TanStack Router：类型安全路由（可选）
- TanStack Virtual：虚拟列表（大列表性能）
- TanStack Form：表单（生态中相对没 Query/ Table 普及）

你的学习顺序建议：
**Query（主线）→ Virtual（配合列表）→ Table（管理后台必备）→ Router（可选）**

---

## 1. 第 1 阶段：入门到能写（核心概念 + 最小可用）

目标：你能把一个 CRUD 页面用 Query 写出来，并且理解它为什么比 useEffect+useState 更稳。

### 1.1 必会概念（先学这些）

- Server State vs Client State：为什么 Query 管的是“服务端数据”
- Query Key：缓存的唯一标识、参数化 key 的组织方式
- `useQuery`：拉取数据、缓存、状态机（loading/error/success）
- `useMutation`：提交数据（新增/编辑/删除）
- `invalidateQueries`：提交后让列表自动刷新
- `enabled`：条件请求（例如需要 id 才请求）
- `select`：在 Query 层做数据映射（避免组件层到处处理）

### 1.2 你要能写的页面形态

- 列表页：搜索 + 筛选 + 刷新
- 详情页：根据 id 获取详情
- 新增/编辑页：mutation + 成功后刷新列表/跳详情
- 删除：mutation + 成功后列表更新（invalidate 或 cache 更新）

### 1.3 关键工程点（立刻养成习惯）

- 统一封装 API 层（fetch/axios 都可以）
- Query Key 统一管理（一个文件集中导出）
- 把 QueryClient 配好默认策略（重试、staleTime、gcTime 等）

---

## 2. 第 2 阶段：用对（缓存策略 + 请求控制 + 交互体验）

目标：你能解释“为什么有时不请求”“为什么秒开”“为什么会自动刷新”。

### 2.1 缓存与一致性（学习重点）

- `staleTime`：数据多久算“新鲜”，影响是否重新请求
- `gcTime`（旧叫 cacheTime）：不用的数据多久被清掉
- `refetchOnWindowFocus` / `refetchOnReconnect`：切回页面是否自动更新
- `retry` / `retryDelay`：失败重试策略（后端不稳定时很关键）

### 2.2 依赖与并发控制

- 依赖请求：先拿 user，再用 userId 拉 list（`enabled`）
- 并发请求：`useQueries`（多个 query 并行）
- 取消请求：与 fetch 的 AbortController 配合（你之前问过 controller，正好用上）

### 2.3 数据转换与组件解耦

- 在 Query 的 `select` 做数据整形
- 组件只消费“组件需要的形状”，不要到处 map/format

---

## 3. 第 3 阶段：用好（分页/无限滚动/预取/乐观更新）

目标：你能把真实业务体验做出来：翻页不卡、搜索丝滑、提交立即反馈。

### 3.1 分页两种范式（必须掌握）

- **传统分页**：page + pageSize（`keepPreviousData` 思路）
- **无限滚动**：`useInfiniteQuery`（cursor 或 page 递增）

### 3.2 Prefetch（性能体验提升）

- 列表 hover 或进入视口时 **预取详情**
- 路由跳转前预取（配合 React Router/Expo Router 思想相通）

### 3.3 乐观更新（高频面试点/实战高价值）

- 点赞/收藏/勾选类：先更新 UI，再提交
- `onMutate` / `onError` 回滚 / `onSettled` 兜底刷新
- `setQueryData` 精准改缓存（避免全量 invalidate 的“粗暴刷新”）

---

## 4. 第 4 阶段：工程化与质量（错误处理、鉴权、测试、规范）

目标：团队协作、可维护、可观测。

### 4.1 全局错误与提示体系

- QueryClient 默认 `onError`（配合 toast）
- 统一处理 401：token 过期跳登录
- 区分“业务错误”和“网络错误”（展示文案策略不同）

### 4.2 鉴权与 Token 刷新

- axios 拦截器 or fetch wrapper：自动带 token
- refresh token 流程与并发请求的“只刷新一次”控制（重要）

### 4.3 Devtools + 监控

- TanStack Query Devtools：定位缓存、key、状态非常高效
- 关键接口埋点：慢请求、失败率、重试次数

### 4.4 测试策略（按你实际需要选）

- React Testing Library：对 Query 场景的测试（mock server）
- MSW（Mock Service Worker）：更贴近真实网络

---

## 5. 第 5 阶段：高阶与扩展（需要时再深入）

目标：你能解决复杂一致性/性能问题。

- SSR/SSG 场景（Next.js）：dehydrate/hydrate（如果你用 Next.js 很值得学）
- 复杂缓存分层：按 tenant/user/environment 切 key
- 大数据列表性能：TanStack Virtual + Infinite Query
- 管理后台：TanStack Table + Query（筛选排序与后端接口契合）

---

## 6. 建议的“项目驱动”练习路径（最有效）

按这个项目逐步迭代，学习效果最好：

1. **任务管理（Todo/Issue）系统**

- 登录（可选）
- 列表 + 详情 + 新增 + 编辑 + 删除

2. 加强体验

- 搜索/筛选（key 参数化）
- 分页（传统分页）

3. 上强度

- 无限滚动（useInfiniteQuery）
- 预取详情（prefetchQuery）
- 乐观更新（onMutate）

4. 工程化

- 统一 QueryKey + API 层
- 全局错误处理 + 401 跳转
- Devtools + MSW

做完这套，你在面试/实战中基本就能自如应对 TanStack Query 的常见场景。

---

## 7. 你可以照抄的学习节奏（按“知识块”推进）

如果你希望有一个“清单式规划”，可以按下面顺序学习与编码：

1. QueryClientProvider、Devtools
2. `useQuery` + key 设计
3. `useMutation` + invalidate
4. staleTime/gcTime/refetch 策略
5. enabled + 依赖请求
6. select + 数据整形
7. 分页（keep previous）→ 无限滚动
8. 预取（prefetchQuery）
9. 乐观更新（setQueryData）
10. 全局错误/鉴权/封装与规范11.（可选）Next.js 的 SSR hydration 12.（扩展）Virtual/Table/Router

---

如果你告诉我你现在的项目类型更偏哪一种：
1）管理后台（表格多、筛选多）
2）内容流（无限滚动多）
3）电商（购物车/库存一致性多）
我可以把上面的路线进一步“具体到页面任务清单 + 每一步要写的模块结构”，并给你一套更贴近你业务的训练计划。

---

## 一、React Query 是什么？

**React Query（现名：TanStack Query）**是一个**专门管理「服务端状态（Server State）」的库**。

> 一句话定义：
> **React Query = 帮你管理接口请求、缓存、同步、刷新、错误、加载状态的一整套方案**

它解决的不是 UI 状态（如 modal 是否打开），而是：

- 接口数据
- 请求状态
- 缓存一致性
- 数据是否需要重新拉取

---

## 二、它解决了什么痛点？

在没有 React Query 之前，你大概率写过这种代码：

```js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch("/api/user")
    .then((res) => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

**问题很多：**

1. ❌ loading / error / data 都要自己管
2. ❌ 页面切换回来要不要重新请求？不知道
3. ❌ 多个组件用同一个接口会重复请求
4. ❌ 提交数据后要手动刷新列表
5. ❌ 缓存、过期、重试都要自己写

---

### React Query 帮你统一解决：

| 问题            | React Query       |
| --------------- | ----------------- |
| loading / error | 自动管理          |
| 接口缓存        | 自动缓存          |
| 重复请求        | 自动去重          |
| 数据过期        | staleTime         |
| 自动刷新        | refetch           |
| 提交后更新      | invalidateQueries |
| 网络异常        | 自动重试          |

---

## 三、核心思想（非常重要）

### React Query 只关心一件事：

> **“这个 key 对应的接口数据是什么状态？”**

```js
['user', userId]  -->  fetchUser(userId)
```

- **queryKey**：唯一标识一类数据
- **queryFn**：真正请求数据的函数

---

## 四、怎么使用（从 0 到能用）

### 1️⃣ 安装

```bash
npm install @tanstack/react-query
```

---

### 2️⃣ 在应用根部包一层 Provider

#### React Web

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

#### React Native（完全一样）

```jsx
// App.tsx / App.js
<QueryClientProvider client={queryClient}>
  <NavigationContainer>
    <App />
  </NavigationContainer>
</QueryClientProvider>
```

---

### 3️⃣ 最核心 Hook：`useQuery`

```js
import { useQuery } from "@tanstack/react-query";

function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  if (isLoading) return <Text>加载中...</Text>;
  if (error) return <Text>出错了</Text>;

  return <Text>{data.name}</Text>;
}
```

**你会发现：**

- ❌ 不用 useEffect
- ❌ 不用 useState
- ❌ 不用 try/catch
- ✅ 状态非常清晰

---

### 4️⃣ 提交数据：`useMutation`

```js
const mutation = useMutation({
  mutationFn: loginApi,
  onSuccess: () => {
    queryClient.invalidateQueries(["user"]);
  },
});
```

```js
mutation.mutate({ email, password });
```

**作用：**

- 用来做 **新增 / 登录 / 修改 / 删除**
- 成功后自动刷新相关查询

---

## 五、React Query 的核心知识点路线（学习重点）

### 第一阶段（必须会）

- `useQuery`
- `useMutation`
- `queryKey`
- `isLoading / error / data`
- `invalidateQueries`

---

### 第二阶段（项目级）

- `staleTime`
- `cacheTime`
- `enabled`
- `refetch`
- 全局错误处理

---

### 第三阶段（进阶）

- 乐观更新（Optimistic Update）
- Infinite Query（分页）
- Prefetch
- Persist Cache（本地缓存）

---

## 六、难度评估（对你非常关键）

### 客观评价

| 项目     | 难度     |
| -------- | -------- |
| 基础使用 | ⭐⭐     |
| 项目实战 | ⭐⭐⭐   |
| 深度优化 | ⭐⭐⭐⭐ |

### 为什么不难？

- API 设计非常现代
- 文档好
- 思想清晰
- 不需要底层原理

> **React Query 的难点不是 API，而是“什么时候该用它”**

---

## 七、React Native 能用吗？

### ✅ 结论：完全可以，而且非常推荐

React Query **与平台无关**：

- React Web ✅
- React Native ✅
- Expo ✅
- Next.js ✅

**只要你用的是：**

- fetch
- axios
- request 函数

都可以直接用 React Query。

---

## 八、和你当前技术栈的匹配度（非常高）

结合你现在在学的内容：

| 技术                    | 搭配       |
| ----------------------- | ---------- |
| React / RN              | ⭐⭐⭐⭐⭐ |
| Express / MongoDB       | ⭐⭐⭐⭐⭐ |
| 登录 / 用户信息         | ⭐⭐⭐⭐⭐ |
| 表单（React Hook Form） | ⭐⭐⭐⭐⭐ |
| Zod                     | ⭐⭐⭐⭐⭐ |

**典型组合（你以后一定会用）：**

```
React Native
+ React Hook Form
+ Zod
+ React Query
+ JWT / Cookie
```

---

## 九、什么时候“必须”用 React Query？

✅ 推荐使用场景：

- 登录 / 注册
- 用户信息
- 列表页
- 详情页
- 点赞 / 评论
- 后台管理系统
- 移动端 App

❌ 不适合：

- 纯 UI 状态（modal、tab）
- 表单输入过程状态

---

## 十、总结一句话

> **React Query 是现代 React / React Native 项目的“标配数据层”，
> 不是可选项，而是迟早要学的核心能力。**

如果你愿意，下一步我可以直接给你一套：

- **RN 登录 + 注册**
- **React Query + React Hook Form + Zod**
- **真实项目结构**

一步一步带你写成「能上线的代码」。
