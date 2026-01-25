下面我**按真实项目使用频率 + 心智模型**，系统性讲清 **Expo Router** 中这几个最核心 API 的**常见使用大全（带场景 + 示例）**：

* `useRouter`
* `Link`
* `usePathname`
* `useSegments`

并且会**对比它们的职责边界**，避免混用。

---

# 一、整体心智模型（先看这个）

Expo Router = **文件即路由**

```txt
app/
 ├─ index.tsx          → /
 ├─ login.tsx          → /login
 ├─ (auth)/
 │   ├─ login.tsx      → /login
 │   └─ register.tsx   → /register
 ├─ users/
 │   ├─ index.tsx      → /users
 │   └─ [id].tsx       → /users/123
```

> 这 4 个 API，本质都是**围绕“当前路由状态 + 跳转”**展开。

---

# 二、useRouter —— **命令式导航（最常用）**

📌 **一句话定位**
👉 像 `useNavigate` / `history.push`，用于**逻辑触发跳转**

---

## 1️⃣ 基本用法

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

router.push('/login');
router.replace('/home');
router.back();
```

### 常用方法

| 方法              | 作用     | 使用场景    |
| --------------- | ------ | ------- |
| `push(path)`    | 压栈跳转   | 普通跳转    |
| `replace(path)` | 替换当前页面 | 登录成功    |
| `back()`        | 返回上一页  | 返回按钮    |
| `setParams()`   | 更新参数   | 搜索 / 筛选 |

---

## 2️⃣ 登录成功后跳转（高频）

```tsx
const router = useRouter();

const onLoginSuccess = () => {
  router.replace('/(tabs)/home');
};
```

📌 **为什么用 replace？**

* 不允许用户再 `back()` 回登录页
* 和 Web 行为一致

---

## 3️⃣ 搭配事件使用（按钮 / 表单）

```tsx
<Button
  title="去详情"
  onPress={() => router.push('/users/123')}
/>
```

---

## 4️⃣ 携带参数

```tsx
router.push({
  pathname: '/users/[id]',
  params: { id: '123', from: 'home' },
});
```

---

## 5️⃣ 什么时候不用 useRouter？

❌ **纯 UI 跳转**

```tsx
<Text onPress={...}>去登录</Text>
```

👉 用 `Link` 更合适（下一节）

---

# 三、Link —— **声明式导航（UI 专用）**

📌 **一句话定位**
👉 像 `<a>`，用于**点击即跳转**

---

## 1️⃣ 最基本用法

```tsx
import { Link } from 'expo-router';

<Link href="/login">
  <Text>去登录</Text>
</Link>
```

📌 自动处理：

* 点击
* 返回栈
* 预加载（Web）

---

## 2️⃣ 携带参数

```tsx
<Link href={{ pathname: '/users/[id]', params: { id: '123' } }}>
  <Text>用户详情</Text>
</Link>
```

---

## 3️⃣ 替换跳转（登录成功）

```tsx
<Link href="/home" replace>
  <Text>进入首页</Text>
</Link>
```

---

## 4️⃣ 常见使用场景

| 场景     | 推荐          |
| ------ | ----------- |
| 列表项点击  | `Link`      |
| Tab 跳转 | `Link`      |
| 文本链接   | `Link`      |
| 表单提交   | `useRouter` |

---

## 5️⃣ Link vs useRouter（记这个）

| 对比      | Link | useRouter |
| ------- | ---- | --------- |
| 使用方式    | 声明式  | 命令式       |
| 是否推荐 UI | ✅    | ❌         |
| 事件触发    | ❌    | ✅         |
| 可读性     | 高    | 中         |

---

# 四、usePathname —— **当前路径字符串**

📌 **一句话定位**
👉 只关心“我现在在哪个 URL 上”

---

## 1️⃣ 基本使用

```tsx
import { usePathname } from 'expo-router';

const pathname = usePathname();
// '/users/123'
```

---

## 2️⃣ 高亮 Tab / Menu（非常常见）

```tsx
const pathname = usePathname();

const isActive = pathname.startsWith('/users');
```

```tsx
<Text style={{ color: isActive ? 'blue' : 'gray' }}>
  用户
</Text>
```

---

## 3️⃣ 权限判断 / 埋点

```tsx
useEffect(() => {
  analytics.track('page_view', { pathname });
}, [pathname]);
```

---

## 4️⃣ 注意事项

❌ **它拿不到 params**

```tsx
/users/123   // 只能拿到字符串
```

👉 需要参数 → 用 `useLocalSearchParams`

---

# 五、useSegments —— **结构级路由判断（进阶必会）**

📌 **一句话定位**
👉 用来判断 **当前在“哪个路由分组 / 层级”**

---

## 1️⃣ 什么是 segments？

```tsx
/users/123

useSegments() → ['users', '123']
```

```tsx
/(auth)/login

useSegments() → ['(auth)', 'login']
```

---

## 2️⃣ 最经典用法：登录拦截（🔥）

```tsx
import { useSegments, useRouter } from 'expo-router';

const segments = useSegments();
const router = useRouter();

useEffect(() => {
  const inAuthGroup = segments[0] === '(auth)';

  if (!user && !inAuthGroup) {
    router.replace('/(auth)/login');
  }

  if (user && inAuthGroup) {
    router.replace('/(tabs)/home');
  }
}, [segments, user]);
```

📌 **这是 Expo Router 官方推荐写法**

---

## 3️⃣ 判断当前在哪个模块

```tsx
const segments = useSegments();

const isInUserModule = segments[0] === 'users';
```

---

## 4️⃣ useSegments vs usePathname

| 对比    | usePathname | useSegments |
| ----- | ----------- | ----------- |
| 形式    | string      | string[]    |
| 是否结构化 | ❌           | ✅           |
| 判断路由组 | ❌           | ✅           |
| 权限控制  | 一般          | **推荐**      |

---

# 六、真实项目推荐组合（你直接照着用）

## 1️⃣ 页面跳转

* UI 点击 → `Link`
* 逻辑跳转 → `useRouter`

---

## 2️⃣ Tab / Menu 高亮

```tsx
usePathname()
```

---

## 3️⃣ 登录 & 权限守卫

```tsx
useSegments() + useRouter()
```

---

## 4️⃣ 页面参数

```tsx
useLocalSearchParams()
```

---

# 七、最容易踩坑的 3 点（一定记住）

### ❌ 1. 用 useRouter 写所有跳转

→ UI 跳转可读性差

### ❌ 2. 用 usePathname 做权限判断

→ 路由组失效

### ❌ 3. 在 layout.tsx 里乱 redirect

→ 必须配合 `useSegments`

---

# 八、你现在的学习阶段建议（针对你）

你现在在 **RN + Expo Router** 这个阶段：

**必会（100%）**

* `Link`
* `useRouter`
* `usePathname`

**进阶（项目分水岭）**

* `useSegments`（权限 / 登录 / Tabs）

---

如果你愿意，下一步我可以直接帮你：

* 给你 **一套完整的 auth guard 封装**
* 或 **Tabs + 登录态完整路由结构**
* 或 **对比 Expo Router vs React Navigation**

你选一个，我按“真实项目级别”给你拆。
