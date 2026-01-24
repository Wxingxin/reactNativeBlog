下面给你一条在 **React 项目里系统学习 React Hook Form（RHF）** 的路线（偏“能落地做项目”的顺序），并把每一阶段要掌握的概念、练习题、常见坑、以及推荐的组合（Zod / TS / UI 组件库）一起规划好。你可以按阶段推进；每个阶段都配了“验收标准”，学完就能判断自己是否真的会用。

---

## 阶段 0：前置能力与环境（0.5 天）

**目标**：不被 TS、受控/非受控、事件模型这些基础绊住。

你需要确认自己已经理解：

* React 基础：组件、props、state、受控组件（`value/onChange`）、ref、合成事件
* 表单基础：`name`、`defaultValue`、校验、提交、禁用、重置
* （建议）TypeScript：泛型、联合类型、类型推断（RHF + Zod 时会大量出现）

**验收标准**

* 能写一个“受控输入框”表单并处理提交
* 明白什么是“非受控”（输入值由 DOM 自己维护）与“受控”（由 React state 维护）

---

## 阶段 1：RHF 核心理念与最小闭环（1 天）

**目标**：建立 RHF 的心智模型：**基于非受控 + ref 注册**，减少 re-render。

学习内容（必须掌握）：

1. `useForm()`：核心入口

   * `defaultValues`
   * `handleSubmit`
   * `formState`（`errors/isSubmitting/isDirty/isValid` 等）
2. `register(name, rules)`：注册原生 input

   * `required/minLength/pattern/validate`
3. 基础提交与错误展示

   * `handleSubmit(onValid, onInvalid)`
   * `formState.errors`

练习任务（强制做）：

* 登录表单：邮箱 + 密码

  * 邮箱 pattern 校验
  * 密码最小长度
  * 提交时按钮 loading（用 `isSubmitting`）

常见坑（要刻意避开）：

* `defaultValues` 只在初始化生效；异步回填要用 `reset()`
* 错误消息不要写死在组件里，统一从 `errors.xxx?.message` 读

**验收标准**

* 能不用 `useState` 管理每个 input 值，照样完成校验、提交、展示错误

---

## 阶段 2：校验策略进阶（1–2 天）

**目标**：把“规则校验”从简单 required 推进到“复杂业务校验”。

学习内容：

1. 校验触发模式：`mode / reValidateMode`

   * `onChange / onBlur / onSubmit / all`
2. 自定义校验：`validate: (value) => true | string`
3. 交叉字段校验：`getValues` / `watch`

   * 例如：确认密码必须等于密码

练习任务：

* 注册表单：邮箱、密码、确认密码、勾选用户协议
* 校验要求：

  * 密码必须包含数字 + 字母（pattern 或 validate）
  * 确认密码等于密码（交叉校验）
  * 勾选协议才能提交

**验收标准**

* 你能清晰说明：你选择 `mode` 的原因（例如希望输入时就提示 vs 失焦提示）

---

## 阶段 3：表单状态管理与性能（1–2 天）

**目标**：理解 RHF 的优势点，并能在复杂页面里“稳定、不卡、可维护”。

学习内容：

1. `watch()` vs `useWatch()`

   * watch 会导致组件整体订阅；useWatch 可以更精细订阅
2. `formState` 的使用策略（避免不必要渲染）
3. `setValue / getValues / trigger / clearErrors / setError`
4. `reset / resetField`：重置与回填

练习任务：

* “个人信息编辑页”：

  * 进入页面先请求用户资料，回填表单（用 `reset`）
  * 修改任意字段时显示“未保存”提示（`isDirty`）
  * 保存失败时给某个字段打服务端错误（`setError`）

**验收标准**

* 异步回填不会出现 input 不更新或警告
* 你能把服务端返回的字段错误映射到对应表单字段

---

## 阶段 4：集成 UI 组件（Controller / useController）（2–3 天）

**目标**：你会在真实项目里对接：Select、DatePicker、Switch、富文本、第三方输入组件。

学习内容：

