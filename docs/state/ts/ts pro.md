下面把 **React Native 项目里最常用、最“高级且真有用”的 TypeScript 类型能力**，按“和 React 配合的典型场景”整理成一套可直接套用的范式，并配上经典代码（偏实战，而不是纯类型体操）。

---

## 1) Props：联合类型 + 判别联合（Discriminated Union）

### 场景

一个组件有多种模式（例如 `variant` 不同，要求的 props 不同），在 RN 很常见：按钮、输入框、卡片、空状态等。

```tsx
type ButtonProps =
  | { variant: "primary"; title: string; onPress: () => void; loading?: boolean }
  | { variant: "link"; title: string; href: string }
  | { variant: "icon"; icon: React.ReactElement; onPress: () => void; label?: string };

export function MyButton(props: ButtonProps) {
  switch (props.variant) {
    case "primary":
      return (
        <Pressable onPress={props.onPress} disabled={props.loading}>
          <Text>{props.loading ? "Loading..." : props.title}</Text>
        </Pressable>
      );
    case "link":
      return (
        <Pressable onPress={() => {/* open props.href */}}>
          <Text>{props.title}</Text>
        </Pressable>
      );
    case "icon":
      return (
        <Pressable onPress={props.onPress} accessibilityLabel={props.label}>
          {props.icon}
        </Pressable>
      );
  }
}
```

**价值点**：比 `optional props` 更安全，TS 会在不同模式下强制你传对字段。

---

## 2) Props：互斥属性（XOR）/ “要么 A 要么 B”

### 场景

比如 `source` 既可以是 `uri` 也可以是 `require()`，或者输入框要么 `value` 受控，要么 `defaultValue` 非受控。

```ts
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

type ImgByUri = { uri: string };
type ImgByRequire = { asset: number }; // require("...") 的返回常用 number

type SmartImageProps = XOR<ImgByUri, ImgByRequire> & {
  width: number;
  height: number;
};

function SmartImage(props: SmartImageProps) {
  const source = "uri" in props ? { uri: props.uri } : props.asset;
  return <Image source={source as any} style={{ width: props.width, height: props.height }} />;
}
```

---

## 3) 组件类型继承：ComponentPropsWithoutRef / ComponentProps

### 场景

封装 RN 组件（比如封装 Button、Input），但要继承原生组件 props，避免重复写一堆类型。

```tsx
import type React from "react";
import { Pressable, Text, type PressableProps } from "react-native";

type MyPressableProps = PressableProps & {
  title: string;
  tone?: "default" | "danger";
};

export function MyPressable({ title, tone = "default", ...rest }: MyPressableProps) {
  return (
    <Pressable {...rest}>
      <Text style={{ color: tone === "danger" ? "red" : "black" }}>{title}</Text>
    </Pressable>
  );
}
```

如果你封装的是你自己写的组件，也可以：

```ts
type PropsOf<T extends React.ElementType> = React.ComponentProps<T>;
```

---

## 4) 泛型组件：列表 / 选择器 / 表单字段（强类型数据流）

### 场景

`FlatList`、下拉选择、通用列表项渲染，最容易丢类型。

```tsx
type ListProps<T> = {
  data: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => React.ReactElement;
};

function TypedList<T>({ data, keyOf, renderItem }: ListProps<T>) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => keyOf(item)}
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

// 用法
type User = { id: string; name: string };

<TypedList<User>
  data={[{ id: "1", name: "Alice" }]}
  keyOf={(u) => u.id}
  renderItem={(u) => <Text>{u.name}</Text>}
/>;
```

---

## 5) 强类型事件：onChangeText / onPress / Gesture handlers

### 场景

封装输入框、开关、可点击组件时，事件类型经常写成 `any`。

```tsx
type InputProps = Omit<React.ComponentProps<typeof TextInput>, "onChangeText" | "value"> & {
  value: string;
  onChange: (next: string) => void;
};

function MyInput({ onChange, ...rest }: InputProps) {
  return <TextInput {...rest} onChangeText={onChange} />;
}
```

---

## 6) Hooks：useState 的“字面量收窄”与 const 断言（as const）

### 场景

状态是有限集合（tab、筛选、step），你希望 TS 自动约束。

```tsx
const tabs = ["home", "search", "profile"] as const;
type Tab = (typeof tabs)[number];

function Screen() {
  const [tab, setTab] = React.useState<Tab>("home"); // 只能是这三个
  return <Text>{tab}</Text>;
}
```

---

## 7) useReducer：Action 联合类型 + Exhaustive Check（穷尽校验）

### 场景

复杂页面状态（loading/error/data、分页、筛选），RN 很常见。

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

type Action =
  | { type: "FETCH" }
  | { type: "SUCCESS"; data: string[] }
  | { type: "FAIL"; message: string };

