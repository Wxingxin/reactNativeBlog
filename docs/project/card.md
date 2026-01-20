下面给你一套在 React Native + Expo Router 里「用表单创建信息卡片列表」→「点击卡片进入详情页路由」的可直接落地示例，并配套把核心知识点讲清楚。整体采用“内存状态（useState）+ 动态路由（[id]）”，不引入数据库，便于你先把路由与数据流跑通；后面再替换成 SQLite / AsyncStorage / 后端接口都很自然。

---

## 目录结构（Expo Router 推荐）

把下面文件放到 `app/` 目录下（Expo Router 以文件系统即路由）：

```
app/
  _layout.tsx
  index.tsx
  detail/
    [id].tsx
```

---

## 1) app/_layout.tsx（导航容器：Stack）

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="index" options={{ title: "卡片列表" }} />
      <Stack.Screen name="detail/[id]" options={{ title: "详情" }} />
    </Stack>
  );
}
```

**你需要知道：**

* `Stack` 来自 `expo-router`，它会自动把 `app` 下的页面变成可导航的栈。
* `name="detail/[id]"` 对应文件路径 `app/detail/[id].tsx`。

---

## 2) app/index.tsx（表单创建卡片 + 列表 + 点击跳转）

```tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

type Card = {
  id: string; // 用作动态路由参数
  title: string;
  content: string;
  createdAt: number;
};

export default function IndexPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [cards, setCards] = useState<Card[]>([]);

  const canSubmit = useMemo(() => {
    return title.trim().length >= 2 && content.trim().length >= 5;
  }, [title, content]);

  const handleCreate = () => {
    if (!canSubmit) {
      Alert.alert("提示", "标题至少 2 个字，内容至少 5 个字。");
      return;
    }

    const newCard: Card = {
      id: String(Date.now()), // 简单 id，项目中可换 uuid
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
    };

    setCards((prev) => [newCard, ...prev]);
    setTitle("");
    setContent("");
  };

  const handleOpenDetail = (id: string) => {
    // 进入动态路由：app/detail/[id].tsx
    router.push({
      pathname: "/detail/[id]",
      params: { id },
    });
  };

  return (
    <View style={styles.page}>
      {/* 表单区 */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>创建信息卡片</Text>

        <Text style={styles.label}>标题</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="例如：今日计划"
          style={styles.input}
          returnKeyType="next"
        />

        <Text style={styles.label}>内容</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="例如：学习 Expo Router 的动态路由…"
          style={[styles.input, styles.textarea]}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => [
            styles.btn,
            !canSubmit && styles.btnDisabled,
            pressed && canSubmit && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>创建卡片</Text>
        </Pressable>
      </View>

      {/* 列表区 */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>暂无卡片，先在上面创建一条。</Text>
        }
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => handleOpenDetail(item.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardContent} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.cardMeta}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" },

  formCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  formTitle: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 12, color: "#374151" },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: { minHeight: 90 },

  btn: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  btnDisabled: { backgroundColor: "#9ca3af" },
  btnPressed: { opacity: 0.9 },
  btnText: { color: "#fff", fontWeight: "700" },

  listContent: { paddingVertical: 10, gap: 10 },
  emptyText: { color: "#6b7280", paddingTop: 10 },

  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cardPressed: { opacity: 0.9 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardContent: { color: "#374151" },
  cardMeta: { fontSize: 12, color: "#6b7280" },
});
```

---

## 3) app/detail/[id].tsx（详情页：读取路由参数 + 根据 id 找数据）

仅靠路由参数 `id` 还不足以直接拿到卡片内容，因为 index 页的 `cards` 是本地 state。你有两种常见做法：

* **做法 A（新手最稳）**：把卡片列表放到“全局状态”（Context/Zustand/Redux），详情页按 `id` 查询。
* **做法 B（简单但不优雅）**：push 时把 title/content 一起作为 params 传过去（适合小 demo，但 params 过大不推荐）。

这里我给你 **做法 A：Context 全局状态** 的完整实现（这是最接近真实项目的结构）。

### 3.1 新增一个全局 Store：`app/_layout.tsx` 里包一层 Provider

把 `_layout.tsx` 改成下面这样（在同文件里写 Provider，便于你复制；真实项目可拆到 `src/`）：

```tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { Stack } from "expo-router";

type Card = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

type CardStore = {
  cards: Card[];
  addCard: (c: Omit<Card, "id" | "createdAt">) => void;
  getById: (id: string) => Card | undefined;
};

const CardContext = createContext<CardStore | null>(null);

export function useCardStore() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCardStore must be used within CardProvider");
  return ctx;
}

function CardProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);

  const store = useMemo<CardStore>(() => {
    return {
      cards,
      addCard: (c) => {
        const newCard: Card = {
          id: String(Date.now()),
          title: c.title.trim(),
          content: c.content.trim(),
          createdAt: Date.now(),
        };
        setCards((prev) => [newCard, ...prev]);
      },
      getById: (id) => cards.find((x) => x.id === id),
    };
  }, [cards]);

  return <CardContext.Provider value={store}>{children}</CardContext.Provider>;
}

