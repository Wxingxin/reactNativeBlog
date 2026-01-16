下面从**是什么 → 解决什么问题 → 怎么用 → 难度评估 → React Native 是否可用**，给你一套**工程化视角**的完整说明，偏向你目前的 React / RN 学习阶段。

---

## 一、React Query 是什么？

**React Query（现名：TanStack Query）**是一个**专门管理「服务端状态（Server State）」的库**。

> 一句话定义：
> **React Query = 帮你管理接口请求、缓存、同步、刷新、错误、加载状态的一整套方案**

它解决的不是 UI 状态（如 modal 是否打开），而是：

* 接口数据
* 请求状态
* 缓存一致性
* 数据是否需要重新拉取

---

## 二、它解决了什么痛点？

在没有 React Query 之前，你大概率写过这种代码：

```js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/user')
    .then(res => res.json())
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

| 问题              | React Query       |
| --------------- | ----------------- |
| loading / error | 自动管理              |
| 接口缓存            | 自动缓存              |
| 重复请求            | 自动去重              |
| 数据过期            | staleTime         |
| 自动刷新            | refetch           |
| 提交后更新           | invalidateQueries |
| 网络异常            | 自动重试              |

---

## 三、核心思想（非常重要）

### React Query 只关心一件事：

> **“这个 key 对应的接口数据是什么状态？”**

```js
['user', userId]  -->  fetchUser(userId)
```

* **queryKey**：唯一标识一类数据
* **queryFn**：真正请求数据的函数

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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  if (isLoading) return <Text>加载中...</Text>;
  if (error) return <Text>出错了</Text>;

  return <Text>{data.name}</Text>;
}
```

**你会发现：**

* ❌ 不用 useEffect
* ❌ 不用 useState
* ❌ 不用 try/catch
* ✅ 状态非常清晰

---

### 4️⃣ 提交数据：`useMutation`

```js
const mutation = useMutation({
  mutationFn: loginApi,
  onSuccess: () => {
    queryClient.invalidateQueries(['user']);
  },
});
```

```js
mutation.mutate({ email, password });
```

**作用：**

* 用来做 **新增 / 登录 / 修改 / 删除**
* 成功后自动刷新相关查询

---

## 五、React Query 的核心知识点路线（学习重点）

### 第一阶段（必须会）

* `useQuery`
* `useMutation`
* `queryKey`
* `isLoading / error / data`
* `invalidateQueries`

---

### 第二阶段（项目级）

* `staleTime`
* `cacheTime`
* `enabled`
* `refetch`
* 全局错误处理

---

### 第三阶段（进阶）

* 乐观更新（Optimistic Update）
* Infinite Query（分页）
* Prefetch
* Persist Cache（本地缓存）

---

## 六、难度评估（对你非常关键）

### 客观评价

| 项目   | 难度   |
| ---- | ---- |
| 基础使用 | ⭐⭐   |
| 项目实战 | ⭐⭐⭐  |
| 深度优化 | ⭐⭐⭐⭐ |

### 为什么不难？

* API 设计非常现代
* 文档好
* 思想清晰
* 不需要底层原理

> **React Query 的难点不是 API，而是“什么时候该用它”**

---

## 七、React Native 能用吗？

### ✅ 结论：完全可以，而且非常推荐

React Query **与平台无关**：

* React Web ✅
* React Native ✅
* Expo ✅
* Next.js ✅

**只要你用的是：**

* fetch
* axios
* request 函数

都可以直接用 React Query。

---

## 八、和你当前技术栈的匹配度（非常高）

结合你现在在学的内容：

| 技术                  | 搭配    |
| ------------------- | ----- |
| React / RN          | ⭐⭐⭐⭐⭐ |
| Express / MongoDB   | ⭐⭐⭐⭐⭐ |
| 登录 / 用户信息           | ⭐⭐⭐⭐⭐ |
| 表单（React Hook Form） | ⭐⭐⭐⭐⭐ |
| Zod                 | ⭐⭐⭐⭐⭐ |

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

* 登录 / 注册
* 用户信息
* 列表页
* 详情页
* 点赞 / 评论
* 后台管理系统
* 移动端 App

❌ 不适合：

* 纯 UI 状态（modal、tab）
* 表单输入过程状态

---

## 十、总结一句话

> **React Query 是现代 React / React Native 项目的“标配数据层”，
> 不是可选项，而是迟早要学的核心能力。**

如果你愿意，下一步我可以直接给你一套：

* **RN 登录 + 注册**
* **React Query + React Hook Form + Zod**
* **真实项目结构**

一步一步带你写成「能上线的代码」。
