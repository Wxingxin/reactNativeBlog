---
outline: false
---

下面把 React Native 里的 **定位与层级（position / top-bottom-left-right / inset / zIndex）** 讲成“项目中可直接套用的模板”。核心结论：**RN 绝大多数布局用 Flex，只有在需要“覆盖/悬浮/贴边/叠层”时才用 absolute + zIndex。**

---

# 1) position：relative / absolute

## 1.1 relative（默认）

* 元素仍在正常布局流里（参与 Flex 布局）
* `top/left` 等偏移会“视觉移动”，但原位置仍占位（不常用）

```tsx
<View style={{ padding: 16 }}>
  <View style={{ width: 120, height: 60, backgroundColor: "#eee", position: "relative", top: 10 }}>
    <Text>relative + top</Text>
  </View>
  <Text>下面的文本仍然会按原布局排（relative 元素仍占位）</Text>
</View>
```

项目里更常见：**不写 position，默认就是 relative**。

---

## 1.2 absolute（最常用）

* 元素脱离布局流，不再占位
* 以“最近的有定位上下文的父容器”为参考系进行定位

  * RN 中父容器默认 `position: "relative"`，所以一般不用特意写
* 典型场景：**角标、悬浮按钮、覆盖层、贴边元素**

```tsx
<View style={{ height: 120, backgroundColor: "#f5f5f5", borderRadius: 16, overflow: "hidden" }}>
  <Text style={{ padding: 16 }}>Card Content</Text>

  <View
    style={{
      position: "absolute",
      top: 12,
      right: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#eee",
    }}
  >
    <Text>NEW</Text>
  </View>
</View>
```

---

# 2) top / bottom / left / right：偏移

## 2.1 贴右下角（经典：FAB 悬浮按钮）

```tsx
<View style={{ flex: 1 }}>
  {/* 页面内容 */}
  <View style={{ flex: 1, padding: 16 }}>
    <Text>Page</Text>
  </View>

  {/* 悬浮按钮 */}
  <Pressable
    style={{
      position: "absolute",
      right: 16,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#eee",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 22 }}>+</Text>
  </Pressable>
</View>
```

---

## 2.2 顶部覆盖（经典：渐变遮罩/标题浮层）

```tsx
<View style={{ height: 220, borderRadius: 16, overflow: "hidden", backgroundColor: "#ddd" }}>
  {/* 背景图/内容 */}
  <Text style={{ padding: 16 }}>Banner</Text>

  {/* 顶部遮罩层 */}
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      paddingHorizontal: 16,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "700" }}>Title Overlay</Text>
  </View>
</View>
```

---

# 3) inset：同时设置四个方向（铺满/内缩）

> RN 支持 `inset`（以及 `insetHorizontal/insetVertical` 在部分版本也可用），但为兼容性考虑，很多团队仍习惯写 `top/left/right/bottom`。

## 3.1 绝对定位铺满父容器（Overlay）

```tsx
<View style={{ height: 160, borderRadius: 16, overflow: "hidden", backgroundColor: "#eee" }}>
  <Text style={{ padding: 16 }}>Content</Text>

  <View
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color: "#fff" }}>Loading...</Text>
  </View>
</View>
```

兼容写法（等价）：

```tsx
<View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />
```

## 3.2 内缩覆盖（比如内边距式遮罩）

```tsx
<View style={{ height: 160, borderRadius: 16, overflow: "hidden", backgroundColor: "#eee" }}>
  <Text style={{ padding: 16 }}>Content</Text>

  <View
    style={{
      position: "absolute",
      inset: 12,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.08)",
    }}
  />
</View>
```

---

# 4) zIndex：层级控制（需 absolute 才稳定）

## 4.1 基本规则

* `zIndex` 只影响**同一父容器下的兄弟节点**
* 在 RN 上层级更稳定的方式：**配合 `position: "absolute"`**
* Android 常见额外点：必要时配合 `elevation`（阴影/层级）

## 4.2 经典：图片上叠加角标 + 遮罩 + 文本