export default function RootLayout() {
  return (
    <CardProvider>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "卡片列表" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "详情" }} />
      </Stack>
    </CardProvider>
  );
}
```

### 3.2 修改 `app/index.tsx`：从 store 添加卡片、读取 cards

把 `index.tsx` 里的 `cards/setCards` 替换为 store：

```tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useCardStore } from "./_layout"; // 注意相对路径：index 和 _layout 同级

export default function IndexPage() {
  const { cards, addCard } = useCardStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim().length >= 2 && content.trim().length >= 5;
  }, [title, content]);

  const handleCreate = () => {
    if (!canSubmit) {
      Alert.alert("提示", "标题至少 2 个字，内容至少 5 个字。");
      return;
    }
    addCard({ title, content });
    setTitle("");
    setContent("");
  };

  const handleOpenDetail = (id: string) => {
    router.push({ pathname: "/detail/[id]", params: { id } });
  };

  return (
    <View style={styles.page}>
      {/* 其余 UI 样式保持不变，把 setCards 那部分去掉即可 */}
      {/* ...为节省篇幅，你保留上一段的样式和 FlatList 渲染即可 */}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#fff" },
});
```

你把上一个 index.tsx 的 UI 部分直接复制回来即可（只是数据来源换了）。

### 3.3 最终 `app/detail/[id].tsx`：读取 id → store 查数据

```tsx
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCardStore } from "../_layout"; // detail 在子目录，要回到上一级

export default function DetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useCardStore();

  const card = useMemo(() => {
    if (!id) return undefined;
    return getById(String(id));
  }, [id, getById]);

  if (!id) {
    return (
      <View style={styles.page}>
        <Text style={styles.err}>缺少路由参数 id</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.page}>
        <Text style={styles.err}>未找到该卡片（id: {String(id)}）</Text>
        <Text style={styles.tip}>
          常见原因：你刷新了 App 或热重载后内存状态丢失。真实项目应使用持久化存储。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.meta}>
        {new Date(card.createdAt).toLocaleString()}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.content}>{card.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#fff", gap: 10 },
  title: { fontSize: 20, fontWeight: "800" },
  meta: { fontSize: 12, color: "#6b7280" },
  divider: { height: 1, backgroundColor: "#e5e7eb" },
  content: { fontSize: 15, lineHeight: 22, color: "#111827" },
  err: { fontSize: 14, color: "#b91c1c", fontWeight: "700" },
  tip: { fontSize: 12, color: "#6b7280" },
});
```

---

## 关键知识点（你做这种功能必须掌握的）

### 1) Expo Router 的“文件即路由”

* `app/index.tsx` → `/`
* `app/detail/[id].tsx` → `/detail/:id`（动态路由）
* 目录名就是路径段，文件名就是最终路由段。

### 2) 动态路由参数获取：`useLocalSearchParams`

* 在 `[id].tsx` 中通过 `useLocalSearchParams()` 读到 `id`。
* `id` 类型可能是 `string | string[] | undefined`，所以生产代码里要 `String(id)` 或做类型收敛。

### 3) 跳转方式：`router.push` / `Link`

* `router.push({ pathname: "/detail/[id]", params: { id } })` 推荐写法，清晰且类型友好。
* `router.replace`：替换当前页面（用于登录后跳首页）。
* `router.back`：返回。

### 4) “列表页 state” 与 “详情页数据来源”的问题

* 列表页用 `useState` 存的数据，详情页默认拿不到。
* 真实项目通常要：

  * 全局状态（Context / Zustand / Redux）用于跨页共享；
  * 持久化（AsyncStorage / SQLite / WatermelonDB）用于刷新不丢；
  * 或者后端 API：详情页按 `id` 拉取。

### 5) 参数传递的边界

* params 适合传 `id`、筛选条件、轻量状态。
* 不建议把大段内容塞到 params（长度、编码、可维护性都差）。
* “传 id + 详情页再查询”是更通用的架构。

### 6) 列表点击的性能与稳定性

* 列表用 `FlatList`，必须有稳定 `keyExtractor`（这里用 `id`）。
* 卡片点击建议用 `Pressable`，可获取 `pressed` 状态做反馈。

---

## 常见坑（你很可能会遇到）

1. **详情页找不到 card**

* 原因：你用了内存状态（Context/useState），热重载/重启后丢失。
* 解决：加持久化（AsyncStorage 或 SQLite）。

2. **[id].tsx 参数类型不稳定**

* `useLocalSearchParams` 返回的可能是数组或 undefined，别直接当 string 用。

3. **路径写错**

* `pathname: "/detail/[id]"` 不要写成 `"/detail/id"`。
* 文件是 `detail/[id].tsx`，那么 `name` 就是 `detail/[id]`。

---

如果你希望下一步更贴近真实项目，我可以在这套代码上继续加两种增强（你不需要再改整体结构）：

1. 用 **AsyncStorage** 把 cards 落盘，重启不丢；
2. 用 **React Hook Form + Zod** 做更标准的表单校验（你之前也在学这一套）。
