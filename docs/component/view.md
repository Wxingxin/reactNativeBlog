下面给你一份**React Native 中 `View` 组件「非 style 类属性」的完整整理**，**按功能分类**，并且**解释作用 + 使用方式 + 常见场景**。
（不包含 `style`、`className`、`nativewind` 等样式相关内容）

> 这是**偏底层但非常重要的一份表**，很多 RN 问题其实都出在这些属性上。

---

# 一、交互 / 触摸相关（View 本身不负责点击，但能“参与”）

> ⚠️ View **不是** Pressable，但可以影响触摸行为

---

## 1️⃣ `pointerEvents`

**控制 View 是否响应触摸事件**

```tsx
<View pointerEvents="none" />
```

| 值          | 作用               |
| ---------- | ---------------- |
| `auto`     | 默认，View 和子元素都可响应 |
| `none`     | View 和子元素都不响应    |
| `box-none` | View 不响应，子元素响应   |
| `box-only` | View 响应，子元素不响应   |

📌 **常见场景**

* 悬浮遮罩不阻挡点击
* loading 蒙层
* 复杂嵌套手势冲突处理

---

## 2️⃣ `hitSlop`

**扩大可点击区域（即使 View 本身不处理 onPress）**

```tsx
<View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} />
```

📌 常用于：

* 小图标
* 边缘按钮
* 手势区域优化

---

## 3️⃣ `onTouchStart / onTouchMove / onTouchEnd`

```tsx
<View onTouchStart={() => {}} />
```

📌 **很少直接用**

* 一般交给 `Pressable` / `Gesture`
* 用于调试 / 特殊底层需求

---

# 二、事件穿透 & 布局反馈

---

## 4️⃣ `onLayout`（🔥 非常重要）

**获取 View 实际布局尺寸和位置**

```tsx
<View
  onLayout={(e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
  }}
/>
```

📌 **高频场景**

* 自适应布局
* 动态计算高度
* 动画起点
* tooltip / popover 定位

---

# 三、可访问性（Accessibility，无障碍）

> 很多人忽略，但**正式项目必备**

---

## 5️⃣ `accessible`

```tsx
<View accessible />
```

* 是否作为一个**整体**被辅助功能识别
* 默认 `false`

---

## 6️⃣ `accessibilityLabel`

```tsx
<View accessibilityLabel="用户头像" />
```

📌 给屏幕阅读器用

---

## 7️⃣ `accessibilityHint`

```tsx
<View accessibilityHint="双击进入详情页" />
```

---

## 8️⃣ `accessibilityRole`

```tsx
<View accessibilityRole="button" />
```

常见值：

* `button`
* `header`
* `image`
* `link`
* `text`

📌 **在 View + onPress 场景很重要**

---

## 9️⃣ `accessibilityState`

```tsx
<View accessibilityState={{ disabled: true, selected: true }} />
```

---

# 四、响应系统行为

---

## 🔟 `onStartShouldSetResponder`

**是否抢占触摸事件**

```tsx
<View onStartShouldSetResponder={() => true} />
```

📌 场景：

* 手势冲突
* 父子 View 竞争触摸

---

## 11️⃣ `onResponderGrant / Release / Terminate`

```tsx
<View
  onResponderGrant={() => {}}
  onResponderRelease={() => {}}
/>
```

📌 **底层事件系统**

* 一般不用
* 手势库内部使用

---

# 五、渲染 & 更新控制

---

## 12️⃣ `collapsable`（Android）

```tsx
<View collapsable={false} />
```

* 是否允许被优化合并
* 某些动画 / 测量场景必须关掉

📌 **动画 / ref 测量异常时排查**

---

## 13️⃣ `shouldRasterizeIOS`（iOS）

```tsx
<View shouldRasterizeIOS />
```

* 栅格化 View
* 提高复杂 View 性能
* ⚠️ 会增加内存

---

## 14️⃣ `renderToHardwareTextureAndroid`

```tsx
<View renderToHardwareTextureAndroid />
```

* Android GPU 加速
* 常用于动画

---

# 六、测试相关（非常实用）

---

## 15️⃣ `testID`（🔥）

```tsx
<View testID="user-card" />
```

📌 用于：

* E2E 测试（Detox）
* 自动化测试
* Debug 定位

---

## 16️⃣ `nativeID`

```tsx
<View nativeID="header" />
```

📌 原生层级引用（很少用）

---

# 七、平台 & 系统相关

---

## 17️⃣ `removeClippedSubviews`

```tsx
<View removeClippedSubviews />
```

* 超出父容器的子元素不渲染
* 提升列表性能

📌 常见于：

* 长列表
* ScrollView / FlatList 内部

---

## 18️⃣ `focusable`（TV / Android）

```tsx
<View focusable />
```

📌 TV / 键盘 / 遥控器导航

---

# 八、View 的“继承属性”（来自基础组件）

> View 继承自 `React.Component` + `NativeMethods`

---

## 19️⃣ `ref`

```tsx
const ref = useRef<View>(null);
```

📌 配合：

* measure
* 动画
* imperative handle

---

## 20️⃣ `children`

```tsx
<View>
  <Text>内容</Text>
</View>
```

---

# 九、你在项目中 **真正常用的 Top 10**

按真实项目频率排序：

1. `onLayout`
2. `pointerEvents`
3. `testID`
4. `accessible`
5. `accessibilityLabel`
6. `hitSlop`
7. `collapsable`
8. `removeClippedSubviews`
9. `renderToHardwareTextureAndroid`
10. `ref`

---

# 十、View 能做什么 & 不能做什么（关键认知）

✅ View 适合：

* 布局容器
* 承载结构
* 辅助交互

❌ View 不适合：

* 点击（用 Pressable）
* 输入（用 TextInput）
* 滚动（用 ScrollView）

---

如果你愿意，下一步我可以帮你：

* 🔥 **对比 View / Pressable / Touchable**
* 🔥 **View 在动画（Reanimated）中的高级用法**
* 🔥 **View + 手势冲突实战案例**
* 🔥 **RN 所有基础组件“非 style 属性”全集**

你选一个，我按「项目级标准」继续给你拆。