function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH":
      return { status: "loading" };
    case "SUCCESS":
      return { status: "success", data: action.data };
    case "FAIL":
      return { status: "error", message: action.message };
    default:
      return assertNever(action);
  }
}
```

---

## 8) Context：value 强类型 + 自定义 Hook（避免 undefined）

### 场景

Auth、Theme、Feature Flags、Locale，在 RN 都会用 Context。

```tsx
type Auth = { token: string; logout: () => void };

const AuthContext = React.createContext<Auth | null>(null);

export function useAuth() {
  const v = React.useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
```

---

## 9) Ref：forwardRef + useImperativeHandle（对外暴露实例能力）

### 场景

你封装一个输入框/弹窗/BottomSheet，需要外部调用 `focus()`、`open()`。

```tsx
type MyInputHandle = { focus: () => void; clear: () => void };

type MyInputProps = { value: string; onChange: (v: string) => void };

export const MyInput = React.forwardRef<MyInputHandle, MyInputProps>(function MyInput(
  { value, onChange },
  ref
) {
  const innerRef = React.useRef<TextInput>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => innerRef.current?.focus(),
    clear: () => onChange(""),
  }));

  return <TextInput ref={innerRef} value={value} onChangeText={onChange} />;
});

// 用法
const ref = React.useRef<MyInputHandle>(null);
ref.current?.focus();
```

---

## 10) Style 类型：StyleProp / ViewStyle / TextStyle（封装时不乱）

### 场景

封装组件传 `style`，要允许数组、条件 style、以及不同组件 style 类型。

```tsx
import type { StyleProp, ViewStyle, TextStyle } from "react-native";

type CardProps = {
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  title: string;
};

function Card({ containerStyle, titleStyle, title }: CardProps) {
  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>{title}</Text>
    </View>
  );
}
```

---

## 11) Navigation（React Navigation / Expo Router）：ParamList 强类型

### 场景

页面跳转参数错一个字段就崩；TS 可以在编译期兜住。

```ts
type RootStackParamList = {
  Home: undefined;
  Detail: { id: string; from?: "feed" | "search" };
};

type DetailRoute = RouteProp<RootStackParamList, "Detail">;

function DetailScreen({ route }: { route: DetailRoute }) {
  // route.params.id 强类型
  return <Text>{route.params.id}</Text>;
}
```

---

## 12) API 数据：unknown → Zod/自定义守卫 → 推断类型（避免信任后端）

### 场景

RN 网络请求回来是 `any`，你要让 UI 层永远拿到可信类型。

```ts
type User = { id: string; name: string };

function isUser(x: unknown): x is User {
  return !!x && typeof x === "object" && "id" in x && "name" in x;
}

async function fetchUser(): Promise<User> {
  const raw: unknown = await (await fetch("/user")).json();
  if (!isUser(raw)) throw new Error("Invalid payload");
  return raw;
}
```

---

## 13) “组件支持 as” 模式：React.ElementType + 泛型（进阶但很实用）

### 场景

一个组件既可渲染 `View` 也可渲染 `Pressable`，类似“多态组件”。

```tsx
type PolymorphicProps<T extends React.ElementType, P> =
  P & Omit<React.ComponentProps<T>, keyof P> & { as?: T };

type BoxOwnProps = { padding?: number };

function Box<T extends React.ElementType = typeof View>(props: PolymorphicProps<T, BoxOwnProps>) {
  const { as, padding = 0, ...rest } = props;
  const Comp = (as ?? View) as React.ElementType;
  return <Comp {...rest} style={[{ padding }, (rest as any).style]} />;
}

// 用法
<Box padding={12} />
<Box as={Pressable} padding={12} onPress={() => {}} />
```

---

## 14) 类型工具箱：Pick / Omit / Partial / Required / Readonly 的实战模式

### 场景清单（RN 高频）

* `Omit<..., "style">`：封装组件重写 style 管理
* `Pick<..., "onPress" | "disabled">`：透传少量 props
* `Partial<T>`：草稿状态（draft form）
* `Required<T>`：提交前校验后的“完整态”
* `Readonly<T>`：配置常量

```ts
type DraftProfile = Partial<{ name: string; avatar: string; bio: string }>;

type SubmitProfile = Required<Pick<DraftProfile, "name" | "avatar">> & { bio?: string };
```

---

# 建议的“学习与落地顺序”（按你 RN 项目收益排序）

1. 判别联合（variant 模式）
2. Omit/Pick + 继承 RN 原生 Props
3. forwardRef + useImperativeHandle
4. 泛型列表/选择器
5. useReducer 的 Action 联合
6. Navigation ParamList
7. unknown 校验（守卫或 zod）
8. Polymorphic as（想做组件库再上）

---

如果你把你项目里**你正在封装的一个组件**（例如 Button/Input/Modal/List）贴出来，我可以按你现有代码直接改成“上述 TS 高级属性都用上且不臃肿”的版本，并给出你团队也容易维护的类型结构。
