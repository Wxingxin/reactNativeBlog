下面给你一份 **React Native `Modal` 的“属性大全 + 知识点大全 + 经典代码”**（偏工程实践）。我会按你写项目最常用的方式组织：先把 props 归类讲清楚，再给可直接复用的模板代码。

---

## 1) Modal 是什么，工程上解决什么问题

`Modal` 是 RN 提供的“原生模态层”能力：**把一段 UI 渲染到当前页面之上**，并且通常会“阻断”底层页面交互（你也可以通过 transparent + 自己实现遮罩点击来控制）。

典型场景：

* 确认弹窗 / 提示弹窗
* 全屏编辑页（不想走导航栈）
* 自定义底部弹层（Bottom Sheet 的轻量版本）
* 图片预览、支付确认、授权提示等

---

## 2) Modal 属性大全（按类别）

> 说明：不同 RN 版本会有细微差异；以下为稳定且常用的属性集合。

### A. 显示与生命周期

* **`visible: boolean`**
  控制是否显示 Modal（核心属性）
* **`onShow?: () => void`**
  Modal 显示后回调
* **`onDismiss?: () => void`**（iOS 更常用）
  Modal 被关闭并完成 dismiss 后回调（常用于关闭后做清理/上报）
* **`children`**
  Modal 内容区域

### B. 动画与呈现方式

* **`animationType?: 'none' | 'slide' | 'fade'`**
  最常用：`fade`（弹窗）/ `slide`（底部或全屏滑入）
* **`presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen'`**（iOS）

  * `fullScreen`: 全屏
  * `pageSheet/formSheet`: iPad 常见样式
  * `overFullScreen`: 覆盖式（通常配合 `transparent`）
* **`transparent?: boolean`**
  是否透明背景。

  * `false`：系统会给你一块不透明背景（更像“新页面”）
  * `true`：你需要自己实现遮罩层（最常用的自定义弹窗方案）
* **`statusBarTranslucent?: boolean`**（Android）
  让 Modal 覆盖状态栏区域（沉浸式遮罩很常用）
* **`hardwareAccelerated?: boolean`**（Android）
  启用硬件加速（一般默认够用，仅在特定渲染问题时考虑）

### C. 关闭与系统返回键（Android 必看）

* **`onRequestClose?: () => void`**（Android 必需）
  用户点 Android 返回键时触发。
  工程规范：**只要你可关闭，就在这里 setVisible(false)**；如果不允许关闭，也要在这里拦截并提示。
* **`backdrop / mask 点击关闭`**：RN 不直接提供，需要你自己用 `Pressable` 包一层遮罩来实现（下方示例会给标准写法）

### D. 屏幕方向（少用但要知道）

* **`supportedOrientations?: Array<'portrait' | 'portrait-upside-down' | 'landscape' | ...>`**
* **`onOrientationChange?: (event) => void`**

### E. 无障碍相关（生产环境建议考虑）

* 常见无障碍属性（如 `accessibilityViewIsModal` 等）可能因版本/平台不同；如果你做强无障碍要求，建议在 Modal 根视图上明确可访问性语义，并避免底层元素被读屏读到。

---

## 3) 知识点大全（项目中最常踩的点）

### 3.1 `transparent=true` 基本等于“你要自己实现遮罩与布局”

当 `transparent` 为 `true`：

* Modal 背景不会帮你变暗
* 点击空白处不会自动关闭
* 你需要自己加“遮罩层 + 居中/底部定位 + 点击关闭逻辑”

工程上最常用的结构是：

* 外层：全屏遮罩（可点击关闭）
* 内层：真正的弹窗卡片（阻止点击冒泡关闭）

### 3.2 Android 一定要处理 `onRequestClose`

否则：

* 返回键行为不可控
* 会出现警告或交互不符合预期

### 3.3 Modal 会“盖在最上层”，但不等于帮你处理键盘与安全区

* 表单弹窗：经常需要配 `KeyboardAvoidingView`（iOS）或手动布局
* 刘海屏/底部 Home Indicator：建议用 SafeAreaView 或预留 padding

### 3.4 “关闭动画结束后再做清理”要用 `onDismiss`（尤其 iOS）

例如：关闭后重置表单、释放计时器、上报埋点。
只在 `setVisible(false)` 后立即清理，有时会导致动画过程中内容闪动或逻辑抢跑。

### 3.5 性能与渲染策略

* Modal 打开时渲染复杂列表/大图，可能出现首次卡顿：
  常见做法：Modal 内容拆分、延迟渲染、或在 visible 前预热数据。
