## 1

`npm install zustand`

state 放数据，set 用来改数据

```js
set({ count: 1 });                     // 直接替换
set((state) => ({ count: state.count + 1 })); // 依赖旧状态
set(() => ({ count: 0 }), true);       // replace（较少用）
```

```js
//count.store.js
import { create } from "zustand";

export const useCountStore = create((set) => ({
  count: 0,

  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

```jsx
import { useCountStore } from "./store/count.store";

export default function App() {
  const count = useCountStore((state) => state.count);
  const increment = useCountStore((state) => state.increment);
  const decrment = useCountStore((state) => state.decrement);

  return (
    <div>
      <div>App</div>
      <h2>Count : {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrment}>-</button>
    </div>
  );
}
```

## 2

```js
import { create } from "zustand";

export const useCountStore = create((set) => ({
  count: 0,
  bear: 9,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementBear: () => set((state) => ({ bear: state.bear + 1 })),
  decrementBear: () => set((state) => ({ bear: state.bear - 1 })),
  resetBear: () => set({ bear: 9 }),
}));
```

```js
import { useCountStore } from "./store/count.store";

export default function App() {
  const count = useCountStore((state) => state.count);
  const increment = useCountStore((state) => state.increment);
  const decrment = useCountStore((state) => state.decrement);

  const bear = useCountStore((state) => state.bear);
  const incrementBear = useCountStore((state) => state.incrementBear);
  const decrementBear = useCountStore((state) => state.decrementBear);
  const resetBear = useCountStore((state) => state.resetBear);

  return (
    <div>
      <div>App</div>
      <h2>Count : {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrment}>-</button>
      <hr />
      <h2>Bear : {bear}</h2>
      <button onClick={incrementBear}>+</button>
      <button onClick={decrementBear}>-</button>
      <button onClick={resetBear}>reset</button>
    </div>
  );
}
```

## 3

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
// App.jsx
import { useState } from "react";
import { useCountStore, useObjectListStore, useNumberListStore } from "./store";

function App() {
  const count = useCountStore((s) => s.count);
  const increment = useCountStore((s) => s.increment);
  const decrement = useCountStore((s) => s.decrement);
  const incrementBy = useCountStore((s) => s.incrementBy);
  const decrementBy = useCountStore((s) => s.decrementBy);
  const reset = useCountStore((s) => s.reset);

  const list = useObjectListStore((s) => s.list);
  const addByName = useObjectListStore((s) => s.addByName);
  const removeById = useObjectListStore((s) => s.removeById);
  const clearObjectList = useObjectListStore((s) => s.clear);

  const numbers = useNumberListStore((s) => s.numbers);
  const addNumber = useNumberListStore((s) => s.addNumber);
  const addRandom = useNumberListStore((s) => s.addRandom);
  const removeLast = useNumberListStore((s) => s.removeLast);
  const clearNumbers = useNumberListStore((s) => s.clear);

  const [nameInput, setNameInput] = useState("");
  const [numberInput, setNumberInput] = useState("");

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

```

```

```

```
