在 **React Native（RN）** 中，**Hooks 的可用性可以分成三类**：
1️⃣ **React 核心 Hooks（RN 可用）**
2️⃣ **仅 Web（浏览器）可用的 Hooks（RN 不能用）**
3️⃣ **React Native 专属 Hooks / 社区 Hooks**

下面我给你一个**清晰、对照式的完整总结**，非常适合你现在 RN + Hooks 的学习阶段。

---

## 一、✅ React 核心 Hooks（RN 中完全可用）

这些 **来自 `react` 包**，和 Web React **100%一致**，RN 项目里天天用。

### 1️⃣ 状态 & 生命周期类

```ts
import { useState, useEffect } from "react"
```

| Hook              | RN 是否可用 | 说明                |
| ----------------- | ------- | ----------------- |
| `useState`        | ✅       | 组件状态              |
| `useEffect`       | ✅       | 副作用（请求 / 监听 / 订阅） |
| `useLayoutEffect` | ✅       | 布局后同步执行（RN 中用于测量） |
| `useReducer`      | ✅       | 复杂状态管理            |
| `useRef`          | ✅       | ref / 保存不触发渲染的值   |
| `useMemo`         | ✅       | 计算结果缓存            |
| `useCallback`     | ✅       | 函数引用缓存            |
| `useContext`      | ✅       | 全局状态 / 主题         |

📌 **结论**：

> **React 的基础 Hooks 在 RN 中全部支持**

---

### 2️⃣ 并发 / 高级 Hooks（RN 也支持）

```ts
import { useTransition, useDeferredValue } from "react"
```

| Hook                   | RN 是否可用 | 说明                  |
| ---------------------- | ------- | ------------------- |
| `useId`                | ✅       | 生成稳定 ID             |
| `useTransition`        | ✅       | 非紧急更新               |
| `useDeferredValue`     | ✅       | 延迟更新                |
| `useSyncExternalStore` | ✅       | Zustand / Redux 内部用 |
| `useInsertionEffect`   | ⚠️      | RN 几乎不用             |

📌 `useInsertionEffect` 在 RN 中**没有样式注入场景，基本不用**

---

## 二、❌ 只能在 Web 使用，RN 中不能用的 Hooks

这些 Hooks **依赖浏览器 DOM / window / document**
👉 **RN 没有 DOM，所以全部不可用**

### 🚫 React Router / 浏览器相关 Hooks

| Hook              | RN | 原因            |
| ----------------- | -- | ------------- |
| `useHistory`      | ❌  | 依赖浏览器 history |
| `useLocation`     | ❌  | URL           |
| `useParams`       | ❌  | 路由参数来自 URL    |
| `useSearchParams` | ❌  | query string  |
| `useNavigate`     | ❌  | 浏览器路由         |

📌 RN 中要用：
👉 **React Navigation / Expo Router**

---

### 🚫 DOM / 浏览器能力 Hooks

| Hook                            | RN | 原因       |
| ------------------------------- | -- | -------- |
| `useRef<HTMLInputElement>`      | ❌  | 没有 input |
| `useLayoutEffect` 操作 DOM        | ❌  | 没有 DOM   |
| `useEventListener(window, ...)` | ❌  | 无 window |
| `useResizeObserver`             | ❌  | 无 DOM    |

---

## 三、✅ React Native 专属 Hooks（非常重要）

这些 **只存在于 RN / Expo / React Navigation**

---

### 1️⃣ React Native 官方 Hooks

```ts
import { useWindowDimensions, useColorScheme } from "react-native"
```

| Hook                  | 作用         |
| --------------------- | ---------- |
| `useWindowDimensions` | 屏幕宽高 / 横竖屏 |
| `useColorScheme`      | 深色 / 浅色模式  |

```ts
const { width, height } = useWindowDimensions()
const theme = useColorScheme()
```

---

### 2️⃣ React Navigation Hooks（RN 路由核心）

```ts
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
```

| Hook             | 说明      |
| ---------------- | ------- |
| `useNavigation`  | 页面跳转    |
| `useRoute`       | 获取路由参数  |
| `useFocusEffect` | 页面聚焦时执行 |
| `useIsFocused`   | 页面是否激活  |

📌 **等价关系**

| Web           | RN                |
| ------------- | ----------------- |
| `useNavigate` | `useNavigation()` |
| `useLocation` | `useRoute()`      |

---

### 3️⃣ Expo 常用 Hooks（如果你用 Expo）

```ts
import { useFonts } from "expo-font"
import { useCameraPermissions } from "expo-camera"
```

| Hook                         | 作用             |
| ---------------------------- | -------------- |
| `useFonts`                   | 加载字体           |
| `useCameraPermissions`       | 相机权限           |
| `useMediaLibraryPermissions` | 相册权限           |
| `useLocalSearchParams`       | Expo Router 参数 |

---

## 四、❓「有些 Hook 在 RN 能用，但和 Web 行为不同」

### ⚠️ `useLayoutEffect` 在 RN

```ts
useLayoutEffect(() => {
  // RN 中主要用于：测量布局
}, [])
```

📌 **注意点**

* RN 中它 **不操作 DOM**
* 常用于 `onLayout` + ref 配合

---

## 五、总结速查表（强烈建议收藏）

### ✅ RN 可以用

* React 核心 Hooks（99%）
* 状态 / 副作用 / Context
* 并发 Hooks
* React Native 官方 Hooks
* React Navigation Hooks
* Expo Hooks

---

### ❌ RN 不能用

* 所有 DOM / window / document Hooks
* React Router Hooks
* 浏览器 API Hooks

---

## 六、给你的学习建议（结合你目前 RN 学习阶段）

你现在应该重点掌握这组 **RN 必会 Hooks**：

```ts
useState
useEffect
useRef
useCallback
useMemo
useContext

useNavigation
useRoute
useFocusEffect

useWindowDimensions
useColorScheme
```

如果你愿意，**下一步我可以直接帮你做一份：**

* ✅ **RN Hooks 实战清单（按页面 / 组件 / 业务分类）**
* ✅ **RN 常见 Hooks 误用 & 性能坑**
* ✅ **手写 5 个高质量 RN 自定义 Hooks（useToast / useAuth / useRequest）**

你想从哪一个继续？
