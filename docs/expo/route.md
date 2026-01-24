下面用一套“接近真实项目”的最小骨架，把你列的 6 个点在 Expo Router 中如何使用讲透，并配上可直接抄用的经典代码。

---

## 一、示例项目结构（Stack + Tabs + 动态详情 + 登录）

```
app/
  _layout.tsx                 // 根：外层 Stack（全局壳）
  (tabs)/
    _layout.tsx               // Tabs 壳
    index.tsx                 // Home 列表页
    settings.tsx              // Settings
  login.tsx                   // 登录页
  post/
    [id].tsx                  // 详情页（动态路由）
```

---

## 二、_layout.tsx：公共 header、权限壳、Stack 架构

### 1) 根布局：外层 Stack（让 Tabs、详情、登录都能在同一个“导航体系”中）

`app/_layout.tsx`

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      {/* Tabs 作为一个 Screen：隐藏外层 header，让 tabs 自己决定 */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 登录页通常不希望显示返回（可按需调整） */}
      <Stack.Screen name="login" options={{ title: "Login", headerBackVisible: false }} />

      {/* 动态详情页：可以统一在这里配置标题样式等 */}
      <Stack.Screen name="post/[id]" options={{ title: "Post Detail" }} />
    </Stack>
  );
}
```

### 2) Tabs 布局

`app/(tabs)/_layout.tsx`

```tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

> 你在项目中最常用的模式就是：**外层 Stack + 内层 Tabs**。外层负责“全局页面/模态/详情”，内层 Tabs 负责“主功能入口”。

---

## 三、router.push("/path")：进入新页面（典型：列表 → 详情）

`app/(tabs)/index.tsx`

```tsx
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

const DATA = [
  { id: "101", title: "Post 101" },
  { id: "102", title: "Post 102" },
];

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Home</Text>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/post/[id]", params: { id: item.id } })
            }
            style={{ paddingVertical: 12 }}
          >
            <Text>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
```

### 项目里的“标准用法”

* 从列表进入详情：`router.push({ pathname: "/post/[id]", params: { id } })`
* 从任意页面进入新页面：`router.push("/login")`

---

## 四、useLocalSearchParams()：读参数（详情页必用）

`app/post/[id].tsx`

```tsx
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PostDetail() {
  const { id } = useLocalSearchParams(); // string | string[]

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Post Detail</Text>
      <Text style={{ marginTop: 12 }}>id = {String(id)}</Text>

      <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
        <Text>Back</Text>
      </Pressable>
    </View>
  );
}
```

### 项目注意点

* `id` 类型是 `string | string[]`，使用时通常 `String(id)` 或自行做类型收敛。

---

## 五、router.back()：返回（典型：详情返回、取消操作）

你已经在详情页看到 `router.back()` 了。再补一个“表单取消”的典型片段：

```tsx
<Pressable onPress={() => router.back()}>
  <Text>Cancel</Text>
</Pressable>
```

### 项目里的语义

* “回到上一页”优先用 `back()`
* 不关心上一页是谁、只想去某页：用 `replace()` 或 `push()`

---

## 六、router.replace("/path")：替换当前页面（典型：登录成功后跳主界面）

**登录成功后**，通常不希望用户按返回回到 login，因此用 `replace`。

`app/login.tsx`

```tsx
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Login() {
  const handleLogin = async () => {
    // 1) 这里做你的登录请求
    // await api.login()

    // 2) 登录成功后：替换到主界面（tabs）
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Login</Text>

      <Pressable onPress={handleLogin} style={{ paddingVertical: 12 }}>
        <Text>Sign in</Text>
      </Pressable>

      {/* 如果是注册完成后同理 replace */}
    </View>
  );
}
```

### 项目里的典型规则

* 登录/引导页 → 主界面：`replace`
* 支付/一次性流程完成 → 结果页：常用 `replace`
* 普通浏览跳转：`push`

---

## 七、`<Link href="/path" />`：声明式跳转（典型：列表项、文本链接）

`Link` 适合“看起来像链接”的 UI，语义更清晰，也利于后续迁移到 Web。

`app/(tabs)/settings.tsx`

```tsx
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Settings() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Settings</Text>

      <Link href="/login" asChild>
        <Text style={{ paddingVertical: 12 }}>Go to Login</Text>
      </Link>

      {/* 动态路由 Link 也很常见 */}
      <Link href={{ pathname: "/post/[id]", params: { id: "101" } }} asChild>
        <Text style={{ paddingVertical: 12 }}>Open Post 101</Text>
      </Link>
    </View>
  );
}
```

### `asChild` 的意义（项目常用）

* 让 Link 不额外包一层 View，而是把“点击行为”交给子组件（Text/Pressable），更方便做样式与布局。

---

## 八、权限壳（_layout.tsx 的项目级经典用法）

你提到“权限壳”，这是 Expo Router 最常见的工程实践：在某个 layout 中统一做登录态检查。

示例：如果未登录，强制去 `/login`：

`app/(tabs)/_layout.tsx`（在 Tabs 层做守卫）

```tsx
import { Tabs, router } from "expo-router";
import { useEffect } from "react";

// 假设你有个全局登录态（zustand / context）
function useAuth() {
  return { isAuthed: true }; // 这里替换成真实逻辑
}

export default function TabsLayout() {
  const { isAuthed } = useAuth();

  useEffect(() => {
    if (!isAuthed) {
      router.replace("/login");
    }
  }, [isAuthed]);

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

### 工程实践要点

* 守卫放在 `_layout.tsx`：避免每个页面重复写鉴权逻辑
* 用 `replace`：避免“返回到未登录态页面”

---

## 九、你在项目里怎么选用它们（速记）

* **进入新页面**：`router.push(...)`
* **登录/一次性流程结束**：`router.replace(...)`
* **回上一页**：`router.back()`
* **列表/文本式跳转**：`<Link href=... />`
* **读参数**：`useLocalSearchParams()`
* **架构/公共 header/守卫**：`_layout.tsx`

---

如果你希望我再进一步，我可以把上面这套示例扩展成更贴近你“X 平台/后台管理系统”的版本：

* Home：帖子列表 + 搜索
* Detail：评论列表 + 回复输入框
* 登录：token 持久化（SecureStore）+ 自动跳转
  你更偏向做“X 平台”还是“后台管理系统”？
