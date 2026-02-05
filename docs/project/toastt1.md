好，那我们直接做一个**真正工程化、可复用的 Hooks 版 `useToast`**，不是“套壳”，而是**符合 RN 架构直觉**的实现。

目标：
👉 `const toast = useToast()`
👉 `toast.show('保存成功')`

---

## 一、Hooks 版 useToast 的设计思路（很重要）

Hooks 版 **≠ 全局变量版**

它的核心是：

> **Context + Provider + Hook**

### 架构图（脑中要有）

```
<App>
 └─ ToastProvider        ← 管理状态 & 动画
     ├─ ToastContainer   ← 真正渲染 Toast
     └─ 页面组件
         └─ useToast()   ← 调用 show / hide
```

**好处**

* ✅ 不用 ref / 单例
* ✅ 更 React
* ✅ 天然支持多实例（测试 / 子树）
* ✅ TS 友好

---

## 二、Toast 数据结构

```ts
export type ToastType = 'success' | 'error' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}
```

---

## 三、ToastContext

### `ToastContext.tsx`

```tsx
import { createContext } from 'react'
import type { ToastOptions } from './types'

export interface ToastContextValue {
  show: (options: ToastOptions | string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
```

---

## 四、ToastProvider（核心）

### `ToastProvider.tsx`

```tsx
import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native'
import { ToastContext } from './ToastContext'
import type { ToastOptions, ToastType } from './types'

export const ToastProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null)
  const opacity = useRef(new Animated.Value(0)).current

  const show = useCallback((options: ToastOptions | string) => {
    const config: ToastOptions =
      typeof options === 'string'
        ? { message: options }
        : options

    setToast(config)

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
      }).start(() => setToast(null))
    }, config.duration ?? 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            getToastStyle(toast.type),
            { opacity },
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

const getToastStyle = (type?: ToastType) => {
  switch (type) {
    case 'success':
      return { backgroundColor: '#4CAF50' }
    case 'error':
      return { backgroundColor: '#F44336' }
    default:
      return { backgroundColor: '#333' }
  }
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
})
```

---

## 五、useToast Hook

### `useToast.ts`

```ts
import { useContext } from 'react'
import { ToastContext } from './ToastContext'

export function useToast() {
  const ctx = useContext(ToastContext)

  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return ctx
}
```

> ⚠️ 这个报错非常重要
> 能 100% 防止你忘包 Provider

---

## 六、在 App.tsx 中挂载

```tsx
import { ToastProvider } from '@/toast/ToastProvider'

export default function App() {
  return (
    <ToastProvider>
      {/* Navigation / Router */}
    </ToastProvider>
  )
}
```

---

## 七、使用方式（非常爽）

### 基础用法

```tsx
import { useToast } from '@/toast/useToast'

const Page = () => {
  const toast = useToast()

  return (
    <Button
      title="保存"
      onPress={() => toast.show('保存成功')}
    />
  )
}
```

---

### 带类型

```ts
toast.show({
  message: '网络错误',
  type: 'error',
})
```

---

## 八、进阶（真实项目必加）

### 1️⃣ 防止 Toast 覆盖（锁）

```ts
if (toast) return
```

---

### 2️⃣ 队列模式（顺序弹）

```ts
const queue = useRef<ToastOptions[]>([])
```

---

### 3️⃣ loading Toast（手动关闭）

```ts
show({ message: '加载中...', duration: Infinity })
```

---

### 4️⃣ NativeWind 风格（你之前问过）

```tsx
<View className="absolute bottom-20 px-4 py-2 bg-black/80 rounded-xl" />
```

---

## 九、Hooks 版 vs 全局 ref 版

| 对比       | useToast | ref 单例 |
| -------- | -------- | ------ |
| React 风格 | ✅        | ❌      |
| TS 推断    | ✅        | 一般     |
| 可测试性     | ✅        | ❌      |
| 跨模块调用    | ❌（必须在树内） | ✅      |
| 推荐程度     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐    |

👉 **RN 项目首选：Hooks 版**

---

## 十、总结一句话

> **useToast 本质：Context 提供 show，Provider 负责渲染，Hook 只是取能力**

如果你愿意，我可以直接帮你升级成：

* ✅ `toast.success / error / info`
* ✅ iOS 风格浮层（毛玻璃）
* ✅ 带 icon + safe-area
* ✅ 队列 + promise 化（await toast）

你下一步想把它用在哪个项目？Expo 还是 CLI？
