在 **React Native + Expo** 项目中，**导航配置**现在主流有 **两种方案**，而且**心智模型完全不同**：

1. **Expo Router（官方主推，基于文件系统）✅ 推荐**
2. **React Navigation（传统手动配置）**

我按**工程角度**给你讲：
👉 **怎么配、目录怎么放、导航是怎么“跑起来”的、数据/参数怎么流动**

---

## 一、方案选择结论（先给你答案）

| 方案               | 是否推荐        | 适合谁                 |
| ---------------- | ----------- | ------------------- |
| **Expo Router**  | ⭐⭐⭐⭐⭐（强烈推荐） | 新项目 / Web & RN 一致心智 |
| React Navigation | ⭐⭐⭐         | 老项目 / 深度定制          |

> **结论一句话**：
> 👉 **Expo 项目 = 默认用 Expo Router**
> 👉 只有“必须高度定制”才回退 React Navigation

---

## 二、方案一：**Expo Router（文件即路由）**

### 核心思想（非常重要）

> **文件结构 = 路由结构**

```
app/
├── _layout.tsx      // 根导航（必须）
├── index.tsx        // /
├── login.tsx        // /login
├── profile/
│   ├── index.tsx    // /profile
│   └── [id].tsx     // /profile/:id
```

📌 **你不再写 navigation 配置代码**
📌 **不再手动注册 screen**

---

### 1️⃣ 创建 Expo Router 项目

```bash
npx create-expo-app my-app
cd my-app

# 确认使用 expo-router
```

默认结构：

```
app/
  _layout.tsx
  index.tsx
```

📌 Expo 已自动安装好 `expo-router`

---

### 2️⃣ 根导航配置：`app/_layout.tsx`

这是**整个导航系统的入口**

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
```

#### 这里发生了什么？

* `<Stack />` = 创建一个 **Stack Navigator**
* 它会 **自动扫描 `app/` 目录**
* 每个文件 = 一个 Screen

> 你不需要：
>
> * createStackNavigator
> * NavigationContainer
> * register screen

Expo Router **全帮你做了**

---

### 3️⃣ 页面文件就是 Screen

#### `app/index.tsx`

```tsx
import { View, Text } from "react-native";

export default function HomePage() {
  return (
    <View>
      <Text>Home</Text>
    </View>
  );
}
```

➡ 自动变成 `/`

---

### 4️⃣ 页面跳转（非常像 Web）

```tsx
import { router } from "expo-router";

router.push("/login");
router.replace("/profile/123");
router.back();
```

或 JSX 方式：

```tsx
import { Link } from "expo-router";

<Link href="/profile/123">Go Profile</Link>
```

📌 **和 Next.js 几乎一致**

---

### 5️⃣ 动态路由 `[id].tsx`

```tsx
// app/profile/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function Profile() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Text>Profile: {id}</Text>;
}
```

📌 **参数来自 URL，而不是 navigation props**

---

### 6️⃣ 嵌套路由（子 Stack / Tabs）

#### Tabs 示例

```
app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── home.tsx
│   └── settings.tsx
```

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return <Tabs />;
}
```

➡ 自动生成 Tab Navigator

---

### Expo Router 的「数据流」

```
URL / Path
   ↓
Router 解析
   ↓
加载对应文件
   ↓
useLocalSearchParams()
```

---

## 三、方案二：**React Navigation（传统方式）**

> Expo **仍然支持**，但你需要手动配置

### 1️⃣ 安装

```bash
expo install @react-navigation/native
expo install react-native-screens react-native-safe-area-context
expo install @react-navigation/native-stack
```

---

### 2️⃣ 手动配置 NavigationContainer

```tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

📌 **这里和 Expo Router 最大区别：**

* 你要**手写所有路由**
* 所有 screen 都要注册

---

### 3️⃣ 跳转方式

```tsx
navigation.navigate("Profile", { id: 123 });
```

接收参数：

```tsx
route.params.id;
```

---

## 四、两种方案对比（工程视角）

| 对比点       | Expo Router   | React Navigation |
| --------- | ------------- | ---------------- |
| 路由定义      | 文件结构          | JS 配置            |
| 参数传递      | URL params    | route.params     |
| 心智模型      | Web / Next.js | 纯 RN             |
| 嵌套路由      | 天然            | 手动嵌套             |
| 深度链接      | 内建            | 手动               |
| Expo 官方态度 | **主推**        | 兼容               |

---

## 五、我给你的 **推荐实践**

### ✅ Expo 项目正确打开方式

```text
Expo + Expo Router
↓
Stack / Tabs / Drawer 用 router 提供的
↓
页面即路由
↓
useLocalSearchParams 取参数
```

### ❌ 不推荐

* Expo 新项目还手写 React Navigation
* 在 Expo Router 里“混用旧 navigation API”

---

## 六、你现在可以直接问我的下一步

你可以继续问我这些（都很关键）👇

* Expo Router **如何做登录鉴权（Auth Guard）**
* **Tab + Stack 混合导航** 的真实项目结构
* **隐藏 TabBar / Header 的正确姿势**
* Expo Router 中 **modal / 全屏弹窗**
* Expo Router **和 Web 共用路由逻辑**

如果你愿意，我也可以 **直接给你一个完整的 Expo Router 项目目录模板**（适合你现在的 RN 学习阶段）。
