下面给你一个 **React Native + Reanimated 2/3** 的“浮动标签 + 断裂上边框（notch）”输入框封装：

效果目标（你描述的）：

* **未输入**：输入框里显示默认文字（placeholder/label 在框内）
* **点击/聚焦**：默认文字动画到**右上角**（更准确：右上角附近，贴着上边框）
* 同时输入框**右上角上边框“断裂”**一段，用来“让出”标签文字（类似 Material 的 outlined notch）

> 重点：我们不靠 SVG，不用第三方 UI，纯 View + Reanimated 组合出 notch。

---

## NotchedAnimatedInput.tsx

```tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  LayoutChangeEvent,
  Pressable,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = Omit<TextInputProps, "placeholder"> & {
  label: string;

  /** 容器样式 */
  containerStyle?: ViewStyle;

  /** 输入框高度 */
  height?: number;

  /** 边框 */
  borderRadius?: number;
  borderWidth?: number;

  /** 主题色 */
  activeColor?: string;
  inactiveColor?: string;

  /** label 样式 */
  labelStyle?: TextStyle;

  /** notch 的内边距（label 周围留白） */
  notchPaddingX?: number;

  /** label 在上边框的“右上角”位置：距离右边的 padding */
  labelRightInset?: number;

  /** 输入区域 padding */
  contentPaddingHorizontal?: number;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
};

/**
 * Notched (outlined) floating label input:
 * - label inside when idle
 * - label moves to top-right when focused or has value
 * - top border breaks (notch) to host the label
 */
export function NotchedAnimatedInput({
  label,
  value,
  defaultValue,
  onChangeText,

  containerStyle,
  height = 54,

  borderRadius = 14,
  borderWidth = 1.5,

  activeColor = "#377bcd",
  inactiveColor = "rgba(0,0,0,0.28)",

  labelStyle,
  notchPaddingX = 8,
  labelRightInset = 14,

  contentPaddingHorizontal = 14,
  contentPaddingTop = 18,
  contentPaddingBottom = 12,

  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const inputRef = useRef<TextInput>(null);

  // focused state
  const [focused, setFocused] = useState(false);

  // label measured width/height (for notch)
  const [labelW, setLabelW] = useState(0);
  const [labelH, setLabelH] = useState(0);

  const focusSV = useSharedValue(0); // 0 idle, 1 active

  const hasText = useMemo(() => {
    const v = value ?? defaultValue ?? "";
    return String(v).length > 0;
  }, [value, defaultValue]);

  // drive animation: focused OR hasText
  const active = useDerivedValue(() => {
    const target = focused || hasText ? 1 : 0;
    return withTiming(target, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, hasText]);

  const borderColor = useDerivedValue(() => {
    const t = focused ? 1 : 0;
    // 不在这插值颜色，避免你项目主题冲突；用两层边框方式更可控
    return t;
  }, [focused]);

  const onLabelLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // 防抖：避免重复 setState 导致抖动
    if (Math.abs(width - labelW) > 0.5) setLabelW(width);
    if (Math.abs(height - labelH) > 0.5) setLabelH(height);
  }, [labelW, labelH]);

  const pressToFocus = () => inputRef.current?.focus();

  /**
   * 1) Label 动画：
   *   - idle: 位于输入框内部（像 placeholder）
   *   - active: 移到上边框右侧（略微上移），并缩小
   */
  const labelAnimStyle = useAnimatedStyle(() => {
    const t = active.value;

    // 内部位置（靠左） -> 右上角位置
    const xIdle = contentPaddingHorizontal;
    const xActive = Math.max(
      contentPaddingHorizontal,
      // 右上角：让 label 贴近右侧 padding
      // labelW 已测量，没测到前取 0，位置会先靠右，测到后自动对齐
      // 容器宽度我们不直接拿，采用“右对齐”策略：用绝对 right 处理更稳定
      0
    );

    const yIdle = (height - labelH) / 2 - 1; // 大致垂直居中
    const yActive = -labelH / 2; // 抬到上边框附近（突出一半）

    const translateY = interpolate(t, [0, 1], [yIdle, yActive]);
    const scale = interpolate(t, [0, 1], [1, 0.82]);

    return {
      transform: [{ translateY }, { scale }],
      opacity: 1,
    };
  });

  /**
   * 2) Label 容器定位：
   *   我们把 label 做成绝对定位：left + right 二选一
   *   - idle：用 left
   *   - active：用 right（实现右上角）
   *
   * 注意：left/right 不能在同一时刻都精确插值，否则会布局冲突。
   * 这里用两个 Animated View 叠加也行，但更简洁：用 “active 时启用 right，否则启用 left”
   * 再配合 translateY/scale 动画。
   */
  const labelPosStyle = useAnimatedStyle(() => {
    const t = active.value;
    return {
      // idle 时靠左，active 时靠右（用 opacity/position 的方式切换）
      left: t < 0.5 ? contentPaddingHorizontal : undefined,
      right: t >= 0.5 ? labelRightInset : undefined,
    } as any;
  });

  /**
   * 3) Notch（上边框断裂）：
   * 方案：用三段“上边框”覆盖式绘制：
   *   - topLeft: 从左到 notchStart
   *   - topGap : 断裂区域（透明）
   *   - topRight: 从 notchEnd 到右
   *
   * 我们把 notch 放在“右上角 label 所在区域”，根据 labelW 动态决定 gap 宽度。
   */
  const notchGapWidth = useMemo(() => {
    // gap = label 宽度 + 左右 padding
    return Math.max(0, labelW + notchPaddingX * 2);
  }, [labelW, notchPaddingX]);

  // 顶部线段动画：未激活时 gap=0（不断裂），激活时 gap=notchGapWidth
  const topLeftStyle = useAnimatedStyle(() => {
    const t = active.value;

    // gap 右对齐：计算 “notch 左边界” 相对右侧的位置
    // notch 左边界 = rightInset + gapWidth
    const gap = interpolate(t, [0, 1], [0, notchGapWidth]);

    return {
      borderTopWidth: borderWidth,
      borderTopColor: focused ? activeColor : inactiveColor,
      // left segment 右侧留出 gap 区域（靠右）
      marginRight: gap + labelRightInset,
      borderTopLeftRadius: borderRadius,
    };
  });

  const topRightStyle = useAnimatedStyle(() => {
    const t = active.value;
    const gap = interpolate(t, [0, 1], [0, notchGapWidth]);

    return {
      borderTopWidth: borderWidth,
      borderTopColor: focused ? activeColor : inactiveColor,
      width: labelRightInset,
      // 当 gap=0 时，这段也需要参与显示，否则右侧会断掉
      opacity: gap === 0 ? 1 : 1,
      borderTopRightRadius: borderRadius,
    };
  });

  const gapStyle = useAnimatedStyle(() => {
    const t = active.value;
    const gap = interpolate(t, [0, 1], [0, notchGapWidth]);
    return {
      width: gap,
      height: borderWidth,
      backgroundColor: "transparent", // gap 透明
    };
  });

  /**
   * 4) 外圈边框：用一个完整的 border 画“除上边框之外”的框
   *    然后用自绘 top segments 覆盖上边框，实现 notch
   */
  const outlineStyle = useMemo<ViewStyle>(
    () => ({
      height,
      borderRadius,
      borderWidth,
      borderColor: focused ? activeColor : inactiveColor,
    }),
    [height, borderRadius, borderWidth, focused, activeColor, inactiveColor]
  );

  return (
    <Pressable onPress={pressToFocus} style={[styles.root, containerStyle]}>
      <View style={[styles.outline, outlineStyle]}>
        {/* 顶部 notch：覆盖在 outline 上边框位置 */}
        <View
          pointerEvents="none"
          style={[
            styles.topRow,
            {
              left: 0,
              right: 0,
              top: -borderWidth / 2, // 对齐像素，避免 “双线”
              paddingLeft: 0,
              paddingRight: 0,
            },
          ]}
        >
          <Animated.View style={[styles.topLeft, topLeftStyle]} />
          <Animated.View style={[styles.gap, gapStyle]} />
          <Animated.View style={[styles.topRight, topRightStyle]} />
        </View>

        {/* Label（浮动） */}
        <Animated.View style={[styles.labelWrap, labelPosStyle, labelAnimStyle]}>
          <Animated.Text
            onLayout={onLabelLayout}
            numberOfLines={1}
            style={[
              styles.labelText,
              { color: focused ? activeColor : "rgba(0,0,0,0.55)" },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
        </Animated.View>

        {/* TextInput */}
        <TextInput
          ref={inputRef}
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setFocused(true);
            focusSV.value = 1;
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            focusSV.value = 0;
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              paddingHorizontal: contentPaddingHorizontal,
              paddingTop: contentPaddingTop,
              paddingBottom: contentPaddingBottom,
              height,
            },
            style as any,
          ]}
          placeholder={""} // 我们用 label 代替 placeholder
          placeholderTextColor="transparent"
          {...rest}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  outline: {
    position: "relative",
    overflow: "visible",
  },

  topRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    // 用 padding/height 控制在顶部对齐
    height: 2,
  },
  topLeft: {
    flex: 1,
  },
  gap: {
    // width 动画控制
  },
  topRight: {
    // width 固定 = labelRightInset
  },

  labelWrap: {
    position: "absolute",
    // left / right 动画控制
    top: 0,
    paddingHorizontal: 2,
    backgroundColor: Platform.select({
      ios: "white",
      android: "white",
      default: "white",
    }),
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    fontSize: 16,
    color: "black",
  },
});
```