```tsx
<View style={{ width: "100%", height: 180, borderRadius: 16, overflow: "hidden", backgroundColor: "#ddd" }}>
  {/* 角标：最高 */}
  <View
    style={{
      position: "absolute",
      top: 12,
      left: 12,
      zIndex: 3,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.9)",
    }}
  >
    <Text>HOT</Text>
  </View>

  {/* 遮罩：中间 */}
  <View
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 2,
      backgroundColor: "rgba(0,0,0,0.25)",
    }}
  />

  {/* 文本：比遮罩高 */}
  <View
    style={{
      position: "absolute",
      left: 16,
      bottom: 14,
      zIndex: 3,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Title</Text>
  </View>

  {/* 背景内容：最低（不写 zIndex 默认） */}
  <View style={{ flex: 1 }} />
</View>
```

---

# 5) 项目常见“定位模板”大全（你可以当速查表）

## 5.1 右上角关闭按钮（Modal/卡片）

```tsx
<View style={{ borderRadius: 16, backgroundColor: "#fff", padding: 16 }}>
  <Text style={{ fontWeight: "700" }}>Modal</Text>

  <Pressable style={{ position: "absolute", top: 12, right: 12, zIndex: 10, padding: 10 }}>
    <Text>X</Text>
  </Pressable>
</View>
```

## 5.2 全屏遮罩（阻止点击）

```tsx
<View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999 }} />
```

## 5.3 下拉菜单（Dropdown）浮层

关键点：父容器 `position: "relative"`（默认即可），菜单用 absolute + zIndex。

```tsx
<View style={{ width: 220 }}>
  <Pressable style={{ padding: 12, borderRadius: 12, backgroundColor: "#eee" }}>
    <Text>Open Menu</Text>
  </Pressable>

  <View
    style={{
      position: "absolute",
      top: 52,
      left: 0,
      right: 0,
      zIndex: 100,
      borderRadius: 12,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#eee",
      paddingVertical: 8,
    }}
  >
    {["Profile", "Settings", "Logout"].map((t) => (
      <Pressable key={t} style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
        <Text>{t}</Text>
      </Pressable>
    ))}
  </View>
</View>
```

---

# 6) 常见坑位（务必记住）

1. **zIndex 不生效**

* 多数情况是没配合 `position: "absolute"`，或不在同一个父容器的兄弟层级里。

2. **浮层被兄弟容器遮住**

* 很可能是“父容器裁剪”：`overflow: "hidden"` 把浮层裁掉了。

  * Dropdown、Tooltip 尽量不要放在 `overflow: "hidden"` 的容器内部。

3. **Android 层级/阴影异常**

* 需要阴影或更稳定的层级时，常加：

```tsx
{ elevation: 6 } // Android
```

---

如果你接下来要做 **Dropdown / Tooltip / BottomSheet / Modal** 这类“叠层组件”，告诉我你用的是：

* Expo Router 还是普通导航
* 是否用 NativeWind
  我可以给你一套更工程化的封装（包含 Portal 思路、点击外部关闭、避免 overflow 裁剪、动画过渡）。

判定标准：**是否真实生效、是否可控、是否推荐在实际项目中使用**。

符号说明：

* ✅ 可正常使用
* ⚠️ 有限制 / 需注意使用场景
* ❌ 不支持 / 基本无效

---

## 一、`position` 支持情况

> RN 支持：`relative`（默认） / `absolute`
> 不支持：`fixed` / `sticky`

| 组件                  | position | 说明                 |
| ------------------- | -------- | ------------------ |
| **View**            | ✅        | RN 定位基石            |
| **Text**            | ⚠️       | 可用，但文本是内联盒，定位行为不稳定 |
| **Image**           | ✅        | 行为等同 View          |
| **ImageBackground** | ✅        | 容器可定位              |
| **Pressable**       | ✅        | 等同 View            |
| **Button**          | ❌        | 无法控制               |
| **TextInput**       | ✅        | 可用于绝对定位输入框         |
| **Switch**          | ⚠️       | 可设置但视觉和交互不可靠       |
| **ScrollView**      | ⚠️       | 容器可定位，内容滚动仍受自身影响   |
| **FlatList**        | ⚠️       | 同 ScrollView       |
| **SectionList**     | ⚠️       | 同 ScrollView       |
| **SafeAreaView**    | ✅        | 等同 View            |

---

## 二、`top / bottom / left / right` 支持情况

> **只有在 `position: 'absolute'` 或 `'relative'`（相对自身偏移）时才生效**

