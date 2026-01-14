下面把 **React Native `Image` 组件的“属性大全 + 知识点大全”** 系统整理一遍，并配上“经典代码范式”。我按“必会基础 → 适配/性能 → 平台差异与坑”来组织，方便你直接当速查表用。

---

## 1) Image 的核心概念与最佳实践

### 1.1 图片来源（source）是第一关键

`Image` 的 `source` 主要有 3 类：

1. **本地静态资源（打包进 App）**

```js
<Image source={require('../assets/logo.png')} />
```

* 优点：加载快、可离线、可缓存策略稳定
* 注意：`require()` 必须是**静态字符串路径**，不能动态拼接

2. **网络图片（uri）**

```js
<Image source={{ uri: 'https://example.com/a.png' }} />
```

* 需要设置尺寸，否则可能不显示（尤其是只给了 `source` 但没宽高）

3. **Base64**

```js
<Image source={{ uri: `data:image/png;base64,${base64}` }} />
```

* 适合小图、临时渲染；大图会有内存/性能压力

---

### 1.2 尺寸规则：不写宽高就容易“看不见”

* RN 的布局默认不会“自动根据图片撑开”，很多情况下你必须提供 `style.width/height` 或父容器约束。

经典写法：

```js
<Image
  source={{ uri: url }}
  style={{ width: 120, height: 120 }}
/>
```

如果你想保持比例（根据网络图实际尺寸），用 `Image.getSize`：

```js
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

export default function AutoRatioImage({ uri, width = 300 }) {
  const [height, setHeight] = useState(200);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => setHeight(Math.round((width * h) / w)),
      () => setHeight(200)
    );
  }, [uri, width]);

  return (
    <View>
      <Image source={{ uri }} style={{ width, height }} />
    </View>
  );
}
```

---

## 2) Image 属性大全（按类别）

> 说明：RN 版本不同/平台不同，支持会有差异；下面是开发中最常用、最值得记忆的一组。

### 2.1 基础必会（最常用）

#### `source`（必用）

* 类型：`ImageSourcePropType`
* 用法：

  * 本地：`require('...')`
  * 网络：`{ uri, headers?, cache? }`

网络带 header（如鉴权）：

```js
<Image
  source={{
    uri: 'https://example.com/avatar.png',
    headers: { Authorization: 'Bearer xxx' },
  }}
  style={{ width: 80, height: 80, borderRadius: 40 }}
/>
```

#### `style`

* 关键：`width/height`、`borderRadius`、`resizeMode`（也可写到 props）
* 圆角头像经典写法：

```js
<Image
  source={{ uri: avatar }}
  style={{ width: 48, height: 48, borderRadius: 24 }}
/>
```

#### `resizeMode`（图片如何适配容器）

常见取值：

* `cover`：铺满并裁剪（最常用，类似 CSS background-size: cover）
* `contain`：完整显示，可能留白
* `stretch`：拉伸变形
* `center`：居中不缩放
* `repeat`：平铺（部分平台/版本表现可能不同）

示例对比：

```js
<Image source={{ uri }} style={{ width: 200, height: 120 }} resizeMode="cover" />
<Image source={{ uri }} style={{ width: 200, height: 120 }} resizeMode="contain" />
```

---

### 2.2 加载与占位

#### `defaultSource`（占位图）

* iOS 常用；Android 兼容性取决于 RN/平台实现

```js
<Image
  source={{ uri }}
  defaultSource={require('../assets/placeholder.png')}
  style={{ width: 200, height: 120 }}
/>
```

#### `loadingIndicatorSource`（加载指示图）

* 常见于 iOS

```js
<Image
  source={{ uri }}
  loadingIndicatorSource={require('../assets/loading.png')}
  style={{ width: 200, height: 120 }}
/>
```

#### `onLoadStart / onLoad / onLoadEnd / onError`

做“骨架屏/失败重试”必备：

```js
import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Text, Pressable } from 'react-native';

export default function SmartImage({ uri }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <View style={{ width: 240, height: 160 }}>
      <Image
        key={retryKey}
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        onLoadStart={() => {
          setLoading(true);
          setError(null);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={(e) => setError(e?.nativeEvent)}
      />

      {loading && (
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      )}

      {error && (
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ marginBottom: 8 }}>加载失败</Text>
          <Pressable onPress={() => setRetryKey((k) => k + 1)}>
            <Text style={{ textDecorationLine: 'underline' }}>点击重试</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
```

#### `onProgress`（加载进度）

* 部分平台/实现可用，常用于大图加载进度条

---

### 2.3 交互与可访问性

#### `accessible / accessibilityLabel / accessibilityRole / accessibilityIgnoresInvertColors`

* 读屏与无障碍支持

