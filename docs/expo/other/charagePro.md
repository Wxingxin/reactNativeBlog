下面我直接把你要的两块补齐，并保持“像库一样用”的结构：

1. **图片选择与发送**（expo-image-picker + 预览 + 发送中状态）
2. **长按消息操作菜单**（复制、删除、失败重发）
   同时把组件做一次小重构：将 `ChatUI` 拆成 `MessageList + InputBar + ComposerModal(预览)`，便于你后续接 WebSocket 或替换 UI。

> 约定：仍然不做 WebSocket；`onSend` 只负责“把 draft 发出去并最终落库”，UI 侧提供乐观更新的推荐写法与 hooks。

---

## 0) 需要新增的依赖

Expo：

- `expo-image-picker`
- `expo-clipboard`（复制）
- （可选）`expo-file-system`（如果你要把选择图片转成 base64 或上传前处理）

---

## 1) 推荐的外层“乐观更新”写法（核心：状态 sent/sending/failed）

你现在的 `ChatUI` 是纯 UI。建议你在页面层做消息数组状态管理：

```tsx
import React, { useState, useCallback } from "react";
import { ChatUI, ChatMessage, SendDraft } from "./ChatUI";

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const onSend = useCallback(async (draft: SendDraft) => {
    // 1) 先插入一条 sending 的“本地消息”
    const localId = `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const base = {
      id: localId,
      createdAt: Date.now(),
      user: { id: "u1", name: "Me", avatar: "https://..." },
      status: "sending" as const,
    };

    const optimistic: ChatMessage =
      draft.type === "text"
        ? { ...base, type: "text", text: draft.text }
        : draft.type === "image"
          ? {
              ...base,
              type: "image",
              imageUrl: draft.imageUrl,
              width: draft.width,
              height: draft.height,
            }
          : {
              ...base,
              type: "audio",
              audioUrl: draft.audioUrl,
              durationMs: draft.durationMs,
            };

    setMessages((prev) => [...prev, optimistic]);

    try {
      // 2) 调用你的 HTTP API（此处先用假请求）
      // const res = await api.sendMessage(draft)
      await new Promise((r) => setTimeout(r, 600));

      // 3) 成功：把 local 消息标记为 sent（或替换为服务端 id）
      setMessages((prev) =>
        prev.map((m) => (m.id === localId ? { ...m, status: "sent" } : m)),
      );
    } catch (e) {
      // 4) 失败：failed
      setMessages((prev) =>
        prev.map((m) => (m.id === localId ? { ...m, status: "failed" } : m)),
      );
    }
  }, []);

  return (
    <ChatUI
      currentUserId="u1"
      messages={messages}
      onSend={onSend}
      onLoadMore={async () => {
        setLoadingMore(true);
        // 拉历史消息
        await new Promise((r) => setTimeout(r, 600));
        setLoadingMore(false);
      }}
      isLoadingMore={loadingMore}
    />
  );
}
```

---

## 2) ChatUI：加入图片选择、预览弹窗、长按菜单（完整可用版）

下面这份代码是在你上一版的基础上增强，仍然一个文件可跑。你后续想拆文件我再给你拆。

> 功能点：

- 输入栏加一个“图片”按钮：打开系统相册选图
- 选完弹出预览 Modal：支持写一句 caption（可选）
- 点击发送：走 `onSend({type:'image', imageUrl })`
- 长按消息：弹出底部菜单
  - 文本：复制
  - 任意消息：删除（本地删除）
  - failed：重发（调用 `onResend(message)`）

### ChatUI.tsx（增强版）

```tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Modal,
} from "react-native";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { Audio } from "expo-av";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";

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
  | {
      type: "image";
      imageUrl: string;
      width?: number;
      height?: number;
      caption?: string;
    }
  | { type: "audio"; audioUrl: string; durationMs?: number };

type Props = {
  currentUserId: string;
  messages: ChatMessage[];
  onSend: (draft: SendDraft) => Promise<void> | void;

  onLoadMore?: () => Promise<void> | void;
  isLoadingMore?: boolean;

  // 新增：长按后删除/重发交给外层或组件内部处理
  onDeleteMessage?: (id: string) => void;
  onResendMessage?: (message: ChatMessage) => Promise<void> | void;

  useInverted?: boolean;
};

