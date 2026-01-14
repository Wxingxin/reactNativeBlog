下面是 **React Native `ImageBackground` 组件：属性大全 + 知识点大全 + 经典代码范式**。我会把它当作“可直接落地的项目手册”来写，覆盖你在真实业务里会遇到的 80% 场景与坑点。

---

## 1) ImageBackground 的定位与核心机制

`ImageBackground` 本质是一个“容器 View + 背景 Image”的组合组件：

* 背景图通过内部的 `Image` 渲染
* 你可以在上面叠加任意 children（文本、按钮、渐变、遮罩等）
* 多数情况下它比“绝对定位一个 Image 再叠内容”更直观、更好维护

典型用途：

* Banner / Card 背景图
* 头图 + 标题 + 按钮
* 头像墙、活动页背景、带遮罩的封面

---

## 2) ImageBackground 属性大全（按类别）

> 说明：`ImageBackground` 自己的 props 不多，但它同时支持很多 `Image` 的能力（通过 `imageStyle`、`resizeMode`、事件回调等）。下面按“最常用→进阶”列。

### 2.1 基础必会

#### `source`（必用）

* 与 `Image` 一样：本地 `require()` 或网络 `{ uri }`

```js
<ImageBackground
  source={{ uri: 'https://example.com/banner.jpg' }}
  style={{ width: '100%', height: 180 }}
/>
```

#### `style`（容器样式）

* 这是外层容器样式，决定布局、尺寸、padding、对齐等
* **不写宽高经常导致看不见**（尤其你没给 children 或 children 没高度）

```js
<ImageBackground
  source={require('../assets/cover.png')}
  style={{ width: '100%', height: 220, padding: 16 }}
>
  {/* children */}
</ImageBackground>
```

#### `children`

* 叠加内容，默认在背景图上层

---

### 2.2 背景图样式控制

#### `imageStyle`（关键：控制“背景图本身”的样式）

* 与 `style` 不同：`style` 是容器，`imageStyle` 是背景图片
* 最常用：圆角、透明度、滤镜等

圆角 Card（强烈推荐用 `imageStyle` 做圆角）：

```js
<ImageBackground
  source={{ uri }}
  style={{ width: 320, height: 180, borderRadius: 16, overflow: 'hidden' }}
  imageStyle={{ borderRadius: 16 }}
>
  {/* overlay content */}
</ImageBackground>
```

说明：

* 许多人只给容器 `borderRadius`，在部分平台/场景会出现背景图没有同步圆角的问题
* 保险写法：**容器 + imageStyle 同时设置**

#### `resizeMode`

* 与 `Image` 相同：`cover | contain | stretch | center | repeat`
* 背景图场景一般首选 `cover`

```js
<ImageBackground
  source={{ uri }}
  style={{ width: '100%', height: 200 }}
  resizeMode="cover"
>
  <Text>Cover</Text>
</ImageBackground>
```

---

### 2.3 Image 相关回调（加载流程）

#### `onLoadStart / onLoad / onLoadEnd / onError`

* 做 loading、失败兜底、上报埋点

```js
<ImageBackground
  source={{ uri }}
  style={{ width: '100%', height: 180 }}
  onLoadStart={() => setLoading(true)}
  onLoadEnd={() => setLoading(false)}
  onError={() => setFailed(true)}
/>
```

#### `onProgress`

* 部分平台实现可能可用，适合大图展示进度（不保证所有环境一致）

---

### 2.4 性能/兼容相关

#### `defaultSource`（占位图）

* iOS 常见；Android 依 RN 版本/实现而异

```js
<ImageBackground
  source={{ uri }}
  defaultSource={require('../assets/placeholder.png')}
  style={{ width: '100%', height: 180 }}
/>
```

#### `fadeDuration`（Android）

* 控制淡入，减少闪烁或提升观感

```js
<ImageBackground
  source={{ uri }}
  style={{ width: '100%', height: 180 }}
  fadeDuration={120}
/>
```

#### `resizeMethod`（Android）

* `auto | resize | scale`
* 大图/列表推荐 `resize`，降低内存压力

```js
<ImageBackground
  source={{ uri }}
  style={{ width: '100%', height: 180 }}
  resizeMethod="resize"
  resizeMode="cover"
/>
```

