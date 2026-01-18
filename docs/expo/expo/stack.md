下面给你一套“**Expo Router 的 Stack / Stack.Screen 属性案例大全**”，按**根栈**、**分组栈**、**动态路由**、**Modal**、**自定义 Header 按钮**、**拦截返回/关闭手势**、**页面内动态 setOptions** 等场景组织，并且每段都配了大量常用 `options` 属性与注释。你可以直接复制进 RN + Expo Router 项目里用。

---

## 目录结构（建议直接按这个建）

```
app/
  _layout.tsx
  index.tsx
  settings.tsx
  modal.tsx
  detail/
    [id].tsx
  (auth)/
    _layout.tsx
    login.tsx
```

---

## 1) 根栈：app/_layout.tsx（Stack + 多个 Stack.Screen 覆盖）

```tsx
// app/_layout.tsx
import React from "react";
import { Platform, Pressable, Text } from "react-native";
import { Stack, router } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      /**
       * screenOptions：对“此目录树下所有页面”的默认配置（全局默认）
       * 下面尽量给你把常见属性一次性铺开。
       */
      screenOptions={{
        // ===== Header 基础 =====
        headerShown: true, // 是否显示导航栏
        title: "App", // 默认标题（可被单页覆盖）
        headerBackTitleVisible: false, // iOS：返回按钮文字是否显示（更干净）
        headerLargeTitle: Platform.OS === "ios", // iOS：大标题（native-stack 支持）
        headerShadowVisible: true, // iOS：是否显示阴影（Android可能无效）

        // ===== Header 样式 =====
        headerStyle: {
          // header 容器样式
          // backgroundColor: "#fff", // 你可以在这里统一背景色
        },
        headerTitleStyle: {
          // 标题文字样式
          fontSize: 18,
          fontWeight: "600",
        },
        headerTintColor: "#111", // 返回箭头、header 按钮文字颜色

        // ===== 页面内容区样式 =====
        contentStyle: {
          // 屏幕内容区域（不含 header）的样式，常用于统一背景色
          backgroundColor: "#fff",
        },

        // ===== 转场/展示方式 =====
        presentation: "card", // card | modal | transparentModal
        animation: Platform.select({
          ios: "default",
          android: "fade",
        }),
        animationDuration: 220, // 动画时长（部分平台/版本生效）

        // ===== 手势/返回相关 =====
        gestureEnabled: true, // 是否允许手势返回（iOS尤其常用）
        fullScreenGestureEnabled: Platform.OS === "ios", // iOS：全屏右滑返回（若支持）

        // ===== 状态栏/系统相关（并非所有都在所有版本生效）=====
        statusBarStyle: Platform.OS === "ios" ? "dark" : undefined, // iOS：状态栏风格（某些版本支持）
        statusBarAnimation: "fade", // 状态栏动画（某些版本支持）
      }}
    >
      {/* index 页面：覆盖标题 + headerRight 按钮 */}
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerRight: () => (
            <Pressable onPress={() => router.push("/settings")} hitSlop={10}>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>Settings</Text>
            </Pressable>
          ),
        }}
      />

      {/* settings 页面：禁用手势返回 + 自定义返回按钮 */}
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          gestureEnabled: false, // 禁用 iOS 右滑返回
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>Back</Text>
            </Pressable>
          ),
        }}
      />

      {/* 动态路由：detail/[id] */}
      <Stack.Screen
        name="detail/[id]"
        options={{
          // 这里写死 title 也行，但更多时候会在页面内根据 id 动态设置
          title: "Detail",
          headerLargeTitle: false, // 详情页一般不用大标题
        }}
      />

      {/* modal 页面：以 modal 弹出 */}
      <Stack.Screen
        name="modal"
        options={{
          title: "Modal",
          presentation: "modal", // 关键：变成弹窗样式
          animation: "slide_from_bottom",
          // iOS：modal 下拉关闭（如果你想禁止关闭，通常要配 gestureEnabled=false + 自己拦截）
        }}
      />

      {/* auth 分组：通常隐藏 header（让 auth 自己的 layout 决定） */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
```

