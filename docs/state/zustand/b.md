```js
//index.js
export { useObjectListStore } from "./objectList.store";
export { useCountStore } from "./count.store";
export { useNumberListStore } from "./numberList.store";
```

```js
//count.store.js
import { create } from "zustand";

export const useCountStore = create((set) => ({
  count: 0,

  increment: () => set((state) => ({ count: state.count + 1 })),

  decrement: () => set((state) => ({ count: state.count - 1 })),

  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),

  decrementBy: (amount) => set((state) => ({ count: state.count - amount })),

  reset: () => set({ count: 0 }),
}));
```

```js
//numberList.store.js
import { create } from "zustand";

export const useNumberListStore = create((set) => ({
  numbers: [1, 2, 3],

  addNumber: (num) =>
    set((state) => ({
      numbers: [...state.numbers, num],
    })),

  addRandom: () =>
    set((state) => ({
      numbers: [...state.numbers, Math.floor(Math.random() * 100)],
    })),

  removeLast: () =>
    set((state) => ({
      numbers: state.numbers.slice(0, -1),
    })),

  clear: () => set({ numbers: [] }),
}));
```

```js
//objectList.store.js
import { create } from "zustand";

export const useObjectListStore = create((set) => ({
  list: [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
  ],

  addItem: (item) =>
    set((state) => ({
      list: [...state.list, item],
    })),

  addByName: (name) =>
    set((state) => {
      const maxId = state.list.reduce(
        (max, item) => (item.id > max ? item.id : max),
        0,
      );
      return {
        list: [...state.list, { id: maxId + 1, name }],
      };
    }),

  removeById: (id) =>
    set((state) => ({
      list: state.list.filter((item) => item.id !== id),
    })),

  clear: () => set({ list: [] }),
}));
```

```js
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useCountStore,
  useObjectListStore,
  useNumberListStore,
} from "./store/index";

function App() {
  // Selector：一次性取多个字段，配合 useShallow 防止对象变更引起的重复渲染
  const { count, increment, decrement, incrementBy, decrementBy, reset } =
    useCountStore(
      useShallow((s) => ({
        count: s.count,
        increment: s.increment,
        decrement: s.decrement,
        incrementBy: s.incrementBy,
        decrementBy: s.decrementBy,
        reset: s.reset,
      })),
    );

  const { list, addByName, removeById, clearObjectList } = useObjectListStore(
    useShallow((s) => ({
      list: s.list,
      addByName: s.addByName,
      removeById: s.removeById,
      clearObjectList: s.clear,
    })),
  );

  const { numbers, addNumber, addRandom, removeLast, clearNumbers } =
    useNumberListStore(
      useShallow((s) => ({
        numbers: s.numbers,
        addNumber: s.addNumber,
        addRandom: s.addRandom,
        removeLast: s.removeLast,
        clearNumbers: s.clear,
      })),
    );

  const [nameInput, setNameInput] = useState("");
  const [numberInput, setNumberInput] = useState("");

  // 派生数据直接计算，不进 store
  const sum = numbers.reduce((total, n) => total + n, 0);
  const avg = numbers.length ? (sum / numbers.length).toFixed(2) : "0.00";

  return (
    <div>
      <h3>count: {count}</h3>
      <div>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={() => incrementBy(5)}>+5</button>
        <button onClick={() => decrementBy(5)}>-5</button>
        <button onClick={reset}>reset</button>
      </div>

      <h3>object list</h3>
      <div>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="New item name"
        />
        <button
          onClick={() => {
            const trimmed = nameInput.trim();
            if (!trimmed) return;
            addByName(trimmed);
            setNameInput("");
          }}
        >
          add
        </button>
        <button onClick={clearObjectList}>clear</button>
      </div>
      {list.map((item) => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => removeById(item.id)}>remove</button>
        </div>
      ))}

      <h3>number list</h3>
      <div>
        <input
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          placeholder="Add number"
        />
        <button
          onClick={() => {
            if (!numberInput.trim()) return;
            const value = Number(numberInput);
            if (Number.isNaN(value)) return;
            addNumber(value);
            setNumberInput("");
          }}
        >
          add
        </button>
        <button onClick={addRandom}>random</button>
        <button onClick={removeLast}>remove last</button>
        <button onClick={clearNumbers}>clear</button>
      </div>
      <div>{numbers.join(", ")}</div>
      <div>sum: {sum}</div>
      <div>avg: {avg}</div>
    </div>
  );
}

export default App;
```

