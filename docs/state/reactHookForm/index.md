结论先给你一句话：

> **React Hook Form + Zod 在 React（Web）和 React Native 中的“验证思想、Zod 规则、表单状态模型”几乎完全一致；
> 真正的差别集中在「输入组件、事件模型、表单提交方式、平台能力」上。**

下面我按**“不会变的 / 会变的 / 实战注意点 / 学习顺序建议”**来系统讲清楚。

---

## 一、不会变的部分（≈ 90% 一样）

### 1️⃣ 表单核心 API（完全一致）

在 Web 和 RN 中你用的都是：

- `useForm`
- `control`
- `handleSubmit`
- `formState`
  - `errors`
  - `isSubmitting`
  - `isDirty`
  - `isValid`

- `Controller`

**Zod**

- `z.object`
- `z.string().min().email()`
- `z.number()`
- `refine / superRefine`
- `zodResolver`

👉 **验证逻辑、schema 设计、错误结构完全一致**

---

### 2️⃣ Zod 的价值：跨端 100% 复用

Zod 本质是**纯 JS 校验库**，和平台无关：

```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

- Web：表单校验
- RN：表单校验
- 后端（Node / Nest）：请求校验

👉 **一份 schema，多端复用**（这是 RHF + Zod 最大的工程价值）

## 二、真正的差别（关键点在这里）

### 1️⃣ 输入组件与事件模型（最重要差别）

| 对比点      | React（Web）      | React Native         |
| ----------- | ----------------- | -------------------- |
| 输入组件    | `<input />`       | `<TextInput />`      |
| 事件        | `onChange(e)`     | `onChangeText(text)` |
| value 获取  | `e.target.value`  | 直接是字符串         |
| ref 支持    | 原生支持          | 不完全支持           |
| 表单 submit | `<form onSubmit>` | 无 form 概念         |

👉 **这就是为什么 RN 中必须大量使用 `Controller`**



### 2️⃣ register vs Controller 的差异

#### Web（register 是主流）

```tsx
<input {...register("email")} />
```

#### RN（Controller 是标准做法）

```tsx
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <TextInput value={value} onChangeText={onChange} />
  )}
/>
```

原因很简单：

- RN 组件 **不是标准 input**
- 没有 `name`、`ref`、`onChange(e)`

👉 **不是 RHF 在 RN 变难了，是组件模型不同**

---

### 3️⃣ 表单提交方式不同

#### Web

- 浏览器有 `<form>`
- 支持 Enter 提交
- 支持 `preventDefault`

#### RN

- 没有 form
- 手动绑定按钮：

```tsx
<Button title="提交" onPress={handleSubmit(onSubmit)} />
```

👉 提交完全由你控制，更“命令式”

---

### 4️⃣ 原生能力差异（RN 专属）

| 能力     | Web               | RN                        |
| -------- | ----------------- | ------------------------- |
| 键盘     | 自动处理          | 需 `KeyboardAvoidingView` |
| 输入法   | 浏览器            | 系统级（iOS/Android）     |
| 自动完成 | 原生支持          | 平台差异大                |
| 安全输入 | `type="password"` | `secureTextEntry`         |
| 聚焦     | `autoFocus`       | 需要谨慎                  |

👉 这些 **不影响 Zod / RHF 本身**，但影响表单体验

---

## 三、Zod 在 RN 中的“隐藏坑”（但不是差别）

### 1️⃣ 输入值全是字符串

```ts
age: z.number();
```

RN 中必须：

```ts
age: z.coerce.number();
```

否则永远报错。

---

### 2️⃣ 性能与实时校验

- RN 更建议：
  - `mode: 'onSubmit'`
  - 或 `onBlur`

- 不建议 `onChange` 全量实时校验（低端机）

---

### 3️⃣ 错误提示展示方式

Web：tooltip / 红字
RN：Text + 样式 + layout

👉 校验一致，UI 表达不同

---

## 四、工程化差异（但你可以统一）

### 推荐结构（Web & RN 通用）

```
/schemas
  └── login.schema.ts   // Zod
/hooks
  └── useLoginForm.ts   // RHF
/components
  └── LoginForm.tsx
```

`useLoginForm.ts`

```ts
export function useLoginForm() {
  return useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });
}
```

👉 **Web / RN 只换组件，不换表单逻辑**

---

## 五、学习顺序建议（非常明确）

### ✅ 正确顺序

1. **React（Web）**
   - register
   - 基本 Controller
   - 错误处理

2. **React Native**
   - Controller 全量使用
   - 键盘 / 输入体验
   - 移动端交互优化

### ❌ 不推荐

- 一上来用 RN 学 RHF + Zod（心智负担太大）

---

## 最终总结（记住这 3 句话）

1. **Zod：Web / RN / 后端 100% 一样**
2. **React Hook Form：核心一致，RN 更依赖 Controller**
3. **差别来自平台，不来自表单库**

如果你愿意，我可以下一步直接给你：

- 一份 **React 登录表单 vs RN 登录表单对照代码**
- 或 **RHF + Zod 在 RN 的最佳实践模板（含键盘、错误、性能）**

你选一个，我直接给你完整可用版本。