* 多个 Modal 叠加：尽量避免。若必须叠加，统一管理“当前层级”与关闭顺序。

---

## 4) 经典代码模板（可直接复用）

### 4.1 标准确认弹窗（遮罩点击关闭 + 卡片阻止冒泡）

```jsx
import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

export function ConfirmModal({
  visible,
  title = "提示",
  message = "确定要继续吗？",
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel} // Android 返回键
      onDismiss={() => {
        // iOS: 动画结束后回调（可做清理/上报）
      }}
    >
      {/* 遮罩层：点空白关闭 */}
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* 弹窗卡片：阻止点击冒泡到遮罩 */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
              <Text style={[styles.btnText, styles.btnGhostText]}>取消</Text>
            </Pressable>

            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onConfirm}>
              <Text style={styles.btnText}>确定</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "700" },
  message: { marginTop: 10, fontSize: 14, color: "#374151" },
  row: { flexDirection: "row", gap: 12, marginTop: 16, justifyContent: "flex-end" },
  btn: {
    minWidth: 92,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  btnGhost: { backgroundColor: "#f3f4f6" },
  btnPrimary: { backgroundColor: "#111827" },
  btnText: { color: "#fff", fontWeight: "600" },
  btnGhostText: { color: "#111827" },
});
```

要点：

* 外层 `Pressable` 负责遮罩点击关闭
* 内层卡片用 `Pressable onPress={() => {}}` 吃掉点击，避免冒泡关闭

---

### 4.2 底部弹层（轻量 Bottom Sheet）

```jsx
import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

export function BottomSheetModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.mask} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.h1}>选择操作</Text>

          <Pressable style={styles.item} onPress={() => {}}>
            <Text style={styles.itemText}>编辑</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => {}}>
            <Text style={styles.itemText}>分享</Text>
          </Pressable>
          <Pressable style={[styles.item, styles.danger]} onPress={() => {}}>
            <Text style={[styles.itemText, styles.dangerText]}>删除</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    marginBottom: 12,
  },
  h1: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  item: {
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    marginTop: 10,
  },
  itemText: { fontSize: 15, color: "#111827", fontWeight: "600" },
  danger: { backgroundColor: "#fef2f2" },
  dangerText: { color: "#b91c1c" },
  closeBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "#111827",
  },
  closeText: { color: "#fff", fontWeight: "700" },
});
```

要点：

* `animationType="slide"` + `justifyContent: 'flex-end'`
* 同样使用“遮罩关闭 + 内容阻止冒泡”结构

---

### 4.3 全屏表单 Modal（关闭前校验/返回键拦截）

```jsx
import React, { useState } from "react";
import { Modal, View, Text, Pressable, TextInput, StyleSheet } from "react-native";

export function FullscreenFormModal({ visible, onClose }) {
  const [name, setName] = useState("");

  const canClose = () => {
    // 示例：未填写时不允许关闭
    if (!name.trim()) return false;
    return true;
  };

  const handleRequestClose = () => {
    if (canClose()) onClose();
    // 否则可弹 toast / 提示
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleRequestClose}
      onDismiss={() => {
        // 关闭动画结束：可以重置表单等
        // setName("");
      }}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={handleRequestClose} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>编辑资料</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>姓名</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="请输入"
            style={styles.input}
          />

          <Pressable
            onPress={() => {
              if (canClose()) onClose();
            }}
            style={styles.save}
          >
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  headerBtn: { width: 60, height: 40, justifyContent: "center" },
  headerBtnText: { color: "#111827", fontWeight: "600" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  body: { padding: 16 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  save: {
    marginTop: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
```

要点：

* 全屏 Modal 常常就是“临时页面”，但不走导航
* `onRequestClose` 做返回键/关闭拦截
* `onDismiss` 做收尾清理更稳

---

## 5) 实战建议（你写项目时的默认模板）

* 弹窗类：`transparent + fade`，遮罩自己写（可控性最高）
* Android：永远把 `onRequestClose` 当成必选项
* 遮罩点击关闭：外层 `Pressable`；内容区域再套一层 `Pressable` 吃掉点击
* 关闭后的清理：优先放 `onDismiss`（避免动画中闪动/逻辑抢跑）

---

如果你接下来要做更“像原生”的底部抽屉（可拖拽、跟随手势、支持半屏/全屏），我建议直接上 `react-native-gesture-handler + reanimated` 或现成的 bottom sheet 库；你告诉我你当前 RN 项目是否已经集成了 Reanimated，我可以给你一套更工程化的选型与落地模板。