---

## 2) app/index.tsx：首页（跳转、push/replace、打开 modal）

```tsx
// app/index.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Home</Text>

      <Pressable
        onPress={() => router.push("/detail/100")}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Go Detail (id=100)</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/modal")}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Open Modal</Text>
      </Pressable>

      <Pressable
        /**
         * replace：替换当前页面（回退时不会回到当前页）
         * 常用于登录成功后跳转到主页面，避免回退回登录页
         */
        onPress={() => router.replace("/(auth)/login")}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Go Login (replace)</Text>
      </Pressable>
    </View>
  );
}
```

---

## 3) 动态路由页：app/detail/[id].tsx（页面内动态配置 Stack.Screen）

这里展示“**页面内就近配置**”，你会用到非常多：动态标题、headerRight、隐藏 header 等。

```tsx
// app/detail/[id].tsx
import React, { useMemo } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";

export default function DetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const title = useMemo(() => `Detail #${id}`, [id]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {/* 页面内 Stack.Screen：动态设置该页面的导航栏 */}
      <Stack.Screen
        options={{
          title, // 动态标题
          headerLargeTitle: false,
          headerRight: () => (
            <Pressable
              hitSlop={10}
              onPress={() => Alert.alert("Action", `Do something on id=${id}`)}
            >
              <Text style={{ fontWeight: "600" }}>Action</Text>
            </Pressable>
          ),
        }}
      />

      <Text style={{ fontSize: 22, fontWeight: "700" }}>{title}</Text>

      <Pressable
        onPress={() => router.back()}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Back</Text>
      </Pressable>
    </View>
  );
}
```

---

## 4) Modal 页：app/modal.tsx（modal 常用 options：透明、动画、隐藏 header 等）

```tsx
// app/modal.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Stack, router } from "expo-router";