## Selector（选择器）详解：教给学生的版本

Selector 是一个函数：它接收整个 store 状态 `state`，返回你需要的那一部分数据。  
它的核心作用是：**精准订阅**，让组件只在“自己关心的数据变化时”才重渲染。

下面用三句话讲清楚 Selector：

1. 组件不是订阅整个 store，而是订阅 selector 的返回值。
2. 返回值**变了**，组件才重渲染。
3. 返回值**没变**，组件不会重渲染。

---

## 1）最基础：只取一个字段

```jsx
const count = useCountStore((state) => state.count);
```

**理解**：组件只关心 `count`，`count` 变了就渲染，别的字段变了不影响它。

---

## 2）同时取多个字段：注意“对象新引用”

当你一次性取多个字段时，很自然会写成这样：

```jsx
const { count, increment } = useCountStore((state) => ({
  count: state.count,
  increment: state.increment,
}));
```

问题：**每次渲染都会返回一个新对象**，哪怕内容没变，引用也变了。  
结果：组件被误判为“变了”，从而重复渲染。

解决方法：用 `useShallow` 做浅比较，缓存 selector 的结果。

---

## 3）推荐写法：Selector + useShallow

```jsx
import { useShallow } from "zustand/react/shallow";

const { count, increment, decrement } = useCountStore(
  useShallow((state) => ({
    count: state.count,
    increment: state.increment,
    decrement: state.decrement,
  })),
);
```

**说明**：

- `useShallow` 会比较对象的第一层字段
- 字段没变，返回值“复用旧引用”
- 组件就不会重复渲染

---

## 4）数组 selector 也会有同样问题

```jsx
const [count, bear] = useCountStore((state) => [state.count, state.bear]);
```

数组也是新引用，也会导致重复渲染。  
同样用 `useShallow` 解决：

```jsx
const [count, bear] = useCountStore(
  useShallow((state) => [state.count, state.bear]),
);
```

---

## 5）派生数据：直接计算，不放进 store

```jsx
const numbers = useNumberListStore((state) => state.numbers);
const sum = numbers.reduce((total, n) => total + n, 0);
```

**原则**：  
派生数据（sum、avg、total）直接在组件里计算即可，不需要放到 store 里。

---

## 6）完整示例（当前项目版）

```jsx
// App.jsx
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCountStore, useObjectListStore, useNumberListStore } from "./store";

export default function App() {
  // Selector：一次性取多个字段，配合 useShallow 防止对象变化引起重复渲染
  const { count, increment, decrement, reset } = useCountStore(
    useShallow((s) => ({
      count: s.count,
      increment: s.increment,
      decrement: s.decrement,
      reset: s.reset,
    })),
  );

  const { list, addByName, removeById } = useObjectListStore(
    useShallow((s) => ({
      list: s.list,
      addByName: s.addByName,
      removeById: s.removeById,
    })),
  );

  const { numbers, addNumber, addRandom, clearNumbers } = useNumberListStore(
    useShallow((s) => ({
      numbers: s.numbers,
      addNumber: s.addNumber,
      addRandom: s.addRandom,
      clearNumbers: s.clear,
    })),
  );

  // 派生数据直接计算，不进 store
  const sum = numbers.reduce((total, n) => total + n, 0);

  const [nameInput, setNameInput] = useState("");

  return (
    <div>
      <h3>count: {count}</h3>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>reset</button>

      <h3>object list</h3>
      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="New item name"
      />
      <button
        onClick={() => {
          const trimmed = nameInput.trim();
          if (!trimmed) return;
          addByName(trimmed);
          setNameInput("");
        }}
      >
        add
      </button>
      {list.map((item) => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => removeById(item.id)}>remove</button>
        </div>
      ))}

      <h3>number list</h3>
      <button onClick={() => addNumber(10)}>add 10</button>
      <button onClick={addRandom}>random</button>
      <button onClick={clearNumbers}>clear</button>
      <div>{numbers.join(", ")}</div>
      <div>sum: {sum}</div>
    </div>
  );
}
```

---

## 7）课堂重点总结（给学生记忆用）

1. **Selector 决定了组件订阅的范围**
2. **返回值变了，组件才重渲染**
3. **返回对象/数组时要用 useShallow**
4. **派生数据不要塞进 store**
5. **嵌套对象要谨慎，尽量细粒度 selector**
