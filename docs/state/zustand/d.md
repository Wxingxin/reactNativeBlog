好的！我给你整理一个 **Zustand 中中间件（middleware）使用大全**，覆盖 **官方常用中间件 + 典型用法 + 进阶组合技巧**，直接照着项目用就行。

---

# 一、Zustand 中间件概览

Zustand 的 `middleware` 是一个 **高阶函数**，可以包裹 `create`，增强 store 功能。
官方提供的常用中间件主要有：

| 中间件                     | 功能                                   | 适用场景               |
| ----------------------- | ------------------------------------ | ------------------ |
| `devtools`              | 集成 Redux DevTools                    | 调试状态变化             |
| `persist`               | 本地持久化（localStorage / sessionStorage） | 保存用户设置、购物车等        |
| `immer`                 | 自动处理不可变状态                            | 对象/数组操作简化          |
| `combine`               | 合并 state + actions                   | 将多个状态逻辑组合成一个 store |
| `subscribeWithSelector` | 精准订阅、避免不必要渲染                         | 高性能组件              |

---

# 二、基础写法示例

```ts
import { create } from 'zustand'

// 普通 store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

中间件的用法：

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        name: 'my-count-storage', // localStorage key
      }
    ),
    { name: 'CountStore' } // devtools 名称
  )
)
```

---

# 三、官方常用中间件详细用法

## 1️⃣ devtools

* **作用**：集成 Redux DevTools，可追踪 state 变化。
* **语法**：

```ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useStore = create(
  devtools((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }), { name: 'CounterStore' })
)
```

* **提示**：

  * 可以在浏览器扩展查看状态变化
  * 支持 **时间旅行**（Time Travel）

---

## 2️⃣ persist

* **作用**：状态持久化到 `localStorage` 或 `sessionStorage`
* **语法**：

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCountStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'count-storage', // localStorage key
      getStorage: () => localStorage, // 可改为 sessionStorage
    }
  )
)
```

* **高级用法**：

  * `partialize`：只保存 state 的部分字段
  * `merge`：自定义合并策略

```ts
persist(
  (set) => ({ count: 0, temp: 'ignore' }),
  {
    name: 'count-storage',
    partialize: (state) => ({ count: state.count }), // 忽略 temp
  }
)
```

---

## 3️⃣ immer

* **作用**：自动处理不可变 state，直接修改 state 即可
* **安装**：

```bash
npm i zustand immer
```

* **语法**：

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useStore = create(
  immer((set) => ({
    todos: [{ id: 1, text: 'Learn Zustand' }],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: Date.now(), text })
      }),
    removeTodo: (id) =>
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id)
      }),
  }))
)
```

* **特点**：

  * 适合数组/对象深层修改
  * 不用每次手动复制 `...state`

---

## 4️⃣ combine

* **作用**：把 state 和 actions 分开写，更清晰
* **语法**：

```ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useCounterStore = create(
  combine(
    { count: 0 }, // state
    (set) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    })
  )
)
```

* **优点**：

  * 状态/方法分离
  * 可读性高
  * 易于和 persist/devtools 联动

---

## 5️⃣ subscribeWithSelector

* **作用**：组件可以只订阅部分 state，减少不必要重渲染
* **语法**：

```ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    user: { name: 'Alice', age: 20 },
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
)

// 使用时
const count = useStore((state) => state.count) // 只订阅 count
```

---

# 四、组合中间件示例（最常用）

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useTodoStore = create(
  devtools(
    persist(
      immer((set) => ({
        todos: [],
        addTodo: (text) =>
          set((state) => {
            state.todos.push({ id: Date.now(), text })
          }),
        removeTodo: (id) =>
          set((state) => {
            state.todos = state.todos.filter((t) => t.id !== id)
          }),
      })),
      { name: 'todo-storage' }
    ),
    { name: 'TodoStore' }
  )
)
```

✅ **解释**：

1. `immer`：修改对象/数组方便
2. `persist`：状态保存到 localStorage
3. `devtools`：调试工具

> 这就是实际项目中最常用的组合套路。

---

# 五、总结

* **开发调试**：`devtools`
* **本地持久化**：`persist`
* **对象/数组深层修改**：`immer`
* **状态/方法分离**：`combine`
* **性能优化**：`subscribeWithSelector`

> 组合使用时，一般是：`devtools(persist(immer(store)))` 或类似顺序。

---

我可以帮你写一个 **带三个 store（数字、数组、对象数组）+ 中间件组合 + index.js 集中导出** 的完整模板，直接复制到你的项目里就能用。

你希望我帮你写吗？
