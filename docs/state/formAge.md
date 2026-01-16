下面是**纯 JavaScript（不含 TS 类型）**版本，结构与上次一致：`zod schema` + 可复用 `FormInput` + 三个页面（登录/注册/修改密码），并保留关键注释。你可以直接复制到 RN 项目中使用。

---

## 1) 安装依赖

```bash
npm i react-hook-form zod @hookform/resolvers
```

---

## 2) Zod 校验（`src/validation/authSchemas.js`）

```js
// src/validation/authSchemas.js
import { z } from "zod";

/**
 * 登录：email + password
 */
export const loginSchema = z.object({
  email: z.string().trim().min(1, "请输入邮箱").email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位").max(64, "密码最多 64 位"),
});

/**
 * 注册：name + email + password + confirmPassword
 * 用 refine 做“确认密码一致”
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "昵称至少 2 个字符")
      .max(32, "昵称最多 32 个字符"),
    email: z.string().trim().min(1, "请输入邮箱").email("邮箱格式不正确"),
    password: z.string().min(6, "密码至少 6 位").max(64, "密码最多 64 位"),
    confirmPassword: z
      .string()
      .min(6, "确认密码至少 6 位")
      .max(64, "确认密码最多 64 位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"], // 把错误落到 confirmPassword 字段上，便于展示
  });

/**
 * 修改密码：oldPassword + newPassword + confirmNewPassword
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "旧密码至少 6 位")
      .max(64, "旧密码最多 64 位"),
    newPassword: z
      .string()
      .min(8, "新密码至少 8 位")
      .max(64, "新密码最多 64 位")
      // 示例：简单强度规则（按需调整）
      .regex(/[A-Z]/, "新密码需包含至少 1 个大写字母")
      .regex(/[0-9]/, "新密码需包含至少 1 个数字"),
    confirmNewPassword: z
      .string()
      .min(8, "确认新密码至少 8 位")
      .max(64, "确认新密码最多 64 位"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmNewPassword"],
  });
```

---

## 3) 可复用输入组件（`src/components/FormInput.js`）

```jsx
// src/components/FormInput.js
import React from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

/**
 * RN 里 TextInput 需要 Controller 做桥接
 * props:
 * - control: useForm() 返回的 control
 * - name: 字段名（必须和 schema 的 key 一致）
 */
export function FormInput({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>

          <TextInput
            value={value ?? ""}
            onChangeText={onChange} // 输入变化 -> 同步到 RHF
            onBlur={onBlur} // 标记 touched
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            style={{
              borderWidth: 1,
              borderColor: error ? "#d00" : "#ccc",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          />

          {/* 展示字段错误 */}
          {error?.message ? (
            <Text style={{ marginTop: 6, color: "#d00" }}>{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
```

---

## 4) 登录页面（`src/screens/LoginScreen.js`）

```jsx
// src/screens/LoginScreen.js
import React from "react";
import { Button, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "../components/FormInput";
import { loginSchema } from "../validation/authSchemas";

export function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange", // 让 isValid 可以随输入更新（也可用 onBlur/onSubmit）
  });

  const onSubmit = async (values) => {
    try {
      // TODO: 调你的登录 API
      // await api.login(values)

      // 示例：服务端返回“邮箱未注册”
      const fakeServerSaysEmailNotFound = false;
      if (fakeServerSaysEmailNotFound) {
        setError("email", { type: "server", message: "该邮箱未注册" });
        return;
      }

      // 登录成功：跳转、存 token、写入全局状态等
    } catch (e) {
      // 示例：通用错误也可以落到字段上（或用 toast）
      setError("password", { type: "server", message: "登录失败，请稍后重试" });
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        登录
      </Text>

      <FormInput
        control={control}
        name="email"
        label="邮箱"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="password"
        label="密码"
        placeholder="请输入密码"
        secureTextEntry
      />

      <Button
        title={isSubmitting ? "提交中..." : "登录"}
        onPress={handleSubmit(onSubmit)} // 先校验，通过后再执行 onSubmit
        disabled={isSubmitting || !isValid} // 防重复提交 + 无效表单不可点
      />
    </View>
  );
}
```

