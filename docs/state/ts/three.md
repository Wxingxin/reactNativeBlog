下面给你一份「**React + TypeScript 高级用法大全**」——默认你已经会基础的 `FC<Props>`、`useState<string>()`、事件类型等，所以我只放**真实项目里常见、踩坑多、收益高**的写法（配经典代码）。

---

## 1) Props：让组件“更难用错”

### 1.1 互斥 Props（XOR / union）

比如：要么传 `href`（渲染 `<a>`），要么传 `onClick`（渲染 `<button>`），不能同时传。

```ts
type LinkLike =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };

type Props = LinkLike & { children: React.ReactNode };

function Action(props: Props) {
  if (props.href) return <a href={props.href}>{props.children}</a>;
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### 1.2 “必须二选一”：ExactlyOne

```ts
type ExactlyOne<T, K extends keyof T = keyof T> =
  K extends keyof T
    ? Required<Pick<T, K>> & Partial<Record<Exclude<keyof T, K>, never>>
    : never;

type Filter = ExactlyOne<{ userId?: string; email?: string; phone?: string }>;

function fetchUser(filter: Filter) {}
fetchUser({ email: "a@b.com" }); // ✅
fetchUser({ email: "a@b.com", userId: "1" }); // ❌
```

### 1.3 根据 Props 推导回调参数类型

```ts
type Props<T> = {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>(props: Props<T>) {
  return <>{props.data.map(props.renderItem)}</>;
}

<List
  data={[{ id: 1, name: "a" }]}
  renderItem={(x) => <div>{x.name}</div>} // x 自动推导
/>;
```

---

## 2) 组件泛型：做真正可复用的 UI

### 2.1 泛型 Select（value / onChange 强约束）

```ts
type SelectProps<T extends string | number> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
};

function Select<T extends string | number>(props: SelectProps<T>) {
  return (
    <select value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
      {props.options.map((o) => (
        <option key={String(o.value)} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
```

---

## 3) “多态组件” Polymorphic：as 属性（设计系统必备）

你做 Button / Text / Box 这种组件时常要支持 `as="a"` 或 `as={Link}`。

```ts
type AsProp<E extends React.ElementType> = { as?: E };

type PropsToOmit<E extends React.ElementType, P> = keyof (AsProp<E> & P);

type PolymorphicProps<E extends React.ElementType, P> =
  P & AsProp<E> & Omit<React.ComponentPropsWithoutRef<E>, PropsToOmit<E, P>>;

type ButtonOwnProps = { variant?: "solid" | "ghost" };

function Button<E extends React.ElementType = "button">(
  props: PolymorphicProps<E, ButtonOwnProps>
) {
  const { as, variant, ...rest } = props;
  const Comp = as || "button";
  return <Comp data-variant={variant} {...rest} />;
}

// 用法
<Button onClick={() => {}} variant="solid">OK</Button>
<Button as="a" href="/docs" variant="ghost">Docs</Button>
```

---

## 4) Ref：forwardRef + useImperativeHandle 的“正确类型”

### 4.1 暴露命令式 API（输入框聚焦、清空等）

```ts
type InputHandle = { focus: () => void; clear: () => void };

type Props = { defaultValue?: string };

const SmartInput = React.forwardRef<InputHandle, Props>((props, ref) => {
  const [value, setValue] = React.useState(props.defaultValue ?? "");
  const elRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => elRef.current?.focus(),
    clear: () => setValue(""),
  }));

  return <input ref={elRef} value={value} onChange={(e) => setValue(e.target.value)} />;
});

// 使用
const r = React.useRef<InputHandle>(null);
r.current?.focus();
```

---

## 5) Hook 高级类型：减少重复、增强推导

### 5.1 useEvent：稳定引用 + 正确参数类型

```ts
function useEvent<T extends (...args: any[]) => any>(fn: T) {
  const ref = React.useRef(fn);
  React.useLayoutEffect(() => {
    ref.current = fn;
  });
  return React.useCallback(((...args) => ref.current(...args)) as T, []);
}
```

### 5.2 useAsync：返回值/参数全推导

```ts
function useAsync<TArgs extends any[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<TResult | null>(null);
  const [error, setError] = React.useState<unknown>(null);

  const run = React.useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setData(res);
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { run, loading, data, error };
}
```

---

## 6) Context：避免“any”与 null 判断爆炸

### 6.1 createStrictContext：不包 Provider 就直接报错（强烈推荐）

```ts
function createStrictContext<T>() {
  const Ctx = React.createContext<T | null>(null);
  function useCtx() {
    const v = React.useContext(Ctx);
    if (!v) throw new Error("Context Provider missing");
    return v;
  }
  return [Ctx.Provider, useCtx] as const;
}

type Auth = { token: string; logout: () => void };
const [AuthProvider, useAuth] = createStrictContext<Auth>();
```

---

## 7) TS 4.9+ satisfies：配置对象“既校验又不丢推导”

### 7.1 routes/columns 这种配置非常香

```ts
type Route = { path: string; element: React.ReactNode };

const routes = [
  { path: "/", element: <div /> },
  { path: "/users", element: <div /> },
] satisfies Route[];

// routes 保留字面量类型（path 是 "/" | "/users"）
```

---

## 8) React 组件 Props 的“提取与复用”

### 8.1 从组件提取 props 类型（封装 HOC/Wrapper 常用）

```ts
type InputProps = React.ComponentPropsWithoutRef<"input">;

function TextField(props: InputProps & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}
```

---

## 9) 类型体操在 React 中的高频工具箱（你会经常用到）

```ts
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type NonEmptyArray<T> = [T, ...T[]];

type Brand<T, B extends string> = T & { __brand: B };
type UserId = Brand<string, "UserId">;

type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```

---

## 10) 常见“坑”与项目规范建议（高级 TS 必须配套）

* **不要滥用 `React.FC`**：children 隐式 + defaultProps 历史包袱，建议用普通函数组件类型推导即可。
* **事件别写 `any`**：尽量用 `React.ChangeEvent<HTMLInputElement>` / `React.MouseEvent<HTMLButtonElement>`，但别过度显式（让 TS 推导优先）。
* **Props 优先用 union + never** 做约束，胜过运行时 if 校验。
* 配置对象（routes、columns、zod schema 映射等）优先用 `satisfies`。

---

如果你愿意我可以继续往更硬核的方向补全两块（都非常实战）：

1. **React Hook Form / Zod / TanStack Query** 这类库与 TS 的高级类型配合套路
2. **设计系统组件库**（Polymorphic + Variant + className 合并 + 类型安全主题）完整范式

你现在更偏哪种：**业务开发（表单/请求）** 还是 **组件库（Button/Modal/Dropdown）**？我直接给你对应的“项目级模板”。
