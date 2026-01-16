这是一个**非常现实、而且选型一旦错就会返工**的问题。
我直接给你**行业真实用法 + 选型建议 + 避坑点**，不讲虚的。

---

## 一句话结论（先记住）

> **React Native 项目中，90% 情况用的是 `react-native-maps`，
> 真正的区别在于：你用哪家“地图服务商”。**

---

## 一、最常用方案（行业标准）

### ⭐ 1️⃣ `react-native-maps`（绝对主流）

📦 安装

```bash
npm install react-native-maps
```

📌 本质

* **RN 的地图“容器”**
* 不提供地图数据
* 只负责把原生地图 SDK 包一层

### 支持的地图源

| 平台      | 地图                       |
| ------- | ------------------------ |
| iOS     | Apple Maps / Google Maps |
| Android | Google Maps              |

👉 **这是 RN 地图的“地基”**

---

## 二、地图数据怎么来？（关键）

### 你真正要选的是👇

## 1️⃣ Google Maps（全球最常见）

📌 特点

* 覆盖全球
* POI / 路况 / 搜索强
* 文档最好

📉 缺点

* 要绑信用卡
* 国内不可用（你懂）

👉 **海外 / 国际 App 首选**

---

## 2️⃣ Apple Maps（iOS-only）

📌 特点

* iOS 系统级
* 不用额外 key（基础）

📉 缺点

* Android 没有
* 数据不如 Google

👉 iOS-only 项目可考虑

---

## 3️⃣ 高德地图（中国大陆项目）

📌 场景

* 外卖
* 出行
* 本地服务

👉 不能直接用 `react-native-maps`
👉 **必须原生 SDK 或第三方封装**

---

## 三、中国项目怎么办？（重点）

### ⚠️ 重要事实

> **`react-native-maps` 在中国 = 基本不可用**

原因：

* Google Maps 被墙
* Apple Maps 精度有限
* 没有高德 / 百度支持

---

### 可选方案（国内真实用）

### 1️⃣ 高德地图 RN 封装（社区方案）

* `react-native-amap3d`
* `@react-native-amap/amap`

📌 特点

* 功能够用
* 维护质量参差

⚠️ 有原生坑

---

### 2️⃣ 原生 SDK + Native Module（大厂做法）

👉 iOS 用 AMap SDK
👉 Android 用 AMap SDK
👉 RN 只当壳

✔ 稳定
✔ 性能最好
❌ 成本高

---

## 四、Expo 项目怎么选？

### Expo Managed

❌ **不能直接用地图 SDK**

✔ 只能用

```ts
expo install react-native-maps
```

👉 只能 Google / Apple Maps

---

### Expo Dev Client / Bare

✔ 可用原生 SDK
✔ 可接高德

---

## 五、常见地图功能 & 对应库

| 功能     | 用什么                   |
| ------ | --------------------- |
| 显示地图   | react-native-maps     |
| Marker | Marker / Callout      |
| 路线规划   | Google Directions API |
| 实时定位   | expo-location         |
| 轨迹回放   | Polyline              |
| 地理编码   | Google / 高德 API       |

---

## 六、真实项目选型表（你直接用）

| 项目类型      | 推荐方案                       |
| --------- | -------------------------- |
| 海外社交 / 打车 | react-native-maps + Google |
| iOS-only  | react-native-maps + Apple  |
| 中国外卖 / 本地 | 高德 SDK                     |
| Expo Demo | react-native-maps          |
| 商业级稳定     | 原生 SDK                     |

---

## 七、常见坑（你一定会踩）

### ❌ 1. 以为地图库 = 地图服务

👉 地图库 ≠ 地图数据

---

### ❌ 2. 中国项目还选 Google

👉 基本等于返工

---

### ❌ 3. Expo Managed 想接高德

👉 做不到

---

## 八、我给你的直接建议（很重要）

你现在如果是👇

* **学习 RN** 👉 `react-native-maps`
* **做真实商业 App** 👉 先定国家 / 地区
* **国内项目** 👉 高德 + 原生
* **海外项目** 👉 Google Maps

---

## 九、如果你愿意，我可以继续帮你

我可以直接给你：

* 🔹 `react-native-maps` **完整配置 + Marker / Polyline 实战**
* 🔹 **Expo / CLI 地图选型差异图**
* 🔹 **高德地图 RN 封装避坑指南**
* 🔹 **打车 / 轨迹类地图页面架构**

你现在这个项目是：
👉 国内 / 海外？
👉 Expo 还是 CLI？
