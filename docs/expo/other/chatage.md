下面给你一套「可直接落地到 RN（Expo 优先）」的 **聊天 UI 组件封装**（类似 react-native-chat-ui 的结构），重点覆盖你点名的技术栈：

* 列表：**FlashList（优先）/ FlatList（兜底）**
* 手势：**react-native-gesture-handler**（长按/滑动准备好扩展点）
* 动画：**react-native-reanimated**（消息进入、输入栏弹出）
* 图片：**expo-image（Expo）/ fast-image（RN CLI）**
* 输入：**KeyboardAvoidingView + 键盘高度处理**
* 音频：**expo-av**（录音 + 发送音频消息 + 播放）
* 暂时不做：WebSocket（先做本地状态、回显、加载更多、发送中/失败）

> 设计目标：组件“像库一样用”，你只需要传 `messages`、`onSend`、`currentUserId`，其余（输入框状态、录音、图片渲染、列表滚动到底部、消息分组/时间等）组件内部处理。

---

## 1) 数据模型（Message 类型）

建议你从一开始就统一一套 message schema，后续接 WebSocket/接口很顺。

```ts
export type ChatMessage =
  | {
      id: string;
      type: "text";
      text: string;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    }
  | {
      id: string;
      type: "image";
      imageUrl: string;
      width?: number;
      height?: number;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    }
  | {
      id: string;
      type: "audio";
      audioUrl: string;
      durationMs?: number;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    };
```

---

## 2) Chat 组件对外 API（你项目里怎么用）

你最终用起来像这样：

```tsx
<ChatUI
  currentUserId="u1"
  messages={messages}
  onSend={async (draft) => {
    // draft: { type: 'text'|'image'|'audio', ... }
    // 这里先本地乐观更新，再调用接口
  }}
  onLoadMore={async () => {
    // 上拉加载更多历史消息（可选）
  }}
/>
```

---

## 3) 核心实现（可复制粘贴的 TS 版本）

> 依赖：FlashList、gesture-handler、reanimated、expo-av、expo-image（如果是 RN CLI 则把 expo-image 替换 fast-image）

### ChatUI.tsx

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { GestureHandlerRootView, LongPressGestureHandler, State } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, Layout, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { Audio } from "expo-av";
import { Image as ExpoImage } from "expo-image";

export type ChatMessage =
  | {
      id: string;
      type: "text";
      text: string;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    }
  | {
      id: string;
      type: "image";
      imageUrl: string;
      width?: number;
      height?: number;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    }
  | {
      id: string;
      type: "audio";
      audioUrl: string;
      durationMs?: number;
      createdAt: number;
      user: { id: string; name?: string; avatar?: string };
      status?: "sending" | "sent" | "failed";
    };

export type SendDraft =
  | { type: "text"; text: string }
  | { type: "image"; imageUrl: string; width?: number; height?: number }
  | { type: "audio"; audioUrl: string; durationMs?: number };

type Props = {
  currentUserId: string;
  messages: ChatMessage[]; // 按 createdAt 升序 or 降序都行，但要和 inverted 配合
  onSend: (draft: SendDraft) => Promise<void> | void;
  onLoadMore?: () => Promise<void> | void;
  isLoadingMore?: boolean;
  useInverted?: boolean; // 默认 true：聊天常用 inverted
};