---

## 5) 注册页面（`src/screens/RegisterScreen.js`）

```jsx
// src/screens/RegisterScreen.js
import React from "react";
import { Button, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "../components/FormInput";
import { registerSchema } from "../validation/authSchemas";

export function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    try {
      // 一般不需要把 confirmPassword 发给后端
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      // TODO: await api.register(payload)

      // 示例：邮箱已被占用
      const fakeServerSaysEmailTaken = false;
      if (fakeServerSaysEmailTaken) {
        setError("email", { type: "server", message: "该邮箱已被占用" });
        return;
      }
    } catch (e) {
      setError("email", { type: "server", message: "注册失败，请稍后重试" });
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        注册
      </Text>

      <FormInput
        control={control}
        name="name"
        label="昵称"
        placeholder="请输入昵称"
      />

      <FormInput
        control={control}
        name="email"
        label="邮箱"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="password"
        label="密码"
        placeholder="请输入密码"
        secureTextEntry
      />

      <FormInput
        control={control}
        name="confirmPassword"
        label="确认密码"
        placeholder="请再次输入密码"
        secureTextEntry
      />

      <Button
        title={isSubmitting ? "提交中..." : "注册"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
      />
    </View>
  );
}
```

---

## 6) 修改密码页面（`src/screens/ChangePasswordScreen.js`）

```jsx
// src/screens/ChangePasswordScreen.js
import React from "react";
import { Button, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "../components/FormInput";
import { changePasswordSchema } from "../validation/authSchemas";

export function ChangePasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      // TODO: await api.changePassword(payload)

      // 示例：旧密码错误（后端返回）
      const fakeServerSaysOldPasswordWrong = false;
      if (fakeServerSaysOldPasswordWrong) {
        setError("oldPassword", { type: "server", message: "旧密码不正确" });
        return;
      }

      // 成功后清空表单，避免敏感信息残留
      reset();
    } catch (e) {
      setError("newPassword", {
        type: "server",
        message: "修改失败，请稍后重试",
      });
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        修改密码
      </Text>

      <FormInput
        control={control}
        name="oldPassword"
        label="旧密码"
        placeholder="请输入旧密码"
        secureTextEntry
      />

      <FormInput
        control={control}
        name="newPassword"
        label="新密码"
        placeholder="至少 8 位，含大写字母和数字"
        secureTextEntry
      />

      <FormInput
        control={control}
        name="confirmNewPassword"
        label="确认新密码"
        placeholder="请再次输入新密码"
        secureTextEntry
      />

      <Button
        title={isSubmitting ? "提交中..." : "确认修改"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
      />
    </View>
  );
}
```

---

# 你要学哪些 React Hook Form / Zod 知识点（对应本实现）

## React Hook Form

- `useForm({ defaultValues, mode, resolver })`
- `handleSubmit(onValid)`：**先校验再提交**
- `Controller`：RN TextInput 的必备桥接方式（`value / onChangeText / onBlur`）
- `formState`：`errors / isValid / isSubmitting`
- `setError`：把**服务端错误**落到指定字段
- `reset`：提交成功后清空敏感输入

## Zod

- `z.object({ ... })`、`z.string()`、`min/max/email/regex/trim`
- `refine`：做跨字段校验（确认密码一致）
- 错误定位：`path: ["confirmPassword"]`（让错误显示在对应输入框下）

---

如果你下一步要更接近真实项目，我建议你把 `api.login/register/changePassword` 也抽成一个 `src/api/auth.js`（包含 `fetch`、错误结构解析、自动映射到 `setError`）。你要我按你现在的后端返回格式（比如 `{message, errors: {field: msg}}`）给你写一套吗？