#### `testID`、无障碍相关 props

* `accessible / accessibilityLabel ...` 用法同 `Image`

---

## 3) 知识点大全（你一定会踩到的点）

### 3.1 容器尺寸决定一切：没高度就“啥也没有”

`ImageBackground` 是容器，**容器没有高度**，背景也不会“自动撑开”。

两种稳妥策略：

1. 固定高度：`style={{ height: 180 }}`
2. 比例高度：`aspectRatio`

```js
<ImageBackground
  source={{ uri }}
  style={{ width: '100%', aspectRatio: 16 / 9 }}
/>
```

---

### 3.2 圆角最稳写法：容器 + imageStyle + overflow

在不同平台/层级下，单设一种会不稳定。建议“三件套”：

* 容器：`borderRadius`
* 容器：`overflow: 'hidden'`（保证 children 也被裁剪）
* 图片：`imageStyle.borderRadius`

---

### 3.3 叠加遮罩（Overlay）的标准方式

背景图上加一层“半透明遮罩”，提高文字可读性，是 Banner 的常规做法。

---

### 3.4 事件与交互：ImageBackground 不是 Pressable

想点击整个背景：把 `Pressable` 放在内部或外层包起来。

---

## 4) 经典代码范式（可直接复制用）

### 4.1 Banner：背景图 + 遮罩 + 标题 + 按钮（最常见）

```js
import React from 'react';
import { ImageBackground, View, Text, Pressable } from 'react-native';

export default function BannerCard({ uri, title, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 16, overflow: 'hidden' }}>
      <ImageBackground
        source={{ uri }}
        style={{ width: '100%', height: 180, justifyContent: 'flex-end' }}
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
      >
        {/* 遮罩层 */}
        <View
          style={{
            padding: 16,
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            {title}
          </Text>

          <View style={{ height: 8 }} />

          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ color: '#fff' }}>查看详情</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
```

---

### 4.2 带 loading / 错误兜底的 ImageBackground（工程实用）

```js
import React, { useState } from 'react';
import { ImageBackground, View, ActivityIndicator, Text, Pressable } from 'react-native';

export default function SmartBackground({ uri }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <View style={{ borderRadius: 16, overflow: 'hidden' }}>
      <ImageBackground
        key={retryKey}
        source={failed ? require('../assets/placeholder.png') : { uri }}
        defaultSource={require('../assets/placeholder.png')}
        style={{ width: '100%', height: 200, justifyContent: 'center' }}
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
        onLoadStart={() => {
          setLoading(true);
          setFailed(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      >
        {loading && (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        )}

        {failed && (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ marginBottom: 8, color: '#fff' }}>加载失败</Text>
            <Pressable onPress={() => setRetryKey((k) => k + 1)}>
              <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>点击重试</Text>
            </Pressable>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}
```

---

### 4.3 列表卡片：固定尺寸 + Android 优化参数

```js
function ListCard({ item }) {
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden' }}>
      <ImageBackground
        source={{ uri: item.cover }}
        style={{ width: 320, height: 180, padding: 12, justifyContent: 'flex-end' }}
        imageStyle={{ borderRadius: 12 }}
        resizeMode="cover"
        resizeMethod="resize"
        fadeDuration={100}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          {item.title}
        </Text>
      </ImageBackground>
    </View>
  );
}
```

---

## 5) 常见坑与排查清单（ImageBackground 专属）

1. **看不见**

* 容器没高度/宽度（尤其 `height` 忘了写）
* children 不撑开也会导致高度为 0

2. **圆角不生效**

* 只写了容器 `borderRadius`，没写 `imageStyle.borderRadius`
* 没写 `overflow: 'hidden'` 导致子元素不被裁剪

3. **点击无效**

* `ImageBackground` 本身不是按钮，外层包 `Pressable` 或内部做点击层

4. **文字看不清**

* 加遮罩层 `backgroundColor: 'rgba(...)'` 或用渐变层（后续可扩展）

---

如果你愿意，我可以按你的项目方向再补一份“**ImageBackground + 渐变遮罩（linear-gradient）最佳实践**”与“**背景图上叠头像、标签、角标** 的组件模板”，这样你可以直接搭出活动页/卡片页的 UI 组件库。
