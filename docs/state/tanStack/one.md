下面给你一份**React Query（@tanstack/react-query）基础使用大全**，覆盖你点名的：`useQuery / useMutation / queryKey / isLoading|error|data / invalidateQueries`。代码以**React Native 可直接用**为标准（React Web 同样适用，只是组件从 `Text` 换成 `div`）。

---

## 0. 必备初始化（QueryClientProvider）

### 目录建议

* `src/api/http.js`
* `src/api/user.js`
* `src/query/client.js`
* `App.js`

### `src/query/client.js`

```js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // 失败重试次数（基础）
      refetchOnWindowFocus: false, // RN里无意义，Web可关
    },
  },
});
```

### `App.js`

```js
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/query/client';
import Home from './src/screens/Home';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}
```

---

## 1) queryKey 使用大全（非常重要）

### 1.1 规则与最佳实践

**queryKey 必须稳定、可序列化、能唯一标识一类数据**。

推荐写法（数组）：

* 单资源：`['me']`
* 详情：`['user', userId]`
* 列表+筛选：`['posts', { page, q, sort }]`

不要用：

* 随机数、Date对象、函数
* 每次 render 都新建且内容不稳定的对象（会导致缓存命中异常）

### 1.2 统一管理 key（强烈建议）

`src/query/keys.js`

```js
export const keys = {
  me: () => ['me'],
  user: (id) => ['user', id],
  posts: (params) => ['posts', params], // params要尽量稳定
};
```

---

## 2) useQuery 使用大全（读数据）

### 2.1 最基础：data / isLoading / error

```js
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';

async function fetchMe() {
  const res = await fetch('http://localhost:4000/api/me');
  if (!res.ok) throw new Error('Fetch me failed');
  return res.json();
}

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });

  if (isLoading) return <Text>加载中...</Text>;
  if (error) return <Text>出错：{error.message}</Text>;

  return (
    <View>
      <Text>你好，{data.name}</Text>
    </View>
  );
}
```

### 2.2 常用状态字段（你会频繁用）

* `isLoading`: 首次加载中（还没有 data）
* `isFetching`: 正在请求中（即使已有 data，也可能在后台刷新）
* `error`: 错误对象
* `data`: 成功数据
* `refetch()`: 手动刷新

```js
const { data, isLoading, isFetching, error, refetch } = useQuery({...});
```

### 2.3 `enabled`（控制是否发起请求）

典型场景：必须拿到 `userId` 才查详情。

```js
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,
});
```

### 2.4 `staleTime`（多久内不认为“过期”）

* `staleTime: 0`：默认，随时可被认为过期，容易触发重新拉取
* `staleTime: 60_000`：1分钟内认为数据新鲜

```js
useQuery({
  queryKey: ['me'],
  queryFn: fetchMe,
  staleTime: 60_000,
});
```

---

## 3) useMutation 使用大全（写数据：新增/修改/删除/登录）

### 3.1 最基础：mutate / isPending / error / data

```js
import { useMutation } from '@tanstack/react-query';
import { Button, Text, View } from 'react-native';

async function loginApi(body) {
  const res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export default function Login() {
  const loginMutation = useMutation({
    mutationFn: loginApi,
  });

  return (
    <View>
      <Button
        title={loginMutation.isPending ? '登录中...' : '登录'}
        onPress={() => loginMutation.mutate({ email: 'a@a.com', password: '123456' })}
      />
      {loginMutation.error && <Text>错误：{loginMutation.error.message}</Text>}
      {loginMutation.data && <Text>登录成功</Text>}
    </View>
  );
}
```

> 注意：v5 常用 `isPending`，老版本常见 `isLoading`（mutation 上）。

### 3.2 关键回调：onSuccess / onError / onSettled

```js
const m = useMutation({
  mutationFn: updateProfileApi,
  onSuccess: (data, variables) => {
    // 成功后的动作（见下一节 invalidateQueries）
  },
  onError: (err) => {
    // 统一 toast / 打点
  },
  onSettled: () => {
    // 不论成功失败都会执行
  },
});
```

---

## 4) invalidateQueries 使用大全（写完后刷新读）

这是 React Query 最核心的“数据一致性”手段。

### 4.1 mutation 成功后让某些 query 失效并刷新

例：登录成功后刷新 `me`。

```js
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const loginMutation = useMutation({
  mutationFn: loginApi,
  onSuccess: async () => {
    // 让 ['me'] 失效 -> 下次访问/或立刻触发重新拉取（视配置）
    await queryClient.invalidateQueries({ queryKey: ['me'] });
  },
});
```

### 4.2 精确失效 vs 模糊失效

* 精确：只刷新 `['user', 123]`
* 模糊：刷新所有以 `['user']` 开头的（含 `['user', 1]`, `['user', 2]`）

```js
// 精确
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// 模糊（常用于列表/多页）
queryClient.invalidateQueries({ queryKey: ['posts'] });
```

### 4.3 失效后要“立刻刷新”怎么办？

通常 `invalidateQueries` 会触发活跃 query 重新请求；如果你要更明确：

```js
await queryClient.invalidateQueries({ queryKey: ['me'] });
await queryClient.refetchQueries({ queryKey: ['me'] }); // 强制立即 refetch
```

（多数情况下只用 invalidate 就够。）

---

## 5) 一个完整闭环示例（列表 + 删除 + 自动刷新）

### 5.1 列表 useQuery

```js
function usePosts() {
  return useQuery({
    queryKey: ['posts', { page: 1 }],
    queryFn: fetchPosts,
  });
}
```

### 5.2 删除 useMutation + invalidateQueries 刷新列表

```js
function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePostApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] }); // 刷新所有 posts 列表
    },
  });
}
```

---

## 6) 你现在就该记住的“最小心智模型”

1. `useQuery`：读数据（带缓存）
2. `useMutation`：写数据（不缓存结果）
3. `queryKey`：缓存的唯一ID（数组）
4. `isLoading/error/data`：页面三态（加载/错误/成功）
5. `invalidateQueries`：写完之后让读数据“过期”并刷新，保证一致性

---

如果你愿意，我可以把上面内容直接整理成你项目里能用的结构（`src/hooks/queries/*` + `src/api/*`），并给你一套 **RN 登录/注册/修改密码** 的真实落地版本：

* React Hook Form + Zod 做表单校验
* React Query 做请求与缓存
* 登录成功自动刷新 `me`，并在全局拿到用户信息（配合 Zustand 或 Context）
