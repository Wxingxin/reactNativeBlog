下面给你一个**React Native 自定义刮刮卡（Scratch Card）**的封装方案：用 `react-native-svg` 画遮罩层 + 用“笔刷圆”去擦除（实际上是**把触点路径转成很多圆形**），并在擦除比例达到阈值时自动揭开。

> 这个方案的优点：纯 RN + SVG（无原生改动）、可控性强、可做成通用组件。
> 代价：需要做“擦除面积估算”（我下面给你一个可用的近似实现）。

---

## 1) 依赖安装

```bash
# Expo
expo install react-native-svg

# RN CLI
yarn add react-native-svg
# iOS 记得 pod install
```

---

## 2) ScratchCard 组件（可直接用）

**核心思路**

* 底下是一层“奖品内容”（children）
* 上面盖一层遮罩（灰色/图片）
* 用户手指滑动时，把轨迹离散成多个点
* 每个点画一个圆（半径=brushSize/2），组成“擦除区域”
* 用 SVG 的 `ClipPath`（裁剪）或 `Mask` 让遮罩被“挖洞”
* 用一个低成本的网格采样估算擦除比例（够用）

> 注：SVG 在不同平台对 `Mask`/`ClipPath` 支持细节略有差异，我给你用**Mask**（更符合“擦除”直觉），并提供一个备用思路在文末。

```tsx
import React, { useMemo, useRef, useState } from "react";
import { View, PanResponder, LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import Svg, { Defs, Mask, Rect, Circle, Image as SvgImage } from "react-native-svg";

type Point = { x: number; y: number };

type ScratchCardProps = {
  width?: number;              // 可不传：自动跟随容器 layout
  height?: number;             // 可不传：自动跟随容器 layout
  brushSize?: number;          // 笔刷直径
  threshold?: number;          // 0~1，擦除比例达到多少自动完成
  overlayColor?: string;       // 遮罩纯色
  overlayImageUri?: string;    // 遮罩图片（比纯色更像真实刮刮卡）
  style?: StyleProp<ViewStyle>;
  onProgress?: (ratio: number) => void;
  onComplete?: () => void;
  disabled?: boolean;
  children: React.ReactNode;   // 底层奖品内容
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** 把两点之间插值出若干点，避免移动太快出现断裂 */
function interpolatePoints(a: Point, b: Point, step: number): Point[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const count = Math.max(1, Math.floor(dist / step));
  const pts: Point[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / count;
    pts.push({ x: a.x + dx * t, y: a.y + dy * t });
  }
  return pts;
}

/**
 * 近似估算擦除比例：在卡片区域采样一个网格，
 * 如果采样点落在任意“擦除圆”内，就算被擦除。
 * - sampleGap 越小越准，但计算越重
 */
function estimateErasedRatio(
  width: number,
  height: number,
  circles: { x: number; y: number; r: number }[],
  sampleGap: number
) {
  if (width <= 0 || height <= 0) return 0;
  if (!circles.length) return 0;

  const cols = Math.ceil(width / sampleGap);
  const rows = Math.ceil(height / sampleGap);
  const total = cols * rows;

  let hit = 0;

  // 简单优化：先用 bounding box 快速筛
  for (let ry = 0; ry < rows; ry++) {
    const y = ry * sampleGap + sampleGap / 2;
    for (let cx = 0; cx < cols; cx++) {
      const x = cx * sampleGap + sampleGap / 2;

      let covered = false;
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const dx = x - c.x;
        const dy = y - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          covered = true;
          break;
        }
      }
      if (covered) hit++;
    }
  }

  return hit / total;
}

export function ScratchCard({
  width: propW,
  height: propH,
  brushSize = 36,
  threshold = 0.55,
  overlayColor = "#BDBDBD",
  overlayImageUri,
  style,
  onProgress,
  onComplete,
  disabled,
  children,
}: ScratchCardProps) {
  const [layout, setLayout] = useState({ w: propW ?? 0, h: propH ?? 0 });
  const [done, setDone] = useState(false);

  // 轨迹点（可以做限长）
  const [points, setPoints] = useState<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);

  // 用 circles 作为“擦除区域”
  const circles = useMemo(() => {
    const r = brushSize / 2;
    return points.map((p) => ({ x: p.x, y: p.y, r }));
  }, [points, brushSize]);

  const sampleGap = useMemo(() => {
    // 采样间距：和笔刷尺寸相关，经验值
    return Math.max(8, Math.floor(brushSize / 2));
  }, [brushSize]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !done,
      onMoveShouldSetPanResponder: () => !disabled && !done,
      onPanResponderGrant: (evt) => {
        if (disabled || done) return;
        const { locationX, locationY } = evt.nativeEvent;
        const p = {
          x: clamp(locationX, 0, layout.w),
          y: clamp(locationY, 0, layout.h),
        };
        lastPointRef.current = p;
        setPoints((prev) => [...prev, p]);
      },
      onPanResponderMove: (evt) => {
        if (disabled || done) return;
        const { locationX, locationY } = evt.nativeEvent;
        const cur = {
          x: clamp(locationX, 0, layout.w),
          y: clamp(locationY, 0, layout.h),
        };

        const last = lastPointRef.current;
        lastPointRef.current = cur;

        if (!last) {
          setPoints((prev) => [...prev, cur]);
          return;
        }

        // 插值：step 越小越密，越平滑
        const step = Math.max(6, brushSize / 3);
        const pts = interpolatePoints(last, cur, step);

        setPoints((prev) => {
          // 轻量限长：避免无限增长（根据你页面需要调）
          const next = prev.concat(pts).slice(-6000);
          return next;
        });
      },
      onPanResponderRelease: () => {
        if (disabled || done) return;

        const ratio = estimateErasedRatio(layout.w, layout.h, circles, sampleGap);
        onProgress?.(ratio);

        if (ratio >= threshold) {
          setDone(true);
          onComplete?.();
        }
      },
    });
  }, [disabled, done, layout.w, layout.h, circles, sampleGap, brushSize, threshold, onProgress, onComplete]);

  const onLayout = (e: LayoutChangeEvent) => {
    if (propW && propH) return; // 固定尺寸就不需要
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: Math.round(width), h: Math.round(height) });
  };

  const w = propW ?? layout.w;
  const h = propH ?? layout.h;

  return (
    <View
      onLayout={onLayout}
      style={[{ width: propW, height: propH, overflow: "hidden" }, style]}
      {...panResponder.panHandlers}
    >
      {/* 底层奖品内容 */}
      <View style={{ width: "100%", height: "100%" }}>{children}</View>

      {/* 顶层遮罩：done 后直接隐藏 */}
      {!done && w > 0 && h > 0 && (
        <View style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>
          <Svg width={w} height={h}>
            <Defs>
              {/* Mask：白色=显示遮罩，黑色=挖掉（透明） */}
              <Mask id="scratchMask">
                <Rect x="0" y="0" width={w} height={h} fill="white" />
                {circles.map((c, idx) => (
                  <Circle key={idx} cx={c.x} cy={c.y} r={c.r} fill="black" />
                ))}
              </Mask>
            </Defs>

            {/* 遮罩层本体：纯色或图片 */}
            {overlayImageUri ? (
              <>
                {/* 图片遮罩 */}
                <SvgImage
                  x="0"
                  y="0"
                  width={w}
                  height={h}
                  href={{ uri: overlayImageUri }}
                  preserveAspectRatio="xMidYMid slice"
                  mask="url(#scratchMask)"
                />
                {/* 如果图片有透明/加载慢，可叠一层兜底色 */}
                <Rect x="0" y="0" width={w} height={h} fill={overlayColor} opacity={0.15} mask="url(#scratchMask)" />
              </>
            ) : (
              <Rect x="0" y="0" width={w} height={h} fill={overlayColor} mask="url(#scratchMask)" />
            )}
          </Svg>
        </View>
      )}
    </View>
  );
}
```

