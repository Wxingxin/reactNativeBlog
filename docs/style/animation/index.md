下面给你整理了一份 **React Native 中常用的动画库大全** ——包括从基础 API、性能优化动画到丰富动效与 UI 组件的库，适合不同场景使用（入门、复杂交互、高性能或设计级动画）。([哔哩哔哩][1])

---

## 🔧 基础／内置动画（不需要额外安装）

### **1. React Native Animated（内置）**

* 官方提供的动画 API，可以创建时间线动画、弹簧动画等。用于基础过渡、渐变、位移等。([reactnative.net.cn][2])

### **2. LayoutAnimation（内置）**

* 自动动画布局变更，如高度、位置变化。无需手动控制每帧。([reactnative.net.cn][2])

---

## 🚀 高性能和高级控件动画

### **3. React Native Reanimated**

* 最强大的 React Native 动画库之一，运行于原生线程，性能极佳。支持复杂手势联动与连续动画。([arccusinc.com][3])

### **4. React Native Gesture Handler**

* 虽然它是手势库，但常配合 Reanimated 做流畅拖拽、滑动、捏合动画。([arccusinc.com][3])

### **5. React Native Skia**

* Shopify 的高性能 2D 渲染引擎，可做复杂图形/动画（比 Canvas 更强）。([哔哩哔哩][1])

---

## 🎨 动效、设计级动画

### **6. Lottie for React Native**

* 通过 JSON 渲染 After Effects 动画，高质量、可循环、可控制播放。([WPWeb Infotech][4])

### **7. Rive**

* 用于播放互动动画，适合动态按钮、图标及复杂 UI 表现。([哔哩哔哩][1])

### **8. Moti**

* 基于 Reanimated 的更易用动画库，适合快速实现过渡动画与状态变化。([哔哩哔哩][1])

### **9. React Spring**

* 凭借物理弹簧模型做自然动画，适合 UI 过渡和交互细节。([DEV Community][5])

---

## 📱 动画增强与过渡效果

### **10. React Native Shared Element**

* 实现“共享元素”屏幕过渡动画（如图片从列表到详情平滑动画）。([WPWeb Infotech][4])

### **11. Fluid Transitions**

* 与 React Navigation 配合，实现流畅的页面过渡和元素共享动画。([WPWeb Infotech][4])

---

## 🧱 预设动画 & UI 动效库

### **12. React Native Animatable**

* 内建大量预设动画（淡入淡出、弹跳、滑动等），入门级好用。([techspian.com][6])

### **13. react-native-textinput-effects**

* 文本输入框动画效果库（如弹性光标、水波等）。([哔哩哔哩][1])

### **14. react-native-snap-carousel**

* 滑动卡片视图带动效（带过渡/缩放效果的轮播）。([哔哩哔哩][1])

---

## 🛠️ 其他与动画相关的库

这些不是严格动画库，但常用于动画场景增强：

* **react-native-animated-numbers**: 数字滚动/计数动画（社区包）。([Reddit][7])
* **动画粒子/特效库（如 confetti）**: 有一些社区库在做烟花、庆祝动效（性能差异较大）。([Reddit][8])

---

## 📌 选库建议

✅ **基础/简单过渡** → 用官方 **Animated / LayoutAnimation**
✅ **高性能/复杂手势** → **Reanimated + Gesture Handler**
✅ **设计稿级动效** → **Lottie / Rive / Moti**
✅ **页面转场动画** → **Shared Element / Fluid Transitions**
✅ **快速预设动效** → **Animatable**

---

### 📊 综合对比（简要）

| 库              | 强项      | 适合场景        |
| -------------- | ------- | ----------- |
| Animated       | 内置，无外依赖 | 简单动画        |
| Reanimated     | 性能极佳    | 手势互动，复杂动画   |
| Lottie         | 设计师动画   | 图标/片段动画     |
| Rive           | 互动动画    | UI 动效/响应式动画 |
| Moti           | 简易 API  | 动画状态切换      |
| Shared Element | 屏幕转场    | 导航动画        |
| Animatable     | 预设      | 快速开发        |

---

如果你想要 **按场景举例代码** 或者 **最推荐入门 + 性能组合**（比如 Reanimated + Gesture Handler 用法示例），我也可以帮你整理 👍.

[1]: https://www.bilibili.com/video/BV1Bb421b7Lu/?utm_source=chatgpt.com "React Native - 10个史诗级的React Native动画库_哔哩哔哩_bilibili"
[2]: https://reactnative.net.cn/docs/animations?utm_source=chatgpt.com "动画 · React Native 框架"
[3]: https://arccusinc.com/blog/best-animation-ui-component-libraries-for-react-native-in-2025/?utm_source=chatgpt.com "Best Animation UI Component Libraries for React Native in 2025"
[4]: https://wpwebinfotech.com/blog/react-native-animation-libraries-and-ui-components/?utm_source=chatgpt.com "Top React Native Animation Libraries And UI Components"
[5]: https://dev.to/aneeqakhan/top-10-animation-libraries-for-react-native-apps-5b60?utm_source=chatgpt.com "Top 10 Animation Libraries for React Native Apps - DEV Community"
[6]: https://www.techspian.com/mobile-app-development/best-react-native-animation-libraries-and-ui-components-for-2024/?utm_source=chatgpt.com "Top React Native Animation Libraries & UI Components 2024"
[7]: https://www.reddit.com/r/reactnative/comments/1b8b29v?utm_source=chatgpt.com "Text content animation"
[8]: https://www.reddit.com/r/reactnative/comments/10jjldp?utm_source=chatgpt.com "Go to react native celebration animation library?"
