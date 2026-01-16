下面我将**系统性、结构化**地给你一份 **React Native 组件大全（偏官方 + 实战视角）**，并结合你目前的技术背景（前端 / React / RN 学习中），重点说明**用途、常见属性、使用场景**，避免只给“名单”。

---

# 一、基础视图组件（最核心，必须掌握）

## 1️⃣ View

> RN 中最基础的容器组件，等价于 Web 的 `div`

**用途**

- 布局
- 包裹其他组件
- Flex 布局的核心载体

**常用属性**

- `style`
- `onLayout`
- `pointerEvents`

```tsx
<View style={{ flex: 1, padding: 16 }} />
```

---

## 2️⃣ Text

> 用于显示文本（⚠️ RN 中所有文字必须放在 Text 中）

**特点**

- 支持嵌套
- 自带文本样式

**常用属性**

- `numberOfLines`
- `ellipsizeMode`
- `selectable`
- `onPress`

```tsx
<Text numberOfLines={1}>Hello React Native</Text>
```

---

## 3️⃣ Image

> 显示图片（本地 / 网络）

**常用属性**

- `source`
- `resizeMode`
- `onLoad`
- `onError`

```tsx
<Image
  source={{ uri: "https://xxx.com/a.png" }}
  style={{ width: 100, height: 100 }}
/>
```

---

## 4️⃣ ImageBackground

> 带背景图的容器

```tsx
<ImageBackground source={...}>
  <Text>内容</Text>
</ImageBackground>
```

---

# 二、交互组件（用户操作相关）

## 5️⃣ Pressable（⭐ 推荐）

> 新一代点击组件，替代 Touchable 系列

**优点**

- 状态感知（pressed / hovered / focused）
- 官方推荐

```tsx
<Pressable onPress={() => {}}>
  {({ pressed }) => <Text style={{ opacity: pressed ? 0.5 : 1 }}>点击</Text>}
</Pressable>
```

---

## 6️⃣ Touchable 系列（旧，但仍常见）

| 组件                     | 说明             |
| ------------------------ | ---------------- |
| TouchableOpacity         | 改变透明度       |
| TouchableHighlight       | 高亮背景         |
| TouchableWithoutFeedback | 无视觉反馈       |
| TouchableNativeFeedback  | Android 原生波纹 |

---

## 7️⃣ Button

> 简单按钮（不建议用于复杂 UI）

**缺点**

- 样式不可控

```tsx
<Button title="提交" onPress={() => {}} />
```

---

# 三、表单 & 输入组件

## 8️⃣ TextInput

> 文本输入框

**重要属性**

- `value`
- `onChangeText`
- `placeholder`
- `secureTextEntry`
- `keyboardType`

```tsx
<TextInput value={text} onChangeText={setText} placeholder="请输入" />
```

---

## 9️⃣ Switch

> 开关组件

```tsx
<Switch value={enabled} onValueChange={setEnabled} />
```

---

# 四、列表 & 数据展示（非常重要）

## 🔟 ScrollView

> 可滚动容器（⚠️ 不适合长列表）

```tsx
<ScrollView>
  {items.map(...)}
</ScrollView>
```

---

## 1️⃣1️⃣ FlatList（⭐ 高频）

> 高性能列表组件

**优势**

- 虚拟化
- 适合大数据

```tsx
<FlatList
  data={data}
  renderItem={({ item }) => <Text>{item}</Text>}
  keyExtractor={(item) => item.id}
/>
```

---

## 1️⃣2️⃣ SectionList

> 分组列表（通讯录、分类列表）

```tsx
<SectionList sections={[{ title: "A", data: ["Apple"] }]} />
```

---

# 五、布局 & 安全区域

## 1️⃣3️⃣ SafeAreaView

> 适配刘海屏 / 状态栏

```tsx
<SafeAreaView style={{ flex: 1 }} />
```

---

## 1️⃣4️⃣ KeyboardAvoidingView

> 键盘弹出不遮挡输入框

```tsx
<KeyboardAvoidingView behavior="padding" />
```

---

# 六、反馈 & 状态提示

## 1️⃣5️⃣ ActivityIndicator

> 加载中

```tsx
<ActivityIndicator size="large" />
```

---

## 1️⃣6️⃣ RefreshControl

> 下拉刷新（配合 ScrollView / FlatList）

```tsx
<FlatList
  refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} />}
/>
```

---

# 七、平台 & 系统能力

## 1️⃣7️⃣ Modal

> 模态弹窗

```tsx
<Modal visible={visible} transparent />
```

---

## 1️⃣8️⃣ StatusBar

> 控制状态栏样式

```tsx
<StatusBar barStyle="dark-content" />
```

---

## 1️⃣9️⃣ Platform

> 平台判断

```ts
Platform.OS === "ios";
```

---

## 2️⃣0️⃣ Dimensions

> 获取屏幕尺寸

```ts
Dimensions.get("window").width;
```

---

# 八、动画 & 手势（进阶）

## 2️⃣1️⃣ Animated

> 动画系统（偏底层）

```tsx
const opacity = useRef(new Animated.Value(0)).current;
```

---

## 2️⃣2️⃣ LayoutAnimation

> 布局变化动画（简单好用）

---

# 九、无障碍 & 其他

## 2️⃣3️⃣ Accessibility

- `accessible`
- `accessibilityLabel`

---

# 十、组件分类总结表（速查）

| 分类 | 组件                 |
| ---- | -------------------- |
| 基础 | View, Text, Image ,ImageBackground   |
| 交互 | Pressable, Button, TextInput, Switch    |
| 列表 | ScrollView, FlatList, Sectionlist |
| 布局 | SafeAreaView  , statusBar      |
| 状态 | ActivityIndicator    |
| 系统 | Modal, StatusBar ,RefreshControl    |


2. 热门第三方 UI 组件库 (2026 推荐)
如果需要更美观、现成的组件，建议使用以下流行的 UI 库： 
Tamagui: 2026 年极受推崇，主打高性能和多端通用（Web/Native），支持高度优化的样式系统。
gluestack-ui: 原 NativeBase 的继任者，提供无样式（Headless）组件，适配 Tailwind CSS (NativeWind)。
React Native Paper: 基于 Google Material Design 设计规范的组件库，非常成熟且稳定。
React Native Elements: 社区驱动的通用 UI 库，适合快速构建原型 (MVP)。
Ant Design Mobile RN: 阿里出品，适合企业级应用，提供丰富的表单和数据展示组件。 

导航： React Navigation (几乎是所有 RN 应用的标配)。
动画： Lottie for React Native（加载 Json 动画）、React Native Reanimated（底层高性能动画库）。
地图： React Native Maps。
图标： React Native Vector Icons (集成 FontAwesome, Ionicons 等)。
聊天界面： React Native Gifted Chat。
选择器： react-native-picker-select。 

# 十一、学习建议（结合你当前阶段）

你现在**非常适合这样学 RN 组件**：

1. **先精通**

   - View / Text / Pressable
   - FlatList / TextInput

2. **再做小项目**

   - 登录页
   - 列表页
   - 表单页

3. **再引入**

   - 第三方组件库（React Native Paper / NativeBase）
   - 手势（react-native-gesture-handler）

---

如果你愿意，下一步我可以帮你：

- 按 **“Web → RN 对照表”** 给你讲
- 给你 **RN 常用 UI 组件封装规范**
- 或 **直接带你写一个完整 RN 页面**

你可以直接说你想往哪一步走。