```js
<Image
  source={{ uri }}
  style={{ width: 120, height: 120 }}
  accessible
  accessibilityLabel="用户头像"
/>
```

#### `alt`（新版本逐步补齐）

* 更贴近 Web 语义；兼容性视 RN 版本而定

---

### 2.4 iOS/Android 特性与解码优化

#### `fadeDuration`（Android 常用）

* 控制淡入时长（毫秒），0 表示无淡入

```js
<Image source={{ uri }} style={{ width: 200, height: 120 }} fadeDuration={150} />
```

#### `progressiveRenderingEnabled`（Android 常用）

* 渐进式渲染（JPEG 等）

#### `capInsets` / `resizeMethod`

* `resizeMethod`（Android）：`auto | resize | scale`

  * `resize`：在解码前按尺寸缩放，减少内存（大图推荐）

```js
<Image
  source={{ uri }}
  style={{ width: 300, height: 180 }}
  resizeMethod="resize"
  resizeMode="cover"
/>
```

---

### 2.5 其他常用/常见但容易忽略

#### `blurRadius`

* 毛玻璃/隐私遮挡常用

```js
<Image source={{ uri }} style={{ width: 240, height: 160 }} blurRadius={8} />
```

#### `tintColor`（配合透明 PNG/SVG-like 效果）

* 只对可着色素材有效（通常需要单色透明）

```js
<Image
  source={require('../assets/icon.png')}
  style={{ width: 24, height: 24, tintColor: 'tomato' }}
/>
```

#### `testID`

* E2E 测试定位

```js
<Image testID="profile-avatar" source={{ uri }} style={{ width: 48, height: 48 }} />
```

---

## 3) Image 的 style 属性要点（你会经常用到）

### 3.1 常用 style 清单

* 尺寸：`width`, `height`, `minWidth`, `maxWidth`, `aspectRatio`
* 圆角：`borderRadius`（以及 iOS/Android 的裁剪差异）
* 位置：`resizeMode`（可写 prop 或写进 style）
* 叠层：`position: 'absolute'`, `zIndex`
* 裁剪：`overflow: 'hidden'`（配合圆角裁剪子元素时常用）

### 3.2 `aspectRatio` 保持比例（不想算 getSize）

```js
<Image
  source={{ uri }}
  style={{ width: 320, aspectRatio: 16 / 9 }}
  resizeMode="cover"
/>
```

---

## 4) 经典代码场景（项目里真会这样写）

### 4.1 圆形头像 + 占位 + 错误兜底

```js
function Avatar({ uri, size = 48 }) {
  const [failed, setFailed] = React.useState(false);

  return (
    <Image
      source={
        failed || !uri
          ? require('../assets/avatar-placeholder.png')
          : { uri }
      }
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
```

### 4.2 列表优化：FlatList + 固定尺寸 + 合理 resizeMethod（Android）

```js
function Row({ item }) {
  return (
    <Image
      source={{ uri: item.cover }}
      style={{ width: 120, height: 80, borderRadius: 8 }}
      resizeMode="cover"
      resizeMethod="resize"
      fadeDuration={100}
    />
  );
}
```

### 4.3 图片预加载（避免首屏闪烁）

`Image.prefetch`：提前下载缓存（对网络图很实用）

```js
useEffect(() => {
  const urls = [
    'https://example.com/a.jpg',
    'https://example.com/b.jpg',
  ];
  urls.forEach((u) => Image.prefetch(u));
}, []);
```

---

## 5) 常见坑与排查清单（高频）

1. **网络图不显示**

* 先检查：有没有 `width/height`
* 再检查：`uri` 是否是 https（iOS/Android 网络安全策略）
* 再检查：是否 403（需要 headers）

2. **圆角不生效/边缘锯齿**

* `borderRadius` 必须配合明确宽高
* Android 可能需要更明确的容器裁剪策略（尤其嵌套复杂时）

3. **大图内存飙升/列表卡顿**

* Android 优先用 `resizeMethod="resize"`
* 列表项固定尺寸，避免每次测量/重排
* 需要更强缓存/性能时，通常会引入专门图片库（如 FastImage 之类）；但你先把原生 Image 的策略用好

4. **动态 require 不支持**

* `require('../assets/' + name + '.png')` 这种不行
* 解决：用映射表

```js
const icons = {
  home: require('../assets/home.png'),
  user: require('../assets/user.png'),
};
<Image source={icons[type]} />
```

---

如果你接下来要的是 **`ImageBackground` 的属性大全** 或者想把 `Image` 的属性整理成“表格速查 + 每个属性一段示例”，我也可以按你常用的项目风格（比如你之前喜欢的“大全+分类+经典代码”格式）再做一版更像手册的版本。
