在 React Native 里结合 TypeScript（TS）使用，本质上是：**让“数据形状、组件 props、状态、导航参数、网络返回、表单、全局状态、原生模块边界”全部类型化**，把运行时错误尽量前移到编译期。

下面我按“你主要会在哪些地方用 TS”来给你一份清晰的落地清单，并给出典型写法。

---

## 1) 组件 Props 与复用组件（使用频率最高）

你封装 RN 组件（Button、Checkbox、Card、ListItem）时，TS 主要用在 **Props 接口**、**回调参数**、**children 类型**。

```tsx
type AppButtonProps = {
  title: string;
  disabled?: boolean;
  onPress: () => void;
};

export function AppButton({ title, disabled, onPress }: AppButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
}
```

常见收益：调用方少传/错传 props 会直接报错；回调签名更稳定。

---

## 2) useState / useRef / useReducer（非常常用）

### useState：对象/联合类型更关键

```tsx
type User = { id: string; name: string };

const [user, setUser] = useState<User | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
```

### useRef：输入框、动画、定时器

```tsx
const inputRef = useRef<TextInput>(null);

const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### useReducer：复杂状态机（可维护性大幅提升）

```tsx
type State = { count: number };
type Action = { type: 'inc' } | { type: 'dec' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
  }
}
```

---

## 3) 列表渲染 FlatList / SectionList（高频 + 容易踩坑）

`renderItem` 的 item 类型、keyExtractor、数据数组类型化最关键。

```tsx
type Msg = { id: string; title: string };

<FlatList<Msg>
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Text>{item.title}</Text>}
/>
```

---

## 4) React Navigation / Expo Router 路由参数（非常建议重点类型化）

这是 RN 项目里“最值得 TS 覆盖”的地方之一：**页面参数错传/漏传**会被 TS 直接拦住。

### React Navigation（示例）

```ts
type RootStackParamList = {
  Home: undefined;
  Detail: { id: string };
};
```

然后在页面里：

```tsx
type DetailProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

function DetailScreen({ route }: DetailProps) {
  route.params.id; // string
}
```

如果你用 Expo Router，也可以把 route params 的类型集中声明，避免 “any params”。

---

## 5) 网络请求 / API 返回数据（很关键）

核心是：**不要把接口返回当 any**；至少给“你真正用到的字段”建类型，并在请求层统一。

```ts
type ApiResp<T> = { data: T; message: string };

type Product = { id: string; name: string };

async function fetchProducts(): Promise<ApiResp<Product[]>> {
  const res = await fetch('...');
  return res.json();
}
```

如果你用 TanStack Query（你之前也在看），TS 的收益更明显：`useQuery` 的 `data` 自动推断。

---

## 6) 表单与校验（React Hook Form + Zod 最常见）

TS 主要用在：**表单字段类型** 与 **校验 schema 的推断**，避免字段名拼错、类型不一致。

```ts
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;
```

---

## 7) 全局状态（Zustand / Redux）与业务数据模型

你状态里存什么类型（用户、token、列表、分页信息），TS 会让 store 更稳定。

```ts
type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
};
```

---

## 8) RN 事件类型（中频，但很有用）

比如 TextInput、Pressable 的事件对象：

```tsx
<TextInput
  onChangeText={(text: string) => setValue(text)}
/>

<Pressable
  onPress={(e) => {
    // e: GestureResponderEvent
  }}
/>
```

---

## 9) 样式 StyleSheet（中频）

RN 的样式本身已做了一部分类型，但你可以用 `StyleProp<ViewStyle>`、`TextStyle` 约束组件传入的 style。

```tsx
type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
```

---

## 10) 原生模块边界（低频但高价值）

如果你写 Native Module / TurboModule，TS 用在 JS/TS 与 Native 的接口边界，避免参数错传导致崩溃。

---

# 你问“主要在哪里使用”：结论（按优先级）

**优先级从高到低（建议你先覆盖前 6 个）：**

1. **组件 Props（封装组件）**
2. **路由参数（React Navigation / Expo Router）**
3. **API 返回数据与请求层**
4. **列表数据（FlatList / SectionList）**
5. **状态管理（useState/useReducer/Zustand）**
6. **表单字段（React Hook Form + Zod）**
7. 事件类型（输入、点击）
8. style 类型（可选）
9. 原生模块边界（做原生时再上）

---

# 在 RN 项目里 TS 的文件与配置通常怎么放

* 组件：`src/components/**.tsx`
* 页面：`src/screens/**.tsx` 或 `app/**.tsx`（Expo Router）
* 类型：`src/types/**`（比如 `api.ts`, `navigation.ts`, `models.ts`）
* 请求层：`src/services/**`
* 全局 store：`src/store/**`
* `tsconfig.json`：项目根目录

---

如果你告诉我你现在的 RN 项目是 **Expo（含 Expo Router）** 还是 **React Native CLI（React Navigation）**，我可以给你一套**最贴合你栈的 TS 目录结构 + tsconfig 推荐 + 路由类型示例**，直接照抄可用。