1. 为什么需要 `Controller`

   * 第三方组件不直接暴露 `ref` 或不遵循原生 input 协议
2. `Controller` 的 `render({ field, fieldState })`
3. `useController`：封装自定义表单组件（更工程化）

练习任务：

* 使用 UI 库组件做一个表单：

  * Select（单选/多选）
  * Switch
  * DatePicker
* 要求：每个组件都能正确校验、显示错误、重置

**验收标准**

* 你能写一个可复用的 `<RHFInput />` / `<RHFSelect />` 封装组件
* 重置、回填都正常

---

## 阶段 5：动态表单与数组（useFieldArray）（2 天）

**目标**：处理“可增删的表单项”，这是后台系统/配置页高频需求。

学习内容：

1. `useFieldArray({ name })`
2. `fields / append / remove / insert / move`
3. key 管理：使用 `field.id`，不要用 index 当 key

练习任务：

* “教育经历/工作经历”可增删表单
* 每一项都要校验完整性
* 支持拖动排序（可选：先做 move）

**验收标准**

* 增删不会导致值错位
* 校验错误能准确对应到数组项

---

## 阶段 6：Schema 校验与类型推断（Zod + RHF + TS）（2–4 天）

**目标**：把校验从“散落在 register 规则”升级到“集中式 schema”，并让 TS 自动推断字段类型。

核心组合：

* `zod` 定义 schema
* `@hookform/resolvers/zod` 做 resolver
* `z.infer<typeof schema>` 推断表单类型

学习内容：

1. resolver 模式 vs register rules
2. schema 组织方式（按页面/按业务模块拆分）
3. 复杂 schema：嵌套对象、数组、可选字段、条件校验（refine/superRefine）
4. 服务端校验一致性：前后端共享 schema（可选）

练习任务：

* 做一个“创建商品/发布内容”的复杂表单：

  * 基本信息（string/number）
  * 标签数组（useFieldArray）
  * 上架开关（boolean）
  * 条件校验：若开启上架，必须填上架时间

**验收标准**

* 你的表单类型不需要手写 interface，直接从 schema 推断
* 条件校验与错误定位清晰

---

## 阶段 7：工程化与架构（持续优化）

**目标**：让表单代码在项目里长期可维护。

建议掌握：

1. `FormProvider` + `useFormContext`（深层组件树共享表单）
2. 表单组件分层：

   * Page（容器：数据请求、提交、路由）
   * Form（结构：字段分组）
   * Field（最小组件：输入+错误+label）
3. 与数据层协作：

   * React Query：提交 mutation + `isSubmitting` + 错误映射
   * 统一 toast / inline error 展示策略
4. 可访问性（a11y）：label、aria-invalid、错误提示关联

**验收标准**

* 你的表单组件拆分后，页面逻辑清楚，不会“一个文件 500 行”
* 错误处理策略统一且可复用

---

## 建议的学习节奏（可直接照做）

如果你每天能投入 1–2 小时，推荐：

* 第 1 周：阶段 1–2（核心闭环 + 校验）
* 第 2 周：阶段 3–4（状态/性能 + UI 组件集成）
* 第 3 周：阶段 5（动态数组）
* 第 4 周：阶段 6–7（Zod/TS + 工程化）

---

## 你学到什么程度，才算“能上项目”

你至少要能完成这 6 件事：

1. 原生 input 用 `register`，第三方组件用 `Controller`
2. 异步数据回填用 `reset`
3. 服务端错误能映射到字段（`setError`）
4. 动态数组用 `useFieldArray`，key 用 `field.id`
5. 使用 Zod resolver 做集中校验，并推断 TS 类型
6. 用 `FormProvider` 做表单拆分与复用

---

如果你愿意，我可以按你当前项目类型来定制路线：

* 你更偏“后台管理系统表单”（字段多、动态数组多）还是“C 端注册/下单”（交互强、校验强）？
  不需要你补很多信息，你只要回答一句“偏后台/偏 C 端/两者都要”，我就给你一个更贴近场景的练习项目清单与里程碑。
