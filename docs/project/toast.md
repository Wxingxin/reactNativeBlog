下面给你一个**在 React Native 项目中从 0 封装 Toast 组件的完整方案**，思路清晰、可直接用在真实项目里（不依赖第三方库）。

我会按 **「设计目标 → 实现方式 → 核心代码 → 使用方式 → 可扩展点」** 来讲。

---

## 一、Toast 组件的设计目标

在 RN 项目里，一个合格的 Toast 应该具备：

* ✅ 全局可调用（不需要每个页面引入）
* ✅ 覆盖在最上层（不受页面结构影响）
* ✅ 支持自动消失
* ✅ 支持动画（淡入 / 上移）
* ✅ 支持类型（success / error / info）
* ✅ API 简洁（`Toast.show()`）

---

## 二、整体实现思路（重点）

> **核心思路：用一个全局单例 + Portal 思想**

### 关键点拆解

1. **ToastContainer**

   * 真正渲染 UI
   * 管理动画、定时器、状态

2. **Toast API**

   * `Toast.show({ message, type })`
   * 通过 ref / 事件触发 ToastContainer

3. **挂载位置**

   * 放在 `App.tsx` 最外层
   * 保证在任何页面之上

---

## 三、Toast 数据结构设计

```ts
type ToastType = 'success' | 'error' | 'info'

interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}
```

---

## 四、Toast 组件核心实现

### 1️⃣ ToastContainer.tsx

```tsx
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { Animated, Text, StyleSheet } from 'react-native'

export interface ToastRef {
  show: (options: ToastOptions) => void
}

const ToastContainer = forwardRef<ToastRef>((_, ref) => {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current

  const show = ({
    message,
    duration = 2000,
  }: ToastOptions) => {
    setMessage(message)
    setVisible(true)

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()

    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setVisible(false))
    }, duration)
  }

  useImperativeHandle(ref, () => ({ show }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
})

export default ToastContainer
```

---

### 2️⃣ 样式

```ts
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
})
```

---

## 五、Toast API（全局调用）

### 3️⃣ toast.ts（关键）

```ts
import { createRef } from 'react'
import { ToastRef } from './ToastContainer'

export const toastRef = createRef<ToastRef>()

const Toast = {
  show(options: ToastOptions) {
    toastRef.current?.show(options)
  },
}

export default Toast
```

---

## 六、在 App.tsx 中挂载

```tsx
import React from 'react'
import { View } from 'react-native'
import ToastContainer from './ToastContainer'
import { toastRef } from './toast'

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* 你的路由 / 页面 */}
      <ToastContainer ref={toastRef} />
    </View>
  )
}
```

---

## 七、使用方式（重点）

```ts
import Toast from '@/components/toast'

Toast.show({
  message: '登录成功',
})
```

不依赖页面、不依赖 props，**任何地方都能调用**。

---

## 八、进阶扩展（你后面一定会用到）

### 1️⃣ 支持类型（success / error）

```ts
backgroundColor:
  type === 'success' ? '#4CAF50'
  : type === 'error' ? '#F44336'
  : '#333'
```

---

### 2️⃣ 支持图标（配合 `react-native-vector-icons`）

```tsx
<View style={{ flexDirection: 'row' }}>
  <Icon name="check" />
  <Text />
</View>
```

---

### 3️⃣ 队列 Toast（不会互相覆盖）

```ts
const queue: ToastOptions[] = []
```

---

### 4️⃣ NativeWind / Tailwind 风格（你之前问过）

```tsx
<View className="absolute bottom-20 px-4 py-2 bg-black/80 rounded-xl">
```

---

## 九、什么时候不自己封装？

如果你要：

* iOS / Android 原生 Toast
* 手势拖拽
* 高度定制

👉 才考虑 `react-native-toast-message`

**否则自己封装是最可控、最干净的方案**

---

## 十、总结一句话

> **RN Toast 的本质：全局 ref + 最外层渲染 + Animated 控制显示**

如果你愿意，我可以：

* 🔹 给你一个 **支持 success / error / loading 的完整版本**
* 🔹 或帮你改成 **shadcn / iOS 风格**
* 🔹 或写成 **hooks 版（useToast）**

你更想用在哪种项目里？
