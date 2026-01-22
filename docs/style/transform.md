---
outline: false
---

符号：✅ 常规可用｜⚠️ 有限制/需注意｜❌ 不支持或基本无效

> 这些属性都属于 `style.transform` 数组里的变换项，例如：
> `style={{ transform: [{ translateX: 10 }, { scale: 1.1 }] }}`

---

## 组件 × Transform 样式支持总表

| 组件                  | translateX/Y | scale / scaleX/Y | rotate | rotateX/Y | skewX/Y | 备注                       |
| ------------------- | -----------: | ---------------: | -----: | --------: | ------: | ------------------------ |
| **View**            |            ✅ |                ✅ |      ✅ |         ✅ |       ✅ | 变换支持最完整                  |
| **Text**            |            ✅ |                ✅ |      ✅ |        ⚠️ |      ⚠️ | 2D 一般 OK，3D/倾斜在不同平台表现不一致 |
| **Image**           |            ✅ |                ✅ |      ✅ |         ✅ |       ✅ | 常用于图片缩放/旋转               |
| **ImageBackground** |            ✅ |                ✅ |      ✅ |         ✅ |       ✅ | 容器整体变换；内部内容一起变           |
| **Pressable**       |            ✅ |                ✅ |      ✅ |         ✅ |       ✅ | 常做按压缩放动画                 |
| **Button**          |            ❌ |                ❌ |      ❌ |         ❌ |       ❌ | 系统按钮不可控                  |
| **TextInput**       |           ⚠️ |               ⚠️ |     ⚠️ |        ⚠️ |      ⚠️ | 可用但不推荐：影响光标/选区/键盘交互一致性   |
| **Switch**          |            ❌ |                ❌ |      ❌ |         ❌ |       ❌ | 原生控件，transform 基本不生效或不可靠 |
| **ScrollView**      |           ⚠️ |               ⚠️ |     ⚠️ |        ⚠️ |      ⚠️ | 变换的是“滚动容器”，会影响滚动与触摸区域    |
| **FlatList**        |           ⚠️ |               ⚠️ |     ⚠️ |        ⚠️ |      ⚠️ | 同 ScrollView             |
| **SectionList**     |           ⚠️ |               ⚠️ |     ⚠️ |        ⚠️ |      ⚠️ | 同 ScrollView             |
| **SafeAreaView**    |            ✅ |                ✅ |      ✅ |         ✅ |       ✅ | 等同 View                  |

---

## 关键注意点（实战非常重要）

### 1) Transform 会影响“视觉”，不一定影响“布局占位”

* 例如 `scale: 0.8` 只是看起来变小
* 组件在布局里占的空间通常还是原来的（尤其在 flex 布局中）

### 2) TextInput 做 transform 容易出交互问题（建议避坑）

常见问题：

* 光标位置看起来不对
* 选区高亮错位
* 点击/触摸命中区域和视觉位置不一致（部分机型）

**建议**：需要动画时，外层包一层 `View/Pressable` 做 transform，TextInput 只负责输入。

### 3) ScrollView / FlatList 做 transform 会影响滚动体验

* 你变换的是“滚动容器本身”，可能造成：

  * 滚动方向与视觉不一致
  * 命中区域偏移
  * 性能与手势冲突
    **建议**：更常做法是对列表 item 做 transform，而不是对整个列表做。

### 4) rotateX/rotateY 属于 3D，通常要配合 perspective 才自然

在 RN 中 3D 旋转通常需要：

* `perspective`（否则效果会怪或不明显）
* 平台差异测试（iOS/Android 细节不同）

---

## 一句话记忆

* **能当 View 用的（View / Pressable / SafeAreaView / Image 等）→ transform 基本都能用**
* **系统控件（Button / Switch）→ 不可控**
* **输入/滚动类（TextInput / ScrollView / FlatList）→ 能用但慎用，优先包一层 View 做**

如果你下一步想继续同样形式，我可以把 **shadow/elevation、overflow、display、flex 相关**也按同样表格给你整理。