| 组件                  | top | bottom | left | right | 说明              |
| ------------------- | --- | ------ | ---- | ----- | --------------- |
| **View**            | ✅   | ✅      | ✅    | ✅     | 标准定位            |
| **Text**            | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 行内文本偏移，可能影响排版   |
| **Image**           | ✅   | ✅      | ✅    | ✅     | 可控              |
| **ImageBackground** | ✅   | ✅      | ✅    | ✅     | 可控              |
| **Pressable**       | ✅   | ✅      | ✅    | ✅     | 可控              |
| **Button**          | ❌   | ❌      | ❌    | ❌     | 不可用             |
| **TextInput**       | ✅   | ✅      | ✅    | ✅     | 常用于浮动输入框        |
| **Switch**          | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 原生控件，表现不一致      |
| **ScrollView**      | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 定位的是“滚动容器”，不是内容 |
| **FlatList**        | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 同上              |
| **SectionList**     | ⚠️  | ⚠️     | ⚠️   | ⚠️    | 同上              |
| **SafeAreaView**    | ✅   | ✅      | ✅    | ✅     | 常用于全屏定位         |

---

## 三、`inset` 支持情况

> `inset` 是 RN 新增的 **top/right/bottom/left 简写属性**
> 等价于：`top + right + bottom + left`

| 组件                  | inset | 说明                       |
| ------------------- | ----- | ------------------------ |
| **View**            | ⚠️    | 新版本 RN 可用，需配合 `position` |
| **Text**            | ❌     | 文本不推荐                    |
| **Image**           | ⚠️    | 需新 RN 版本                 |
| **ImageBackground** | ⚠️    | 同 Image                  |
| **Pressable**       | ⚠️    | 同 View                   |
| **Button**          | ❌     | 不支持                      |
| **TextInput**       | ⚠️    | 支持度取决 RN 版本              |
| **Switch**          | ❌     | 不支持                      |
| **ScrollView**      | ❌     | 不推荐                      |
| **FlatList**        | ❌     | 不推荐                      |
| **SectionList**     | ❌     | 不推荐                      |
| **SafeAreaView**    | ⚠️    | 可用但使用较少                  |

📌 **实战建议**：

> 除非你明确项目 RN 版本支持，否则 **优先使用 top / bottom / left / right**，而不是 inset。

---

## 四、`zIndex` 支持情况

> `zIndex` **只在同一父级 + 非 static（即 RN 的 relative / absolute）下生效**

| 组件                  | zIndex | 说明                 |
| ------------------- | ------ | ------------------ |
| **View**            | ✅      | 标准使用               |
| **Text**            | ⚠️     | 文本层级不稳定            |
| **Image**           | ✅      | 可叠加                |
| **ImageBackground** | ✅      | 可叠加                |
| **Pressable**       | ✅      | 常用于遮罩/弹层           |
| **Button**          | ❌      | 不可控                |
| **TextInput**       | ⚠️     | iOS/Android 表现略有差异 |
| **Switch**          | ❌      | 原生控件，不参与 RN 层级     |
| **ScrollView**      | ⚠️     | 容器层级可控，内部内容不       |
| **FlatList**        | ⚠️     | 同 ScrollView       |
| **SectionList**     | ⚠️     | 同上                 |
| **SafeAreaView**    | ✅      | 等同 View            |

---

## 五、非常重要的结论（面试级）

### 1️⃣ RN 没有 `fixed / sticky`

* 悬浮按钮、顶部栏
  👉 **用 `position: 'absolute'` + 父容器撑满屏幕**

### 2️⃣ zIndex 不生效的 90% 原因

* 不在同一父容器
* 没有设置 position
* 被原生控件（如 Switch）遮挡

### 3️⃣ 列表组件永远是“容器定位”

你定位的是：

```txt
FlatList 外壳
不是 item
```

---

## 一句话速记

> **能当 View 用的组件 → 定位和 zIndex 基本都能用**
> **原生控件（Button / Switch）→ 基本不行**
> **列表组件 → 只能定位外壳，不能管内容**

如果你愿意，我可以下一步把
**display / overflow / background / shadow(elevation)**
继续按同样表格方式给你整理完一整套 RN 样式速查表。
