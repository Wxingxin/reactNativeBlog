下面给你一份 **React `useReducer` + `useContext` 配合 TypeScript 的“项目级使用大全”**（偏高级、可直接落地）。核心目标：**类型安全、避免 Provider 缺失、避免 action 写错、避免 dispatch any、可拆分模块、可做 selector 优化**。

---

## 1) 最推荐的基础架构：Action Union + Strict Context

### 1.1 定义 State / Action（判别联合）

```ts
type AuthState = {
  token: string | null;
  user: { id: string; name: string } | null;
  status: "idle" | "loading" | "authed";
};

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { token: string; user: { id: string; name: string } } }
  | { type: "LOGOUT" }
  | { type: "SET_NAME"; payload: { name: string } };
```

### 1.2 reducer：用 `never` 做穷尽检查（高级必备）

```ts
const initialAuthState: AuthState = { token: null, user: null, status: "idle" };

function assertNever(x: never): never {
  throw new Error("Unhandled action: " + JSON.stringify(x));
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, status: "loading" };

    case "LOGIN_SUCCESS":
      return { token: action.payload.token, user: action.payload.user, status: "authed" };

    case "LOGOUT":
      return initialAuthState;

    case "SET_NAME":
      if (!state.user) return state;
      return { ...state, user: { ...state.user, name: action.payload.name } };

    default:
      return assertNever(action);
  }
}
```

### 1.3 Strict Context：不包 Provider 直接报错（避免 `state!`）

```ts
function createStrictContext<T>() {
  const Ctx = React.createContext<T | null>(null);
  const useCtx = () => {
    const v = React.useContext(Ctx);
    if (!v) throw new Error("Context Provider missing");
    return v;
  };
  return [Ctx.Provider, useCtx] as const;
}
```

---

## 2) 最常见写法：State + Dispatch 分离（减少无关组件 re-render）

把 `state` 和 `dispatch` 拆两个 context：组件只用 dispatch 时不会被 state 变化触发重渲染。

```ts
type AuthDispatch = React.Dispatch<AuthAction>;

const [AuthStateProvider, useAuthState] = createStrictContext<AuthState>();
const [AuthDispatchProvider, useAuthDispatch] = createStrictContext<AuthDispatch>();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(authReducer, initialAuthState);

  return (
    <AuthStateProvider value={state}>
      <AuthDispatchProvider value={dispatch}>{children}</AuthDispatchProvider>
    </AuthStateProvider>
  );
}
```

使用：

```ts
function Profile() {
  const user = useAuthState().user;
  return <div>{user?.name ?? "Guest"}</div>;
}

function LogoutButton() {
  const dispatch = useAuthDispatch();
  return <button onClick={() => dispatch({ type: "LOGOUT" })}>Logout</button>;
}
```

---

## 3) 再进一步：封装成 `useAuth()`（返回 state + actions，不直接暴露 dispatch）

真实项目更推荐：**组件不手写 action**，避免 type/payload 拼错。

```ts
function useAuth() {
  const state = useAuthState();
  const dispatch = useAuthDispatch();

  const actions = React.useMemo(
    () => ({
      loginStart: () => dispatch({ type: "LOGIN_START" }),
      loginSuccess: (payload: { token: string; user: { id: string; name: string } }) =>
        dispatch({ type: "LOGIN_SUCCESS", payload }),
      logout: () => dispatch({ type: "LOGOUT" }),
      setName: (name: string) => dispatch({ type: "SET_NAME", payload: { name } }),
    }),
    [dispatch]
  );

  return { state, ...actions };
}
```

使用：

```ts
function LoginPanel() {
  const { state, loginStart, loginSuccess } = useAuth();

  const onLogin = async () => {
    loginStart();
    // await api...
    loginSuccess({ token: "t", user: { id: "1", name: "wjx" } });
  };

  return <button disabled={state.status === "loading"} onClick={onLogin}>Login</button>;
}
```

---

## 4) Action Creator + 类型自动推导（更像 Redux Toolkit 的体验）

你可以把 action creators 独立出来，dispatch 的入参仍然保持强类型。

