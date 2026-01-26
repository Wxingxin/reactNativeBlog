下面给你一份 **React Native 中 `TouchableOpacity` 的「属性大全 + 使用大全」**，按**源码参数 → 行为 → 实战场景**来讲，方便你系统理解和在项目中正确取舍。

---

## 一、`TouchableOpacity` 是什么（定位）

`TouchableOpacity` 是 **RN 早期的基础触摸组件**，通过 **改变透明度（opacity）** 来反馈按压状态。

**一句话定位：**

> 一个“点了会变透明”的可点击容器。

---

## 二、`TouchableOpacity` 属性大全（完整 & 常用）

> `TouchableOpacity` 继承自 `TouchableWithoutFeedback`，同时本身是一个 View 容器

### 1️⃣ 必须理解的交互回调（核心）

```tsx
<TouchableOpacity
  onPress={() => {}}
  onLongPress={() => {}}
  onPressIn={() => {}}
  onPressOut={() => {}}
/>
```

| 属性            | 说明            | 使用场景     |
| ------------- | ------------- | -------- |
| `onPress`     | **点击触发（最常用）** | 按钮、跳转    |
| `onLongPress` | 长按触发          | 删除、更多操作  |
| `onPressIn`   | 手指按下瞬间        | 做动画、状态切换 |
| `onPressOut`  | 手指松开瞬间        | 恢复状态     |

---

### 2️⃣ 透明度相关（TouchableOpacity 特有）

```tsx
<TouchableOpacity activeOpacity={0.6} />
```

| 属性              | 类型     | 默认    | 说明            |
| --------------- | ------ | ----- | ------------- |
| `activeOpacity` | number | `0.2` | 按下时的不透明度（0~1） |

📌 **经验值：**

* `0.6 ~ 0.7`：常规按钮
* `0.3 ~ 0.4`：强调点击反馈
* `1`：几乎没有反馈（不推荐）

---

### 3️⃣ 禁用态

```tsx
<TouchableOpacity disabled />
```

| 属性         | 类型      | 说明     |
| ---------- | ------- | ------ |
| `disabled` | boolean | 禁用触摸事件 |

⚠️ 注意：

* **不会自动变灰**
* 通常要你自己配合 `style` 处理

```tsx
<TouchableOpacity
  disabled={disabled}
  style={{ opacity: disabled ? 0.4 : 1 }}
/>
```

---

### 4️⃣ 点击区域控制（移动端非常重要）

```tsx
<TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} />
```

| 属性                     | 类型     | 说明          |
| ---------------------- | ------ | ----------- |
| `hitSlop`              | Insets | 扩大可点击区域     |
| `pressRetentionOffset` | Insets | 手指滑动仍算点击的范围 |

📌 **典型用途：**

* 小图标（返回键、关闭按钮）
* 保证“好点中”

---

### 5️⃣ 延迟相关（少用，但要知道）

```tsx
<TouchableOpacity delayPressIn={100} delayLongPress={500} />
```

| 属性               | 说明    |
| ---------------- | ----- |
| `delayPressIn`   | 按下延迟  |
| `delayPressOut`  | 松开延迟  |
| `delayLongPress` | 多久算长按 |

---

### 6️⃣ 无障碍（Accessibility）

```tsx
<TouchableOpacity
  accessible
  accessibilityLabel="提交按钮"
  accessibilityRole="button"
/>
```

| 属性                   | 说明              |
| -------------------- | --------------- |
| `accessible`         | 是否可被读屏          |
| `accessibilityLabel` | 描述文本            |
| `accessibilityRole`  | 角色（button/link） |

---

### 7️⃣ 继承自 View 的属性（你常用的）

```tsx
<TouchableOpacity style={styles.box}>
```

可用：

* `style`
* `testID`
* `onLayout`
* `pointerEvents`
* `children`

---

## 三、使用大全（从简单到真实项目）

---

### ✅ 1. 最基础用法（按钮）

```tsx
<TouchableOpacity onPress={handleSubmit}>
  <Text>提交</Text>
</TouchableOpacity>
```

---

### ✅ 2. 自定义按钮样式（最常见）

```tsx
<TouchableOpacity
  activeOpacity={0.7}
  style={styles.button}
  onPress={onLogin}
>
  <Text style={styles.text}>登录</Text>
</TouchableOpacity>
```

```ts
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1677ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
```

---

### ✅ 3. 图标按钮（扩大点击区域）

```tsx
<TouchableOpacity
  onPress={onBack}
  hitSlop={10}
>
  <Icon name="arrow-left" size={20} />
</TouchableOpacity>
```

---

### ✅ 4. 禁用态按钮（真实项目写法）

```tsx
<TouchableOpacity
  disabled={loading}
  activeOpacity={0.7}
  style={[
    styles.button,
    loading && { opacity: 0.5 },
  ]}
>
  <Text>{loading ? '提交中...' : '提交'}</Text>
</TouchableOpacity>
```

---

### ✅ 5. 列表项点击（非常常见）

```tsx
<TouchableOpacity onPress={() => goDetail(item.id)}>
  <View style={styles.item}>
    <Text>{item.title}</Text>
  </View>
</TouchableOpacity>
```

---

### ✅ 6. 替代 `View + onPress`（错误 → 正确）

❌ 错误：

```tsx
<View onPress={...} />
```

✅ 正确：

```tsx
<TouchableOpacity onPress={...}>
  <View />
</TouchableOpacity>
```

---

## 四、TouchableOpacity 的缺点（你必须知道）

### ⚠️ 1. 已不推荐作为新项目首选

React Native 官方 **推荐优先使用：**

| 组件                   | 推荐指数  |
| -------------------- | ----- |
| `Pressable`          | ⭐⭐⭐⭐⭐ |
| `TouchableOpacity`   | ⭐⭐⭐   |
| `TouchableHighlight` | ⭐⭐    |

---

### ⚠️ 2. 只能控制 opacity（不够灵活）

* 无法精细区分 `pressed / hovered / focused`
* 动画控制弱

---

## 五、什么时候用 / 什么时候不用

### ✅ 适合使用

* 老项目维护
* 快速做一个“能点的”
* 简单按钮、列表项

### ❌ 不推荐使用

* 新项目
* 复杂交互
* 需要状态感知（pressed / disabled / focused）

---

## 六、现代替代方案（你应该掌握）

### 👉 `Pressable`（官方推荐）

```tsx
<Pressable
  onPress={onPress}
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.6 },
  ]}
>
  <Text>按钮</Text>
</Pressable>
```

📌 **一句话总结：**

> `Pressable = TouchableOpacity + 更强状态控制`

---

## 七、一句话总总结

* `TouchableOpacity` = **点击反馈靠透明度**
* 核心属性：`onPress` + `activeOpacity`
* 老项目 OK，新项目 **优先 Pressable**
* 本质是一个 **可点击的 View 容器**

---

如果你愿意，下一步我可以直接帮你：

* 对比 `TouchableOpacity vs Pressable vs Button`
* 手写一个 **通用 Button 组件（RN 项目级）**
* 给你一张 **RN 触摸组件选型决策表**

你选一个继续。
