---
outline: false
---


## 1) Border Width（边框宽度）支持表

| 组件                  | borderWidth | borderTopWidth | borderBottomWidth | borderLeftWidth | borderRightWidth | 备注                            |
| ------------------- | ----------- | -------------- | ----------------- | --------------- | ---------------- | ----------------------------- |
| **View**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 盒模型完整支持                       |
| **Text**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用，但受文本布局影响（行高/换行）            |
| **Image**           | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用（边框围绕图片）                    |
| **ImageBackground** | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用（容器视角）                      |
| **Pressable**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 等价 View                       |
| **Button**          | ❌           | ❌              | ❌                 | ❌               | ❌                | Button 基本无法自定义边框样式            |
| **TextInput**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 常用于输入框描边                      |
| **Switch**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 这是原生控件，边框样式基本不生效              |
| **ScrollView**      | ✅           | ✅              | ✅                 | ✅               | ✅                | 边框作用于容器本身                     |
| **FlatList**        | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 ScrollView（本质基于 ScrollView） |
| **SectionList**     | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 ScrollView                  |
| **SafeAreaView**    | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 View                        |

---

## 2) Border Color（边框颜色）支持表

| 组件                  | borderColor | borderTopColor | borderBottomColor | borderLeftColor | borderRightColor | 备注             |
| ------------------- | ----------- | -------------- | ----------------- | --------------- | ---------------- | -------------- |
| **View**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 完整支持           |
| **Text**            | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用，但视觉上受文本区域影响 |
| **Image**           | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **ImageBackground** | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **Pressable**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 可用             |
| **Button**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 不可控            |
| **TextInput**       | ✅           | ✅              | ✅                 | ✅               | ✅                | 常用             |
| **Switch**          | ❌           | ❌              | ❌                 | ❌               | ❌                | 基本无效           |
| **ScrollView**      | ✅           | ✅              | ✅                 | ✅               | ✅                | 作用于容器          |
| **FlatList**        | ✅           | ✅              | ✅                 | ✅               | ✅                | 同上             |
| **SectionList**     | ✅           | ✅              | ✅                 | ✅               | ✅                | 同上             |
| **SafeAreaView**    | ✅           | ✅              | ✅                 | ✅               | ✅                | 同 View         |

---

## 3) Border Radius（圆角）支持表

| 组件                  | borderRadius | TL | TR | BL | BR | 备注                                     |
| ------------------- | ------------ | -- | -- | -- | -- | -------------------------------------- |
| **View**            | ✅            | ✅  | ✅  | ✅  | ✅  | 完整支持                                   |
| **Text**            | ✅            | ✅  | ✅  | ✅  | ✅  | 可用，但有时需要配合 `overflow: 'hidden'` 才更“干净” |
| **Image**           | ✅            | ✅  | ✅  | ✅  | ✅  | 可用；部分场景也需 `overflow: 'hidden'`（尤其包裹层）  |
| **ImageBackground** | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 容器圆角可行，但**背景图圆角**常需 `imageStyle` 配合    |
| **Pressable**       | ✅            | ✅  | ✅  | ✅  | ✅  | 可用                                     |
| **Button**          | ❌            | ❌  | ❌  | ❌  | ❌  | 不可控                                    |
| **TextInput**       | ✅            | ✅  | ✅  | ✅  | ✅  | 常见输入框圆角                                |
| **Switch**          | ❌            | ❌  | ❌  | ❌  | ❌  | 基本无效                                   |
| **ScrollView**      | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 容器圆角可用；若要裁剪内容通常需 `overflow: 'hidden'`  |
| **FlatList**        | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 同 ScrollView（裁剪/圆角表现依赖 overflow）       |
| **SectionList**     | ⚠️           | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 同上                                     |
| **SafeAreaView**    | ✅            | ✅  | ✅  | ✅  | ✅  | 同 View                                 |

> TL/TR/BL/BR 分别是：`borderTopLeftRadius / borderTopRightRadius / borderBottomLeftRadius / borderBottomRightRadius`

---

## 关键注意点（你做项目会频繁遇到）

### 1) Button / Switch 的结论很简单

* **Button：几乎不能自定义边框/圆角/颜色**
* **Switch：border 相关样式基本不生效（原生控件）**
  通常用 **Pressable + 自定义 UI** 替代 Button；Switch 要美化一般用第三方组件或自绘。

### 2) ImageBackground 的圆角要用 `imageStyle`

如果你要“背景图也跟着圆角”，常见写法是：

* 容器：`style={{ borderRadius: 12, overflow: 'hidden' }}`
* 背景图：`imageStyle={{ borderRadius: 12 }}`

（这里我不展开代码，除非你要求“给我示例代码”。）

### 3) 列表容器圆角经常要 `overflow: 'hidden'`

`ScrollView / FlatList / SectionList` 圆角想要“裁剪内容”，一般需要 `overflow: 'hidden'`，否则圆角只是“边框圆”，内容可能仍然是直角。

---

如果你接下来还要继续同样格式，我可以把 **backgroundColor / opacity / elevation/shadow / position** 也按同样表格给你整理出来。