```ts
const authActions = {
  loginStart: () => ({ type: "LOGIN_START" } as const),
  loginSuccess: (payload: { token: string; user: { id: string; name: string } }) =>
    ({ type: "LOGIN_SUCCESS", payload } as const),
  logout: () => ({ type: "LOGOUT" } as const),
};

type AuthAction2 = ReturnType<(typeof authActions)[keyof typeof authActions]>;
type AuthDispatch2 = React.Dispatch<AuthAction2>;
```

---

## 5) 支持异步：不要把 async 写进 reducer（正确范式）

### 5.1 thunk 风格（自己实现一个最轻量版）

让 dispatch 支持函数：`dispatch((dispatch, getState) => {})`

```ts
type Thunk<S, A> = (dispatch: React.Dispatch<A>, getState: () => S) => void | Promise<void>;
type DispatchEx<S, A> = (action: A | Thunk<S, A>) => void;

function useThunkReducer<S, A>(
  reducer: React.Reducer<S, A>,
  initial: S
): [S, DispatchEx<S, A>] {
  const [state, dispatch] = React.useReducer(reducer, initial);
  const stateRef = React.useRef(state);
  React.useEffect(() => { stateRef.current = state; }, [state]);

  const dispatchEx: DispatchEx<S, A> = React.useCallback((action) => {
    if (typeof action === "function") return (action as Thunk<S, A>)(dispatch, () => stateRef.current);
    dispatch(action);
  }, []);

  return [state, dispatchEx];
}
```

在 Provider 里用：

```ts
type AuthDispatchEx = DispatchEx<AuthState, AuthAction>;
const [AuthDispatchProviderEx, useAuthDispatchEx] = createStrictContext<AuthDispatchEx>();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useThunkReducer(authReducer, initialAuthState);

  return (
    <AuthStateProvider value={state}>
      <AuthDispatchProviderEx value={dispatch}>{children}</AuthDispatchProviderEx>
    </AuthStateProvider>
  );
}
```

异步 action：

```ts
const login = (email: string, pwd: string) => async (dispatch: React.Dispatch<AuthAction>) => {
  dispatch({ type: "LOGIN_START" });
  // const res = await api.login(...)
  dispatch({ type: "LOGIN_SUCCESS", payload: { token: "t", user: { id: "1", name: "wjx" } } });
};
```

组件调用：

```ts
const dispatch = useAuthDispatchEx();
dispatch(login("a@b.com", "123"));
```

---

## 6) 性能优化：selector（避免所有组件都被 state 变化牵连）

> 注意：React 原生 context 只要 value 变，所有 consumer 都会 re-render。
> 你可以做两步优化：
>
> 1. state/dispatch 分离（上面已经做）
> 2. 再用 selector + memo（或引入 `use-context-selector` 这个库）

### 6.1 不引库的轻量 selector（够用但不是完美）

```ts
function useAuthSelector<T>(selector: (s: AuthState) => T): T {
  const state = useAuthState();
  return selector(state);
}

const userName = useAuthSelector((s) => s.user?.name);
```

如果你要“真正的 selector 不重渲染”，建议直接用 `use-context-selector`，项目里收益很大。

---

## 7) 项目组织结构建议（大项目不乱）

```
auth/
  state.ts       // State/Action/types
  reducer.ts
  actions.ts     // action creators / thunks
  context.tsx    // Provider + hooks
```

并且强制：

* reducer 只做同步纯函数
* 所有 dispatch 都走 `actions`（组件不要手写 `{type:...}`）
* Context 提供 `useXState` / `useXDispatch` / `useX()`（三套）

---

## 8) 常见坑位（你会遇到）

* **不要**把 `dispatch` 和 `{state, dispatch}` 放一个 context（会导致只用 dispatch 的组件也跟着重渲染）
* **不要**在 reducer 里 `await` / 调接口
* action 用 `as const` 或判别联合，否则 `type` 会变成 `string`，失去收窄能力
* Strict Context 一定要用，别让组件里写 `ctx!`

---

如果你告诉我你现在的场景是哪种，我可以把上面模板直接“套成你的项目版本”：

1. **登录鉴权 Auth**（token + refresh + 401 处理）
2. **全局 UI 状态**（toast、modal、loading、theme）
3. **表单复杂状态**（多步骤 wizard、动态字段）

你更想先做哪一个？