export function ChatUI({
  currentUserId,
  messages,
  onSend,
  onLoadMore,
  isLoadingMore,
  useInverted = true,
}: Props) {
  const listRef = useRef<FlashList<ChatMessage>>(null);

  // 输入框
  const [text, setText] = useState("");

  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // 输入栏动画
  const inputScale = useSharedValue(1);

  const sorted = useMemo(() => {
    // 你可以统一外部传入排序，这里只做兜底：升序
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  const data = useMemo(() => (useInverted ? [...sorted].reverse() : sorted), [sorted, useInverted]);

  const scrollToBottom = useCallback(() => {
    if (!listRef.current) return;
    // inverted = true 时 bottom 是 offset 0
    if (useInverted) listRef.current.scrollToOffset({ offset: 0, animated: true });
    else listRef.current.scrollToEnd({ animated: true });
  }, [useInverted]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () => {
      inputScale.value = withTiming(1.02, { duration: 180 });
    });
    const hide = Keyboard.addListener("keyboardWillHide", () => {
      inputScale.value = withTiming(1, { duration: 180 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [inputScale]);

  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }],
    };
  });

  const handleSendText = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setText("");
    scrollToBottom();
    await onSend({ type: "text", text: trimmed });
  }, [text, onSend, scrollToBottom]);

  // -------- 音频（expo-av）录音：按住录音按钮开始，松开结束并发送 --------
  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      setIsRecording(false);
      setRecording(null);
    }
  }, []);

  const stopRecordingAndSend = useCallback(async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      setRecording(null);
      setIsRecording(false);

      if (uri) {
        scrollToBottom();
        await onSend({
          type: "audio",
          audioUrl: uri,
          durationMs: typeof status.durationMillis === "number" ? status.durationMillis : undefined,
        });
      }
    } catch (e) {
      setIsRecording(false);
      setRecording(null);
    }
  }, [recording, onSend, scrollToBottom]);

  // 上拉加载更多（inverted=true 时到“顶部”= 接近列表尾部）
  const onEndReached = useCallback(() => {
    if (!onLoadMore) return;
    onLoadMore();
  }, [onLoadMore]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.user.id === currentUserId;
      return (
        <MessageRow
          message={item}
          isMe={isMe}
          onLongPress={() => {
            // 这里预留：复制、删除、撤回、转发等
          }}
        />
      );
    },
    [currentUserId]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          <FlashList
            ref={listRef}
            data={data}
            inverted={useInverted}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            estimatedItemSize={72}
            onEndReached={onLoadMore ? onEndReached : undefined}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              onLoadMore ? (
                <View style={styles.loadMore}>
                  {isLoadingMore ? <ActivityIndicator /> : <Text style={styles.loadMoreText}>加载更多</Text>}
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />

          <Animated.View style={[styles.inputBar, inputBarAnimatedStyle]} layout={Layout.springify()}>
            <Pressable
              style={[styles.iconBtn, isRecording && styles.iconBtnRecording]}
              onPressIn={startRecording}
              onPressOut={stopRecordingAndSend}
            >
              <Text style={styles.iconBtnText}>{isRecording ? "录音中" : "按住说话"}</Text>
            </Pressable>

            <View style={styles.inputWrap}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="输入消息"
                style={styles.input}
                multiline
              />
            </View>

            <Pressable style={styles.sendBtn} onPress={handleSendText}>
              <Text style={styles.sendBtnText}>发送</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

function MessageRow({
  message,
  isMe,
  onLongPress,
}: {
  message: ChatMessage;
  isMe: boolean;
  onLongPress?: () => void;
}) {
  return (
    <LongPressGestureHandler
      minDurationMs={350}
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state === State.ACTIVE) onLongPress?.();
      }}
    >
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(120)}
        layout={Layout.springify()}
        style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}
      >
        {!isMe && message.user.avatar ? (
          <ExpoImage source={{ uri: message.user.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}

        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {message.type === "text" && <Text style={styles.msgText}>{message.text}</Text>}

          {message.type === "image" && (
            <ExpoImage
              source={{ uri: message.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={120}
            />
          )}

          {message.type === "audio" && <AudioBubble uri={message.audioUrl} durationMs={message.durationMs} />}

          <View style={styles.metaRow}>
            {!!message.status && message.status !== "sent" && (
              <Text style={styles.statusText}>{message.status === "sending" ? "发送中" : "失败"}</Text>
            )}
            <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
          </View>
        </View>
      </Animated.View>
    </LongPressGestureHandler>
  );
}

function AudioBubble({ uri, durationMs }: { uri: string; durationMs?: number }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const toggle = useCallback(async () => {
    try {
      if (!sound) {
        const { sound: s } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        setSound(s);
        setIsPlaying(true);

        s.setOnPlaybackStatusUpdate((st) => {
          if (!st.isLoaded) return;
          if (st.didJustFinish) setIsPlaying(false);
        });
        return;
      }

      const st = await sound.getStatusAsync();
      if (!st.isLoaded) return;

      if (st.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch {}
  }, [sound, uri]);

  return (
    <Pressable onPress={toggle} style={styles.audioWrap}>
      <Text style={styles.audioText}>{isPlaying ? "暂停" : "播放"}语音</Text>
      <Text style={styles.audioDur}>{typeof durationMs === "number" ? `${Math.ceil(durationMs / 1000)}s` : ""}</Text>
    </Pressable>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0C10" },
  listContent: { paddingVertical: 12, paddingHorizontal: 12 },
  loadMore: { paddingVertical: 10, alignItems: "center" },
  loadMoreText: { color: "#9CA3AF", fontSize: 12 },

  row: { flexDirection: "row", marginBottom: 10, alignItems: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 8 },
  avatarPlaceholder: { width: 34, height: 34, marginRight: 8 },

  bubble: { maxWidth: "78%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMe: { backgroundColor: "#2563EB", marginLeft: 42 },
  bubbleOther: { backgroundColor: "#111827" },

  msgText: { color: "white", fontSize: 15, lineHeight: 20 },

  image: { width: 220, height: 140, borderRadius: 12, backgroundColor: "#0F172A" },

  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  timeText: { color: "#CBD5E1", fontSize: 11 },
  statusText: { color: "#FCA5A5", fontSize: 11 },

  audioWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  audioText: { color: "white", fontSize: 14 },
  audioDur: { color: "#CBD5E1", fontSize: 12 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1F2937",
    backgroundColor: "#0B0C10",
    gap: 8,
  },

  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  iconBtnRecording: { backgroundColor: "#7C2D12" },
  iconBtnText: { color: "#E5E7EB", fontSize: 12 },

  inputWrap: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 14,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { color: "white", fontSize: 15, padding: 0, margin: 0 },

  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
  },
  sendBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
});
```

---

## 4) 关键 UI / 状态点（你后面接 WebSocket 也不会推倒重来）

### A. 消息状态（sending/sent/failed）

* 你在外层做“乐观更新”：插入一条 `status: 'sending'` 的消息
* 接口成功后把同 `id` 的 status 改成 `sent`
* 失败改成 `failed`，后续加“点击重发”即可

### B. 列表策略（FlashList + inverted）

* 聊天典型：`inverted={true}`，这样“底部”在 offset=0
* 新消息追加（按 createdAt 升序存储），展示时 reverse 给 FlashList
* `onEndReached` 在 inverted 下，触发的是“滑到更早消息”（加载更多历史）

### C. 手势扩展点

当前已经有 `LongPressGestureHandler`，你可以加：

* `Swipeable`：右滑回复
* `PanGestureHandler`：拖动/选择消息
* 长按弹出 ActionSheet：复制/删除/撤回

### D. 动画策略（Reanimated）

* `entering FadeIn + Layout.springify()`：消息插入自然
* `inputScale`：键盘弹出输入栏“轻微呼吸感”
  你后续可以补：
* 新消息“气泡弹出”缩放
* 录音按钮按下变形、波纹

### E. 图片组件选择

* Expo：`expo-image`（缓存、解码效率好）
* RN CLI：换成 `react-native-fast-image`
  你只要把 `<ExpoImage .../>` 抽成 `ChatImage` 适配即可。

---

## 5) 你还缺的依赖（快速清单）

Expo（推荐）：

* `@shopify/flash-list`
* `react-native-gesture-handler`
* `react-native-reanimated`
* `expo-av`
* `expo-image`

RN CLI：

* `react-native-fast-image` 替换 `expo-image`
* 音频若不用 expo-av，可用 `react-native-audio-recorder-player`（但你要求 expo-av，所以更适合 Expo）

---

## 6) 下一步我建议你加的两个“像库一样”的能力（不涉及 WebSocket）

1. **MessageList 的“日期分割条”**（今天/昨天/周几）
2. **输入区能力拆分**：TextInput、语音、图片选择（expo-image-picker）、@提及

如果你希望我继续，我可以在不引入 WebSocket 的前提下，把下面两块补齐到可用程度：

* 图片选择与发送（expo-image-picker + 预览 + 发送中状态）
* 长按弹出操作菜单（复制文本、删除本地消息、失败重发）
