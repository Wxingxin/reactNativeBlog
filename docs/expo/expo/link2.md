你这个需求在 Expo（用 **Expo Router**）里属于标准的 **Auth Gate（登录门卫）+ Action Guard（动作级鉴权）**：

* **未登录**：点“收藏/喜欢”→ 记录“我本来要干什么/从哪来”→ 跳转到登录页
* **已登录**：正常调用 API（like/favorite）并更新 UI
* **登录成功**：自动回到原页面，并（可选）自动执行刚才那次收藏动作

下面给你一套**工程上最常用、可复制的实现**（Expo Router）。

---

# 1) 路由结构建议（Expo Router）

```
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    detail/[id].tsx
  (auth)/
    login.tsx
```

* `(tabs)`：主应用
* `(auth)`：登录/注册

---

# 2) 登录状态放哪里？（AuthProvider + SecureStore）

建议用 `expo-secure-store` 存 token（比 AsyncStorage 更安全）。

安装：

```bash
expo install expo-secure-store
```

创建 `src/auth/AuthContext.tsx`：

```tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

type AuthState = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const TOKEN_KEY = "access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync(TOKEN_KEY);
      setToken(t ?? null);
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthState>(() => ({
    token,
    isLoading,
    signIn: async (newToken) => {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
    },
  }), [token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

---

# 3) 在根布局挂 AuthProvider

`app/_layout.tsx`：

```tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
```

---

# 4) 动作级鉴权：封装 requireAuth（点击收藏时用）

关键点：

* 当前页面路径：`usePathname()`
* 当前 query 参数：`useLocalSearchParams()`
* 未登录 → 跳转 `/ (auth)/login`，并带上 `redirect`，登录后回跳

创建 `src/auth/requireAuth.ts`：

```tsx
import { Href, router } from "expo-router";
import { useAuth } from "./AuthContext";
import { useLocalSearchParams, usePathname } from "expo-router";

export function useRequireAuth() {
  const { token } = useAuth();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const redirectToLogin = () => {
    // 记录“我从哪来”
    const redirect = JSON.stringify({ pathname, params });
    router.push({ pathname: "/(auth)/login" as Href, params: { redirect } });
  };

  const ensureAuthed = () => {
    if (!token) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  return { ensureAuthed };
}
```

---

# 5) 在“收藏/喜欢”按钮里用（核心）

例如详情页 `app/(tabs)/detail/[id].tsx`：

```tsx
import React, { useState } from "react";
import { Pressable, Text } from "react-native";
import { useRequireAuth } from "../../../src/auth/requireAuth";
import { useAuth } from "../../../src/auth/AuthContext";

export default function Detail() {
  const { ensureAuthed } = useRequireAuth();
  const { token } = useAuth();

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const onToggleLike = async () => {
    if (!ensureAuthed()) return; // 未登录：自动跳登录

    try {
      setLoading(true);

      // 1) 乐观更新（可选）
      setLiked((v) => !v);

      // 2) 调接口（示意）
      await fetch("https://api.example.com/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ /* itemId */ }),
      });

    } catch (e) {
      // 失败回滚（可选）
      setLiked((v) => !v);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={onToggleLike} disabled={loading}>
      <Text>{liked ? "❤️ 已喜欢" : "🤍 喜欢"}</Text>
    </Pressable>
  );
}
```

到这里，你的需求已经满足：
✅ 未登录：点喜欢 → 自动去登录
✅ 已登录：正常调用接口

---

# 6) 登录页：登录成功后回跳到原页面

`app/(auth)/login.tsx`：

```tsx
import React from "react";
import { Pressable, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const onLogin = async () => {
    // 这里换成你的真实登录接口
    const token = "mock_token";
    await signIn(token);

    if (redirect) {
      const parsed = JSON.parse(redirect);
      router.replace(parsed); // 回到原页面
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <Pressable onPress={onLogin}>
      <Text>点击登录</Text>
    </Pressable>
  );
}
```

---

# 7) 可选升级：登录后“自动执行刚才那次收藏动作”

如果你希望登录回来后**自动把那次 Like 执行掉**，需要把“意图”也带到 login：

* 未登录点击 like 时，把 `intent=like`、`itemId=xxx` 一并塞进 login params
* 登录成功后回跳并触发一次执行

示例（在 requireAuth 里增强）：

```ts
router.push({
  pathname: "/(auth)/login",
  params: { redirect, intent: "like", itemId: "123" }
});
```

然后在 login 成功后把 intent 带回去（或写到全局 store）。
这块实现方式很多，我建议你先把“回跳”跑通，再加 intent 自动重放。

---

# 你按这个做就能“像大厂一样”稳定运行

**核心原则：**

* **动作级鉴权**（喜欢/收藏这种不一定要整页保护）
* **redirect 回跳**（用户体验关键）
* token 持久化（SecureStore）

如果你告诉我你现在的路由结构是不是 `(tabs)`，以及你用的登录方式（账号密码 / 手机验证码 / 第三方 OAuth），我可以把上面的代码改成**完全贴合你项目的版本**（含：退出登录清 token、接口封装、全局拦截 401 自动跳登录）。
