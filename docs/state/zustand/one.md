这是一个**非常关键、而且很多人长期用错 Zustand 的点**。
我会从**“状态类型 → set 行为 → 常见坑 → 推荐写法”**这四个维度，把 **数字 / 数组 / 对象**在 Zustand 中的处理方式一次性讲清楚。

---

## 一、一个总原则（先记住）

> **Zustand 的 set 是“浅合并（shallow merge）”，不是深拷贝**

这句话决定了：

* 数字、布尔值：**直接替换**
* 数组、对象：**你必须自己创建新引用**
* Zustand **不会帮你深拷贝**

---

## 二、数字（Number / Boolean / String）

### 特点

* 原始类型（primitive）
* 没有“内部结构”
* set 时一定是**替换**

### 正确写法

```js
const useCounterStore = create((set) => ({
  count: 0,

  inc: () =>
    set((state) => ({
      count: state.count + 1
    })),

  reset: () => set({ count: 0 }),
}));
```

### 关键认知

* `state.count++` ❌（永远不要）
* 必须返回一个新值
* 不存在“合并”问题

### 本质

```js
count: 1  →  count: 2
```

---

## 三、数组（Array）

### 特点（非常重要）

* **数组是引用类型**
* Zustand 不会检测你是否 `push`
* **必须返回新数组**

---

### ❌ 错误写法（新手高频雷区）

```js
addTodo: (todo) =>
  set((state) => {
    state.todos.push(todo); // ❌ 原地修改
    return { todos: state.todos };
  });
```

问题：

* 数组引用没变
* React 不一定重新渲染
* 状态被“悄悄污染”

---

### ✅ 正确写法（推荐）

#### 1️⃣ 新增元素

```js
addTodo: (todo) =>
  set((state) => ({
    todos: [...state.todos, todo],
  }));
```

#### 2️⃣ 删除元素

```js
removeTodo: (id) =>
  set((state) => ({
    todos: state.todos.filter((t) => t.id !== id),
  }));
```

#### 3️⃣ 修改元素

```js
updateTodo: (id, text) =>
  set((state) => ({
    todos: state.todos.map((t) =>
      t.id === id ? { ...t, text } : t
    ),
  }));
```

---

### 数组的核心心智模型

> **数组在 Zustand 中 = 不可变数据**

每一次修改 = **返回新数组**

---

## 四、对象（Object）

### 特点

* Zustand 只做 **第一层合并**
* 深层对象不会自动合并

---

### ❌ 错误示例（非常常见）

```js
user: {
  name: 'Tom',
  profile: {
    age: 18,
  },
}

set({
  user: { name: 'Jerry' }
});
```

结果：

```js
user = {
  name: 'Jerry'
  // profile 丢失 ❌
}
```

---

### ✅ 正确写法（浅层对象）

```js
set((state) => ({
  user: {
    ...state.user,
    name: 'Jerry',
  },
}));
```

---

### ✅ 深层对象更新（最容易写错）

```js
set((state) => ({
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      age: 20,
    },
  },
}));
```

---

### 对象的核心原则

> **你更新哪一层，就拷贝到哪一层**

---

## 五、数字 / 数组 / 对象对比总结表（重点）

| 类型      | 是否可变 | set 行为 | 你要做什么  |
| ------- | ---- | ------ | ------ |
| Number  | 否    | 替换     | 直接返回新值 |
| Boolean | 否    | 替换     | 直接返回   |
| String  | 否    | 替换     | 直接返回   |
| Array   | 是    | 浅合并    | 创建新数组  |
| Object  | 是    | 浅合并    | 手动拷贝   |

---

## 六、为什么 Zustand “容易写错”

原因只有一个：

> **Zustand 给你完全自由，但不帮你兜底**

对比：

* Redux Toolkit：内部用 Immer，允许“看似可变”
* Zustand：**你写什么就执行什么**

所以：

* Zustand 更轻
* 但要求你 **真正理解不可变数据**

---

## 七、进阶：用 immer 中间件（可选）

如果你觉得对象 / 数组太啰嗦：

```js
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  immer((set) => ({
    todos: [],
    addTodo: (todo) =>
      set((state) => {
        state.todos.push(todo); // ✅ 合法
      }),
  }))
);
```

### 使用建议

* 小项目：不用
* 中项目：可选
* 大对象嵌套多：值得用

---

## 八、结合你的项目经验的建议（重点）

基于你现在：

* React / RN
* Zustand 用于业务状态
* 后端 Express

**推荐实践：**

* 数字 / Boolean → 状态位
* 数组 → 列表型数据（posts / comments）
* 对象 → 当前用户 / 设置
* **异步请求仍然交给 React Query**
* Zustand 只负责“状态结构”

---

## 九、一句话总结（记住这句）

> **Zustand 不关心你存什么，它只在乎“引用有没有变”**

如果你愿意，下一步我可以帮你：

* 用一个「登录 + 用户信息 + 列表」例子综合演示
* 对比 Zustand + Immer vs 原生写法
* 把你现有 Context 改成 Zustand 的完整步骤

你可以直接告诉我你想用在哪个场景。