export default function ModalPage() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {/* 你也可以在页面内覆盖 modal 的 header 行为 */}
      <Stack.Screen
        options={{
          title: "Modal Page",
          // 如果你想让 modal 自己画顶部，直接隐藏 header：
          // headerShown: false,

          // 透明 modal 常用组合（根 layout 也可以配置）
          // presentation: "transparentModal",
          // animation: "fade",
          // contentStyle: { backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      />

      <Text style={{ fontSize: 22, fontWeight: "700" }}>Modal</Text>

      <Pressable
        onPress={() => router.back()}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}
```

---

## 5) Auth 分组栈：app/(auth)/_layout.tsx（分组内 Stack 的默认配置）

auth 通常需要：

* 隐藏大标题
* 禁止从登录页手势返回（防止回到“不该回去”的页面）
* header 更简洁

```tsx
// app/(auth)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitle: false,
        title: "Auth",
        gestureEnabled: false, // auth 流程通常不想让用户手势乱返回
        contentStyle: { backgroundColor: "#fff" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          // 登录页通常不想显示返回按钮（也可自定义）
          headerBackVisible: false, // 某些版本支持
        }}
      />
    </Stack>
  );
}
```

---

## 6) 登录页：app/(auth)/login.tsx（登录后 replace 回主栈）

```tsx
// app/(auth)/login.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Login</Text>

      <Pressable
        onPress={() => {
          // 假设登录成功：replace 到首页，避免 back 回登录页
          router.replace("/");
        }}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Login Success → Go Home</Text>
      </Pressable>
    </View>
  );
}
```

---

# 你现在能掌握的“属性组合套路”（最实用）

## A) “全局默认 + 单页覆盖”套路

* `Stack screenOptions={{...}}` 负责统一风格
* `Stack.Screen options={{...}}` 覆盖个别页面差异

## B) “页面内动态配置标题/按钮”套路

* 在动态路由页里用 `<Stack.Screen options={{ title: `#${id}` }} />`

## C) “Modal”套路

* 根 `_layout` 里对 modal 页面 `presentation: "modal"` + `animation: "slide_from_bottom"`

## D) “禁用手势返回”套路

* auth / critical flow：`gestureEnabled: false`
* 再配合 replace，避免回退路径污染

---

如果你愿意，我还可以在这套基础上再加两块“更像真实项目”的内容（你学习价值更高）：

1. **headerRight 放一个“保存/提交”按钮 + loading 状态**（结合 async 请求）
2. **拦截返回（未保存表单时提示）**（这是很多人面试会问的）

你更想先看哪一个？


下面按“**知识点大全** + **配置大全**”把 Expo Router 里的 **Stack** 和 **Stack.Screen** 讲清楚，并给你一套可直接套用的项目结构与经典配置范式（包含：全局 Stack、嵌套路由 Stack、按页覆盖、Header 定制、动态路由、Modal、拦截返回、认证守卫等）。

---

## 1) Expo Router 的 Stack 是什么

在 Expo Router 中：

* `Stack` 是一个**基于文件系统路由**自动生成页面的“原生栈导航容器”（底层是 React Navigation 的 native stack）。
* 它通常放在某个路由分组或目录的 **`_layout`** 文件里，用来声明该目录下页面的**默认导航行为**（header、动画、手势、presentation 等）。
* 目录里每个页面文件（如 `index.tsx`、`detail.tsx`、`[id].tsx`）都会被 `Stack` 自动识别成一个 screen。

你可以把它理解成：
**“这个目录下页面栈怎么表现，由 `_layout.tsx` 里的 `<Stack />` 来定。”**

---

## 2) Stack.Screen 是什么、用来解决什么

`<Stack.Screen />` 的作用是：
**对某一个具体页面（route）做“按页覆盖配置”**。

常见场景：

* 某页不显示 header：`headerShown: false`
* 某页标题不同：`title: 'xxx'`
* 某页以 Modal 弹出：`presentation: 'modal'`
* 某页禁用返回手势：`gestureEnabled: false`
* 某页自定义 headerRight / headerLeft 按钮
* 某页要透明背景、全屏、动画不同等

关键点：
`Stack` 的 `screenOptions` 是**全局默认**；`Stack.Screen options` 是**该页面覆盖默认**。

---

## 3) 典型目录结构与 Stack 放置位置

### 最常见：App 根栈

```
app/
  _layout.tsx        // 根 Stack
  index.tsx
  settings.tsx
  (auth)/
    _layout.tsx      // auth 分组的 Stack（可选）
    login.tsx
  (tabs)/
    _layout.tsx      // tabs 分组（通常用 Tabs）
    home.tsx
    profile.tsx
  detail/
    [id].tsx