---

## 3) 使用示例

```tsx
import React from "react";
import { View, Text } from "react-native";
import { ScratchCard } from "./ScratchCard";

export default function Demo() {
  return (
    <View style={{ padding: 24 }}>
      <ScratchCard
        width={320}
        height={180}
        brushSize={42}
        threshold={0.55}
        overlayColor="#B0B0B0"
        onProgress={(p) => console.log("progress:", p)}
        onComplete={() => console.log("complete")}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>🎉 恭喜中奖：￥50</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>兑换码：AURORA-2026</Text>
        </View>
      </ScratchCard>
    </View>
  );
}
```

---

## 4) 可选增强（实战常用）

### A) “刮开后自动淡出”更像真实

完成后不要直接隐藏遮罩，而是做个 `Animated` opacity 0 → 1 过渡。

### B) 遮罩材质更真实

用一张“银灰刮刮卡纹理”PNG/JPG 当 `overlayImageUri`（带噪点/金属纹理），观感提升很明显。

### C) 性能优化（必须知道）

1. **点数限制**：我做了 `.slice(-6000)`，你可以改小，比如 2000～4000。
2. **合并点**：移动事件很密，建议加“距离阈值”，移动太小就不加点。
3. **面积估算触发时机**：我只在 release 时算一次；如果你想实时显示进度，可以每 200ms 节流算一次（注意性能）。

---

## 5) 你可能会踩的坑

* `Mask`/`ClipPath` 在 Android 某些版本上表现差异：
  如果你遇到遮罩不生效，可以把“挖洞逻辑”换成 `ClipPath`（反向裁剪不好做），或直接走更稳的方案：**画遮罩 + 用 `BlendMode`(Skia) 做 destination-out**（下方给你备选）。

---

## 6) 备选方案（更专业、更稳）：用 Skia 做真正的“擦除”

如果你项目允许加依赖，**@shopify/react-native-skia** 是最理想的刮刮卡实现：

* `BlendMode="dstOut"` 直接把路径抠掉
* 性能更强、效果更细腻（真正连续路径）
* 也更容易算覆盖面积（甚至直接导出位图）

如果你想我给你 Skia 版本，我可以把同样的 API（brushSize/threshold/onComplete）封装成同一个组件接口。

---

如果你告诉我：你用的是 **Expo 还是 RN CLI**，以及你希望遮罩是**纯色**还是**纹理图片**，我可以把组件再“工程化”一下：加 `reset()`、`reveal()`、进度节流、以及更稳的面积估算策略（比如网格位图缓存）。
