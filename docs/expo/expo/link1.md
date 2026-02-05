下面按“**Expo + Expo Router**”来讲（这是 Expo 现在默认/主推的导航方式）。你问的“页面跳转、路由重载、重置栈”等，本质上分 3 类能力：

1. **怎么配置路由系统能跑起来**
2. **怎么跳转（push / replace / back / dismiss / navigate）**
3. **怎么“重载/刷新”（刷新数据 vs 强制重新挂载页面）**

---

## 1) Expo Router 基础配置（跑起来的最小配置）

### ✅ 1.1 入口文件（package.json）

Expo Router 要求入口指向 `expo-router/entry`：([Expo Documentation][1])

```json
{
  "main": "expo-router/entry"
}
```

> 如果你需要自定义入口（先初始化埋点/日志/Polyfill），也可以做自定义 entry，再 `import 'expo-router/entry'`（同一篇安装文档里也写了）。([Expo Documentation][1])

### ✅ 1.2 app.json / app.config.js 插件

通常默认模板已经带了，但如果你是老项目迁移，确保有：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

文档示例：([Expo Documentation][2])

### ✅ 1.3 必须有 app/_layout.tsx

`app/_layout.tsx` 是路由树的根（至少要有一个 Stack/Tabs）。Stack 文档也强调它是用来定义 Stack 的：([Expo Documentation][3])

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
```

---

## 2) 页面跳转怎么用（push / replace / back / navigate）

Expo Router 的跳转 API 重点就 4 个（再加少量辅助）：

> 官方导航文档说明：默认是 stack，通常用 `navigate`；也可以 `push/back/replace`。([Expo Documentation][4])

### 2.1 推荐：在组件里用 `useRouter()`

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

router.navigate("/about");  // 推荐：会“跳到历史中的已有路由”或 push 新的
router.push("/about");      // 强制 push 新页面（即使已在栈里有同路由）
router.replace("/about");   // 替换当前页面（常用于登录后进入首页，避免返回登录页）
router.back();              // 返回
```

`navigate` 的特性是：**如果目标路由已在栈历史里，会 unwind 回去**（不一定新增一层）。([Expo Documentation][4])

### 2.2 参数传递（动态路由 / query）

两种写法都常用（官方导航文档有示例）：([Expo Documentation][4])

```tsx
router.navigate("/user/bacon");

// 或对象写法（推荐，可读性强）
router.navigate({
  pathname: "/user/[id]",
  params: { id: "bacon" },
});
```

接收参数：

```tsx
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams<{ id: string }>();
```

### 2.3 modal / 多层弹窗：dismiss

Router API 里有 `dismiss(count)`，用于在 stack 里“往下弹回去”。([Expo Documentation][5])

```ts
router.dismiss();     // 默认相当于 dismiss(1)
router.dismiss(2);    // 关两层
```

---

## 3) “路由重载/刷新”到底是哪一种？（两种最常见含义）

你说的“重载”，在 RN/Expo 里通常是下面两类之一：

### A) **返回上一页后，让上一页刷新数据**（最常见）

`router.back()` 只是“回到上一个 screen”，并不会自动帮你重新请求数据。正确做法是：**在页面获得焦点时 refresh**。

用 React Navigation 的焦点机制（Expo Router 底层基于 RN Navigation，所以这套可用）：

* `useFocusEffect` / `useIsFocused`（在页面 focus 时触发重新拉取）

示例（推荐模式）：

```tsx
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function Feed() {
  useFocusEffect(
    useCallback(() => {
      // 页面每次回到前台（focus）时触发
      fetchLatest();
    }, [])
  );

  return null;
}
```

这比“强制 remount”更符合真实业务（列表、详情、编辑返回刷新等）。

---

### B) **强制把当前页面“重新挂载”一次**（更像 Web 的 reload）

Expo Router 没有一个“像浏览器那样的硬刷新按钮”作为主路径（而且移动端也不建议这么做）。工程上常用两种“强制刷新”策略：

#### B1) replace 当前路径（软重进）

思路：用 `replace()` 把自己替换一次，让页面生命周期重新走（某些情况下会触发重渲染/重进）。

```ts
import { usePathname, useLocalSearchParams, useRouter } from "expo-router";

const router = useRouter();
const pathname = usePathname();
const params = useLocalSearchParams();

router.replace({ pathname, params }); // 软重进
```

#### B2) 给路由加一个变化的 query（强制“不同地址”）

思路：让地址变成新的（例如加 `ts`），路由层面一定认为是新的一次导航：

```ts
router.push({
  pathname: "/feed",
  params: { ts: String(Date.now()) },
});
```

然后你在 `/feed` 页面监听 params 变化或直接把它当成“新页面”处理。

---

## 4) “路由栈重置/清空历史”怎么做（登录态最常用）

### 4.1 简单版：登录后用 replace

`replace` 会替换当前 screen，避免用户返回到上一页（比如登录页）。([Expo Documentation][4])

```ts
router.replace("/(tabs)");
```

### 4.2 更彻底：清空栈再跳转（避免残留历史）

社区常用写法（先 back 到栈底，再 replace 到目标）。`canGoBack` 在 Router API 里有。([Expo Documentation][5])

```ts
while (router.canGoBack()) {
  router.back();
}
router.replace("/login");
```

> 说明：`replace` **不等于**“清空全部 history”，所以才会有这类“先清栈再 replace”的组合需求。([GitHub][6])

---

## 5) 你可以照抄的一套“实战跳转规范”

* 普通跳转：`router.navigate()`（避免重复堆栈）
* 必须叠加一层：`router.push()`
* 登录/引导页 → 主应用：`router.replace()`
* 弹窗/多层：`router.dismiss(n)`
* 返回刷新：在目标页用 `useFocusEffect()` 做 refetch
* 真要“强制重载页面”：`router.replace({ pathname, params })` 或 `push + ts` 参数

---

如果你把你的目录结构发我（比如有没有 `(tabs)`、有没有 auth 分组），我可以按你的项目给一份**“路由树 + 登录守卫 + 清栈跳转”**的推荐结构（基本是 Expo Router 最常见的坑位）。

[1]: https://docs.expo.dev/router/installation/?utm_source=chatgpt.com "Install Expo Router"
[2]: https://docs.expo.dev/versions/latest/sdk/router/ "Router - Expo Documentation"
[3]: https://docs.expo.dev/router/advanced/stack/?utm_source=chatgpt.com "Stack"
[4]: https://docs.expo.dev/router/basics/navigation/ "Navigating between pages in Expo Router - Expo Documentation"
[5]: https://docs.expo.dev/versions/latest/sdk/router/?utm_source=chatgpt.com "Expo Router"
[6]: https://github.com/expo/router/discussions/495?utm_source=chatgpt.com "Adding reset to router · expo router · Discussion #495"