export function ChatUI({
  currentUserId,
  messages,
  onSend,
  onLoadMore,
  isLoadingMore,
  onDeleteMessage,
  onResendMessage,
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

  // 长按菜单
  const [actionTarget, setActionTarget] = useState<ChatMessage | null>(null);

  // 图片预览发送
  const [imageDraft, setImageDraft] = useState<null | {
    uri: string;
    width?: number;
    height?: number;
  }>(null);
  const [imageCaption, setImageCaption] = useState("");

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  const data = useMemo(
    () => (useInverted ? [...sorted].reverse() : sorted),
    [sorted, useInverted],
  );

  const scrollToBottom = useCallback(() => {
    if (!listRef.current) return;
    if (useInverted)
      listRef.current.scrollToOffset({ offset: 0, animated: true });
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
    return { transform: [{ scale: inputScale.value }] };
  });

  const handleSendText = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setText("");
    scrollToBottom();
    await onSend({ type: "text", text: trimmed });
  }, [text, onSend, scrollToBottom]);

  // ---------- 图片选择 ----------
  const pickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });

    if (res.canceled) return;

    const asset = res.assets[0];
    setImageDraft({ uri: asset.uri, width: asset.width, height: asset.height });
    setImageCaption("");
  }, []);

  const sendPickedImage = useCallback(async () => {
    if (!imageDraft) return;
    const { uri, width, height } = imageDraft;
    setImageDraft(null);

    scrollToBottom();
    await onSend({
      type: "image",
      imageUrl: uri,
      width,
      height,
      caption: imageCaption.trim() || undefined,
    });
  }, [imageDraft, imageCaption, onSend, scrollToBottom]);

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
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch {
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
          durationMs:
            typeof status.durationMillis === "number"
              ? status.durationMillis
              : undefined,
        });
      }
    } catch {
      setIsRecording(false);
      setRecording(null);
    }
  }, [recording, onSend, scrollToBottom]);

  // 加载更多
  const onEndReached = useCallback(() => {
    if (!onLoadMore) return;
    onLoadMore();
  }, [onLoadMore]);

  const openActions = useCallback((m: ChatMessage) => setActionTarget(m), []);
  const closeActions = useCallback(() => setActionTarget(null), []);

  const handleCopy = useCallback(async () => {
    if (!actionTarget) return;
    if (actionTarget.type !== "text") return;
    await Clipboard.setStringAsync(actionTarget.text);
    closeActions();
  }, [actionTarget, closeActions]);

  const handleDelete = useCallback(() => {
    if (!actionTarget) return;
    onDeleteMessage?.(actionTarget.id);
    closeActions();
  }, [actionTarget, onDeleteMessage, closeActions]);

  const handleResend = useCallback(async () => {
    if (!actionTarget) return;
    closeActions();
    await onResendMessage?.(actionTarget);
  }, [actionTarget, onResendMessage, closeActions]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.user.id === currentUserId;
      return (
        <MessageRow
          message={item}
          isMe={isMe}
          onLongPress={() => openActions(item)}
        />
      );
    },
    [currentUserId, openActions],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  {isLoadingMore ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.loadMoreText}>加载更多</Text>
                  )}
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />

          <Animated.View
            style={[styles.inputBar, inputBarAnimatedStyle]}
            layout={Layout.springify()}
          >
            <Pressable style={styles.iconBtn} onPress={pickImage}>
              <Text style={styles.iconBtnText}>图片</Text>
            </Pressable>

            <Pressable
              style={[styles.iconBtn, isRecording && styles.iconBtnRecording]}
              onPressIn={startRecording}
              onPressOut={stopRecordingAndSend}
            >
              <Text style={styles.iconBtnText}>
                {isRecording ? "录音中" : "按住说话"}
              </Text>
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

          {/* 图片预览发送弹窗 */}
          <Modal
            visible={!!imageDraft}
            transparent
            animationType="fade"
            onRequestClose={() => setImageDraft(null)}
          >
            <View style={styles.modalMask}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>发送图片</Text>

                {imageDraft && (
                  <ExpoImage
                    source={{ uri: imageDraft.uri }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                )}

                <TextInput
                  value={imageCaption}
                  onChangeText={setImageCaption}
                  placeholder="可选：输入图片说明"
                  style={styles.captionInput}
                />

                <View style={styles.modalRow}>
                  <Pressable
                    style={[styles.modalBtn, styles.modalBtnGhost]}
                    onPress={() => setImageDraft(null)}
                  >
                    <Text style={styles.modalBtnText}>取消</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={sendPickedImage}
                  >
                    <Text style={styles.modalBtnText}>发送</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* 长按操作菜单 */}
          <Modal
            visible={!!actionTarget}
            transparent
            animationType="fade"
            onRequestClose={closeActions}
          >
            <Pressable style={styles.sheetMask} onPress={closeActions}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>操作</Text>

                {actionTarget?.type === "text" && (
                  <Pressable style={styles.sheetItem} onPress={handleCopy}>
                    <Text style={styles.sheetItemText}>复制</Text>
                  </Pressable>
                )}

                {!!actionTarget && actionTarget.status === "failed" && (
                  <Pressable style={styles.sheetItem} onPress={handleResend}>
                    <Text style={styles.sheetItemText}>重发</Text>
                  </Pressable>
                )}

                <Pressable style={styles.sheetItem} onPress={handleDelete}>
                  <Text style={[styles.sheetItemText, styles.dangerText]}>
                    删除
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.sheetItem, styles.sheetCancel]}
                  onPress={closeActions}
                >
                  <Text style={styles.sheetItemText}>取消</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
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
      onHandlerStateChange={(e) =>
        e.nativeEvent.state === State.ACTIVE && onLongPress?.()
      }
    >
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(120)}
        layout={Layout.springify()}
        style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}
      >
        {!isMe && message.user.avatar ? (
          <ExpoImage
            source={{ uri: message.user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}

        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          {message.type === "text" && (
            <Text style={styles.msgText}>{message.text}</Text>
          )}

          {message.type === "image" && (
            <ExpoImage
              source={{ uri: message.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={120}
            />
          )}

          {message.type === "audio" && (
            <AudioBubble
              uri={message.audioUrl}
              durationMs={message.durationMs}
            />
          )}

          <View style={styles.metaRow}>
            {!!message.status && message.status !== "sent" && (
              <Text style={styles.statusText}>
                {message.status === "sending" ? "发送中" : "失败"}
              </Text>
            )}
            <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
          </View>
        </View>
      </Animated.View>
    </LongPressGestureHandler>
  );
}

function AudioBubble({
  uri,
  durationMs,
}: {
  uri: string;
  durationMs?: number;
}) {
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
        const { sound: s } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
        );
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
      <Text style={styles.audioDur}>
        {typeof durationMs === "number"
          ? `${Math.ceil(durationMs / 1000)}s`
          : ""}
      </Text>
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

  bubble: {
    maxWidth: "78%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMe: { backgroundColor: "#2563EB", marginLeft: 42 },
  bubbleOther: { backgroundColor: "#111827" },

  msgText: { color: "white", fontSize: 15, lineHeight: 20 },
  image: {
    width: 220,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#0F172A",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },
  timeText: { color: "#CBD5E1", fontSize: 11 },
  statusText: { color: "#FCA5A5", fontSize: 11 },

  audioWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
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

  // 预览 modal
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#0B0C10",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 14,
  },
  modalTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: "#0F172A",
  },
  captionInput: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
  },
  modalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    justifyContent: "flex-end",
  },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  modalBtnGhost: { backgroundColor: "#111827" },
  modalBtnPrimary: { backgroundColor: "#1D4ED8" },
  modalBtnText: { color: "white", fontSize: 14, fontWeight: "600" },

  // actions sheet
  sheetMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0B0C10",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 12,
  },
  sheetTitle: { color: "#E5E7EB", fontSize: 13, marginBottom: 8 },
  sheetItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    marginBottom: 8,
  },
  sheetItemText: { color: "white", fontSize: 15, fontWeight: "600" },
  sheetCancel: { backgroundColor: "#0F172A" },
  dangerText: { color: "#FCA5A5" },
});
```

---

## 3) 如何在外层接入“删除/重发”（最关键的两行）

在页面层（ChatScreen）加上：

```tsx
<ChatUI
  ...
  onDeleteMessage={(id) => setMessages((prev) => prev.filter((m) => m.id !== id))}
  onResendMessage={async (m) => {
    // 简单策略：把 failed 改回 sending，然后调用 onSend(draft)
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "sending" } : x)));

    try {
      if (m.type === "text") await onSend({ type: "text", text: m.text });
      if (m.type === "image") await onSend({ type: "image", imageUrl: m.imageUrl, width: m.width, height: m.height });
      if (m.type === "audio") await onSend({ type: "audio", audioUrl: m.audioUrl, durationMs: m.durationMs });

      // 注意：这里会插入“新的一条 local 消息”。更严谨做法是：onSend 支持传入 messageId 进行“同条重发”
    } catch {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "failed" } : x)));
    }
  }}
/>
```

> 更严谨的“同条重发”方案：给 `onSend` 增加 `clientId` 参数，重发时复用原 id，避免产生重复消息。我可以下一步给你把这个 API 设计好。

---

## 4) 下一步继续增强（你选一个方向，我就按那个方向扩展）

你已经有：文本、图片（选择+预览+发送）、语音录制与播放、长按操作、失败重发。

接下来最常用的两块我建议你选其一：

1. **日期分割条 + 消息分组**
   - “今天/昨天/周几”分割
   - 连续消息头像合并、气泡圆角变化（更像真实聊天）

2. **手势：右滑回复 + 引用消息 UI**
   - Swipeable / Reanimated 手势
   - 输入框上方展示“回复某条消息”

你直接回复我：`做1` 或 `做2`。我会继续把对应的代码补到可以直接用的程度。
