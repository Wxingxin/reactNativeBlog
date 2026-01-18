下面给你一套 **Expo Router 的 Tabs / Tabs.Screen「包含很多属性」案例大全**，覆盖你在 RN 项目里最常用、最“工程化”的配置：全局 tabBar 样式、图标、badge、label、隐藏某个 tab、某页禁用跳转、Tab 内嵌 Stack、在 Tabs 层统一 header、以及“某些页面不出现在 tab 上但仍在 tabs 组里可访问”等。

---

## 目录结构（直接照抄最稳）

```txt
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    home/
      _layout.tsx
      index.tsx
      detail/[id].tsx
    explore.tsx
    inbox.tsx
    profile.tsx
    settings.tsx        // 仍在 (tabs) 组内，但不显示在 tabBar（示例）
```

---

# 1) 根布局：app/\_layout.tsx（让 (tabs) 成为主入口）

```tsx
// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 通常 Tabs 自己管 header（或 tab 内 stack 管）
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

---

# 2) Tabs 布局：app/(tabs)/\_layout.tsx（Tabs + 多个 Tabs.Screen 大全属性）

> 这里是重点：你会在这个文件里配置 Tabs 的 **全局 tabBar** 风格，然后对每个 Tab 用 `Tabs.Screen` 做覆盖。

```tsx
// app/(tabs)/_layout.tsx
import React from "react";
import { Platform, Pressable, Text } from "react-native";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      /**
       * screenOptions：对所有 Tab 页面生效的默认配置
       * Expo Router Tabs 底层是 React Navigation Bottom Tabs，
       * 所以大部分配置都来自 tabBar / header 相关的 options。
       */
      screenOptions={{
        // ===== Header（顶栏）相关 =====
        headerShown: true, // 是否显示 header（如果你 Tab 内再嵌 Stack，通常会改为 false）
        headerTitleAlign: "center",
        headerShadowVisible: true,
        headerStyle: {
          // backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        headerTintColor: "#111", // header 按钮/返回箭头颜色

        // ===== tabBar（底栏）整体行为 =====
        tabBarHideOnKeyboard: true, // 键盘弹起时隐藏底栏（移动端非常常用）
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",

        // iOS/Android 底栏高度、padding 等常用统一控制
        tabBarStyle: {
          // 你可以统一背景色、边框、阴影等
          height: Platform.OS === "ios" ? 86 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 6,
          borderTopWidth: 0.5,
        },

        // tabBarLabel 样式
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        // 单个 item 的样式（会影响每个 tab 的按钮）
        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 6,
        },

        // 图标的默认大小（你也可以在 tabBarIcon 里自己控制）
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {/* 1) Home：演示 tabBarIcon / headerRight / title / badge 等 */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home", // header 标题（也会影响某些场景下的 label fallback）
          tabBarLabel: "Home", // 底栏显示文字

          // tabBar 图标：focused 决定选中态，你可以切换不同 icon
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size ?? 22}
              color={color}
            />
          ),

          // badge：未读数（数字/字符串都可以）
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            // backgroundColor: "tomato", // 不指定颜色也行
            minWidth: 18,
            height: 18,
            fontSize: 10,
          },

          // header 右侧按钮：跳转到“隐藏 tab 的页面 settings”
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              hitSlop={10}
            >
              <Text style={{ fontWeight: "600" }}>Settings</Text>
            </Pressable>
          ),
        }}
      />

      {/* 2) Explore：演示 tabBarLabelPosition / headerShown 覆盖 / 进阶样式 */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
          tabBarLabelPosition: "below-icon", // below-icon | beside-icon（某些平台表现不同）

          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={size ?? 22}
              color={color}
            />
          ),

          // 单页覆盖 tabBar 样式（谨慎使用：会导致不同 tab 底栏高度不一致的观感）
          // tabBarStyle: { display: "flex" },

          // 单页覆盖 header（例如 Explore 你想要更沉浸的页面）
          // headerShown: false,
        }}
      />

      {/* 3) Inbox：演示动态 badge、点击拦截（tabPress）、以及卸载策略 */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarLabel: "Inbox",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "mail" : "mail-outline"}
              size={size ?? 22}
              color={color}
            />
          ),

          // 你可以用 null 隐藏 badge（例如无未读时）
          tabBarBadge: "99+",

          // 页面切走是否卸载（适合某些“每次进来都要重新拉取”的页面）
          // 注意：不同版本/平台支持略有差异
          unmountOnBlur: false,

          // iOS/安卓部分版本支持：切到后台时冻结渲染，节省资源（若可用）
          freezeOnBlur: true,
        }}
        listeners={{
          /**
           * 监听 tabPress：点击 tab 时拦截行为
           * 典型用途：未登录时点击 Inbox 先跳登录；或弹窗确认。
           */
          tabPress: (e) => {
            // e.preventDefault(); // 取消默认切换行为
            // router.push("/(auth)/login");
          },
        }}
      />

      {/* 4) Profile：演示“隐藏 label”“仅显示图标”“自定义 headerLeft”等 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Me",
          tabBarShowLabel: true, // false 就只显示图标（更简洁）
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size ?? 22}
              color={color}
            />
          ),

          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={{ fontWeight: "600" }}>Back</Text>
            </Pressable>
          ),
        }}
      />

      {/* 5) settings：在 tabs 组内，但不显示在 tabBar（常用于“设置/详情”） */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          /**
           * 关键：href: null -> 不会出现在 tabBar 上
           * 但仍然可以 router.push("/(tabs)/settings") 进入
           */
          href: null,

          // 进入设置时通常不想要 tabBar（部分版本可用 tabBarStyle 覆盖）
          // 如果你明确要隐藏 tabBar，更推荐“设置页面不放在 tabs 里”，由根 Stack 管
          // tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
```

---

# 3) Tab 内嵌 Stack：让 “Home Tab” 自己拥有子页面栈（非常经典）

很多项目不是“每个 Tab 就一个页面”，而是每个 Tab 内部还有详情页、编辑页等。这时常用做法：

- `(tabs)/home/_layout.tsx` 用 `Stack` 管 `home/index`、`home/detail/[id]` 等
- Tabs 层 `name="home"` 指向的是这个目录（它本身就是一个导航容器）

### app/(tabs)/home/\_layout.tsx

```tsx
// app/(tabs)/home/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        // Home tab 内的子页面用自己的 header
        headerShown: true,
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home Feed",
        }}
      />
      <Stack.Screen
        name="detail/[id]"
        options={{
          title: "Detail",
          // 你也可以在 detail 页里再动态改标题
        }}
      />
    </Stack>
  );
}
```

### app/(tabs)/home/index.tsx

```tsx
// app/(tabs)/home/index.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeIndex() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Home Tab - Index</Text>

      <Pressable
        onPress={() => router.push("/(tabs)/home/detail/101")}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Go Detail id=101</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(tabs)/settings")}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Open Settings (hidden tab)</Text>
      </Pressable>
    </View>
  );
}
```

### app/(tabs)/home/detail/[id].tsx（动态设置标题 + headerRight）

```tsx
// app/(tabs)/home/detail/[id].tsx
import React, { useMemo } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