```

* **根 `_layout.tsx`** 往往放一个顶层 `Stack`，用于组织 app 级别页面（tabs、auth、modal 等）。
* 分组目录（`(auth)`、`(tabs)`）也可以有自己的 `_layout.tsx`，形成**嵌套 Stack**（很常用）。

---

## 4) Stack 的核心配置项（知识点大全）

`<Stack />` 常用属性主要是两类：

### A. `screenOptions`：默认页面配置（最常用）

典型可配置项（按“你最常用”的优先级排序）：

1. **Header 显示与标题**

   * `headerShown: boolean`
   * `title: string`
   * `headerTitle: string | ReactNode | (props)=>ReactNode`
   * `headerBackTitleVisible: boolean`（iOS 相关）
2. **Header 样式与按钮**

   * `headerStyle`, `headerTitleStyle`, `headerTintColor`
   * `headerLeft`, `headerRight`
3. **页面展示方式 / 转场**

   * `presentation: 'card' | 'modal' | 'transparentModal'`（native stack 常用）
   * `animation: 'default' | 'fade' | 'slide_from_right' | 'slide_from_bottom' ...`
4. **手势与返回**

   * `gestureEnabled: boolean`
   * `fullScreenGestureEnabled`（iOS 相关）
5. **内容区域**

   * `contentStyle`（页面背景色等）
6. **状态栏（通常配合 `expo-status-bar` 或 RN StatusBar）**

   * 不是 stack 的标准项，但你会经常在 layout 里统一配

> 说明：不同版本的 React Navigation / native-stack 支持的 option 细节可能略有差异，但上面这些是 Expo Router 中最主流、最稳定的一组。

### B. `<Stack />` 组件本身

* `initialRouteName`：指定该栈初始路由（通常不必写，文件路由本身就能决定）
* `screenOptions`：上面说的默认配置

---

## 5) Stack.Screen 的核心配置方式（配置大全）

### 方式 1：在 `_layout.tsx` 里集中配置（推荐）

你在某个目录的 `_layout.tsx`：

* 给 `Stack` 一个全局默认 `screenOptions`
* 用多个 `Stack.Screen name="..." options={{...}}` 覆盖单页

`name` 怎么写：

* 对应页面文件名/路由名
* 例如 `app/settings.tsx` → `name="settings"`
* `app/detail/[id].tsx` → `name="detail/[id]"`（动态路由这样写）
* 分组目录里的页面名要按该分组 layout 的相对路径来写

### 方式 2：在页面组件里用 `<Stack.Screen />`（按页就近配置）

在某个页面 `xxx.tsx` 里：

* 直接写一个 `Stack.Screen options={...}`（通常放在组件 return 之前或顶部）
* 好处：配置靠近页面逻辑；坏处：大型项目里不如集中管理直观

---

## 6) 经典“根 Stack + Tabs + Auth + Modal”配置范式

下面给你一个**行业里最常见**的思路（你照这个结构扩展最稳）：

### 根 `app/_layout.tsx`

* 把 `(tabs)`、`(auth)` 以及 `modal` 页面都放在同一个根 Stack 下管理
* 对 tabs/auth 的 header 通常隐藏，因为它们内部有自己的 header/导航

核心策略：

* 根 Stack：管理“全局层级”
* Tabs：管理“底部导航主入口”
* Auth：管理登录注册一套流程
* Modal：用 `presentation: 'modal'` 单独定义

---

## 7) 动态路由页的 Stack.Screen 配置要点

动态路由例如：

* `app/detail/[id].tsx`

你在 layout 配它时，`name` 要写：

* `detail/[id]`

常见需求：

* 标题根据参数变化：标题通常在页面内通过 `Stack.Screen` 或 `navigation.setOptions` 做动态设置
* 隐藏 header：详情页想自绘顶部，就 `headerShown:false`

---

## 8) 常见坑与最佳实践

1. **忘了在正确目录的 `_layout.tsx` 配置**

   * Stack 的作用域是“当前目录树”
2. **`name` 写错**

   * 尤其动态路由：`detail/[id]` 不是 `detail/:id`
3. **全局默认与单页覆盖冲突**

   * 记住：`Stack.Screen options` 优先级更高
4. **Tabs 里还想用 Stack**

   * 很正常：`(tabs)` 下每个 tab 也可以再包一层 stack（分目录 layout）
5. **header 的 UI 与 Safe Area**

   * 自绘 header 时要注意安全区（`react-native-safe-area-context` 常用）

---

## 9) 你可以直接照抄的“配置清单”（按需求选）

你在任何 `_layout.tsx` 里配置时，通常就这几类组合：

* 通用默认：

  * `headerShown: true`
  * `contentStyle: { backgroundColor: '...' }`
* 某页隐藏 header：

  * `options={{ headerShown: false }}`
* 某页 modal：

  * `options={{ presentation: 'modal', title: '...' }}`
* 某页透明 modal：

  * `options={{ presentation: 'transparentModal', animation: 'fade' }}`
* 禁用返回手势：

  * `options={{ gestureEnabled: false }}`

---

如果你希望我把“**一整套可运行的示例代码**（含 `app/_layout.tsx`、`(tabs)/_layout.tsx`、`(auth)/_layout.tsx`、一个动态详情页、一个 modal 页、以及一个 headerRight 登出按钮）”按文件路径完整贴出来，我可以直接给你一个最小但工程化的模板。你只要告诉我：你现在项目用的是 **Tabs 还是纯 Stack** 结构即可。