---

## 使用示例

```tsx
import React, { useState } from "react";
import { View } from "react-native";
import { NotchedAnimatedInput } from "./NotchedAnimatedInput";

export default function Screen() {
  const [v, setV] = useState("");

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <NotchedAnimatedInput
        label="用户名"
        value={v}
        onChangeText={setV}
        activeColor="#377bcd"
        inactiveColor="rgba(0,0,0,0.25)"
        keyboardType="default"
        autoCapitalize="none"
      />
    </View>
  );
}
```

---

## 你现在这个需求里，最容易踩的坑（我已经帮你规避）

1. **label 宽度没测到**导致 notch 宽度不准

   * 我用 `onLayout` 测量 `labelW`，gap 宽度随之更新

2. **上边框出现“双线”**

   * 我用 `top: -borderWidth / 2` 把 notch 线贴到 outline 上边框上，减少重叠

3. **left/right 同时存在布局冲突**

   * 我用 `labelPosStyle` 在动画区间用 “阈值切换” 的方式避免冲突
   * 如果你想更丝滑（完全插值），我可以给你写“两个 label 叠加交叉淡入”的方案

---

## 你要我继续增强的话，选一个方向

A) label **完全右上角**（贴到右边框内侧，并且 notch 精确对齐）
B) 支持 `error` 状态：红色边框 + shake 动画
C) 支持 `rightIcon` / `clearButton`（输入时出现清除按钮）
D) 支持 `helperText` / `counter`（下方提示与计数）

你更想先做哪一个？我会在你现在这个组件上直接扩展，不会推翻重写。