export default function HomeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = useMemo(() => `Post #${id}`, [id]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Stack.Screen
        options={{
          title,
          headerRight: () => (
            <Pressable
              onPress={() => Alert.alert("Saved", `id=${id}`)}
              hitSlop={10}
            >
              <Text style={{ fontWeight: "600" }}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <Text style={{ fontSize: 20, fontWeight: "700" }}>{title}</Text>
    </View>
  );
}
```

---

# 4) Tabs / Tabs.Screen 常用属性清单（你写项目最常碰到的）

下面是“实战频率最高”的一组（你可以对照上面的代码理解）：

## Tabs（全局）常用

- `screenOptions`
  - `headerShown`
  - `headerTitleAlign`
  - `headerStyle / headerTitleStyle / headerTintColor`
  - `tabBarHideOnKeyboard`
  - `tabBarStyle`
  - `tabBarActiveTintColor / tabBarInactiveTintColor`
  - `tabBarLabelStyle`
  - `tabBarItemStyle`
  - `tabBarIconStyle`

## Tabs.Screen（单页覆盖）常用

- `name`
- `options`
  - `title`
  - `tabBarLabel`
  - `tabBarIcon`
  - `tabBarBadge / tabBarBadgeStyle`
  - `tabBarShowLabel`
  - `tabBarLabelPosition`
  - `headerRight / headerLeft`
  - `href: null`（隐藏该 tab 项，但保留路由可访问）
  - `unmountOnBlur / freezeOnBlur`（视版本而定）

- `listeners`
  - `tabPress`（拦截点击、做登录守卫等）

---

## 你下一步最值得补的两块（如果你要“更像真实项目”）

1. **未登录点击 Inbox/Profile 时拦截 tabPress → 跳登录 → 登录成功再回原 tab**
2. **某些页面（settings/detail）进入时隐藏 tabBar 的最佳做法**（推荐用根 Stack 承载，而不是强行改 tabBarStyle）

你想先看哪一块？我可以直接在你这套代码上继续加完整实现。
