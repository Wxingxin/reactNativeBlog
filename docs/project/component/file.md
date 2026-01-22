下面给你一套在 React Native 中可直接落地的“**文件上传（类似 Web 的 `<input type="file">`）组件**”封装方案，并配套「使用大全 + 知识点大全」。

> 关键前提：RN **没有** Web 的 `<input type="file">`。移动端的“选文件/选图片/拍照/录视频”需要通过 **系统文件选择器/相册/相机** 来实现，然后再把拿到的 `uri` 上传到服务端。

我给你两套主流实现路径（你可按项目环境选）：

* **Expo / RN（推荐 Expo）**：`expo-document-picker`、`expo-image-picker`
* **纯 React Native（非 Expo）**：`react-native-document-picker`（思路一致）

下面以 **Expo 场景**为主（更稳定、上手更快），最后给出“非 Expo”的替代说明。

---

## 1) 依赖安装（Expo）

```bash
npx expo install expo-document-picker expo-image-picker
```

---

## 2) 组件封装：FilePickerUploader（选文件 + 上传）

支持：

* 选择任意文件（PDF/Word/Zip等）
* 选择图片（相册/拍照）
* 多文件（可选）
* 显示已选文件列表、删除、清空
* 上传：`multipart/form-data`

### `components/FilePickerUploader.js`

```jsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

/**
 * FileItem: { uri, name, mimeType, size }
 *
 * props:
 * - value: FileItem[] (受控) 可选
 * - onChange: (files: FileItem[]) => void
 * - multiple: boolean
 * - mode: "any" | "image"  // any: 文档选择器；image: 图片（相册/相机）
 * - uploadUrl: string
 * - fieldName: string (multipart字段名，默认 file/files)
 * - headers: object (如 Authorization)
 * - extraFormData: object (额外表单字段)
 */
export default function FilePickerUploader({
  label,
  helperText,
  errorText,

  value,
  onChange,

  multiple = false,
  mode = "any",
  uploadUrl,
  fieldName = "file",
  headers,
  extraFormData,

  disabled = false,
}) {
  const [innerFiles, setInnerFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const files = value ?? innerFiles;
  const setFiles = (next) => {
    if (onChange) onChange(next);
    else setInnerFiles(next);
  };

  const hasError = Boolean(errorText);

  const pickAnyFile = async () => {
    if (disabled) return;

    const res = await DocumentPicker.getDocumentAsync({
      multiple,
      copyToCacheDirectory: true,
      // type: "*/*"  // 默认即可；也可传 MIME 列表限制
    });

    if (res.canceled) return;

    // expo-document-picker 返回 assets
    const assets = res.assets ?? [];
    const picked = assets.map((a) => ({
      uri: a.uri,
      name: a.name ?? "file",
      mimeType: a.mimeType ?? "application/octet-stream",
      size: a.size,
    }));

    setFiles(multiple ? mergeByUri(files, picked) : picked.slice(0, 1));
  };

  const pickImageFromLibrary = async () => {
    if (disabled) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("权限不足", "需要相册权限才能选择图片");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? 0 : 1, // 0=不限制（部分平台行为不同）
    });

    if (res.canceled) return;

    const assets = res.assets ?? [];
    const picked = assets.map((a) => ({
      uri: a.uri,
      name: guessNameFromUri(a.uri, "image.jpg"),
      mimeType: guessMimeFromUri(a.uri) ?? "image/jpeg",
      size: a.fileSize, // 可能为 undefined（平台差异）
    }));

    setFiles(multiple ? mergeByUri(files, picked) : picked.slice(0, 1));
  };

  const takePhoto = async () => {
    if (disabled) return;

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("权限不足", "需要相机权限才能拍照");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.9,
    });

    if (res.canceled) return;

    const a = res.assets?.[0];
    if (!a) return;

    const picked = [{
      uri: a.uri,
      name: guessNameFromUri(a.uri, "photo.jpg"),
      mimeType: guessMimeFromUri(a.uri) ?? "image/jpeg",
      size: a.fileSize,
    }];

    setFiles(multiple ? mergeByUri(files, picked) : picked);
  };

  const removeAt = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
  };

  const clearAll = () => setFiles([]);

  const canUpload = useMemo(() => {
    return Boolean(uploadUrl) && files.length > 0 && !uploading && !disabled;
  }, [uploadUrl, files.length, uploading, disabled]);

  const upload = async () => {
    if (!uploadUrl) {
      Alert.alert("缺少 uploadUrl", "请传入上传地址");
      return;
    }
    if (files.length === 0) {
      Alert.alert("请选择文件", "至少选择一个文件再上传");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();

      // 额外字段（例如 userId、folder、bizType）
      if (extraFormData) {
        Object.entries(extraFormData).forEach(([k, v]) => {
          form.append(k, String(v));
        });
      }

      if (files.length === 1 && !multiple) {
        const f = files[0];
        form.append(fieldName, toFormDataFile(f));
      } else {
        // 多文件：后端通常用 files 或 fieldName[]
        const name = fieldName.endsWith("[]") ? fieldName : `${fieldName}[]`;
        files.forEach((f) => form.append(name, toFormDataFile(f)));
      }

      const resp = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          // 注意：不要手动写 'Content-Type': 'multipart/form-data'
          // fetch 会自动带 boundary；手动写反而容易导致服务端解析失败
          ...(headers ?? {}),
        },
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Upload failed: ${resp.status} ${resp.statusText} ${text}`);
      }

      // 约定：服务端返回 json
      const data = await resp.json().catch(() => null);
      Alert.alert("上传成功", data ? "服务端已返回结果" : "上传完成");
      return data;
    } catch (e) {
      Alert.alert("上传失败", e?.message ?? "未知错误");
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.panel, hasError && styles.panelError, disabled && styles.panelDisabled]}>
        <View style={styles.row}>
          <Pressable
            onPress={mode === "image" ? pickImageFromLibrary : pickAnyFile}
            style={[styles.btn, disabled && styles.btnDisabled]}
            disabled={disabled}
          >
            <Text style={styles.btnText}>
              {mode === "image" ? "选择图片" : "选择文件"}
            </Text>
          </Pressable>

          {mode === "image" ? (
            <Pressable
              onPress={takePhoto}
              style={[styles.btn, disabled && styles.btnDisabled]}
              disabled={disabled}
            >
              <Text style={styles.btnText}>拍照</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={clearAll}
            style={[styles.btnGhost, disabled && styles.btnDisabled]}
            disabled={disabled}
          >
            <Text style={styles.btnGhostText}>清空</Text>
          </Pressable>

          <Pressable
            onPress={upload}
            style={[styles.btnPrimary, (!canUpload) && styles.btnDisabled]}
            disabled={!canUpload}
          >
            <Text style={styles.btnPrimaryText}>
              {uploading ? "上传中..." : "上传"}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={files}
          keyExtractor={(item) => item.uri}
          renderItem={({ item, index }) => (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.mimeType}{item.size ? ` · ${formatBytes(item.size)}` : ""}
                </Text>
              </View>
              <Pressable onPress={() => removeAt(index)} hitSlop={10} disabled={disabled}>
                <Text style={[styles.removeText, disabled && styles.disabledText]}>删除</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>未选择文件</Text>}
          contentContainerStyle={{ paddingTop: 10 }}
        />
      </View>

      {(helperText || errorText) ? (
        <Text style={[styles.helper, hasError && styles.errorText]}>
          {hasError ? errorText : helperText}
        </Text>
      ) : null}
    </View>
  );
}

/** helpers */
function mergeByUri(prev, next) {
  const map = new Map(prev.map((x) => [x.uri, x]));
  next.forEach((x) => map.set(x.uri, x));
  return Array.from(map.values());
}

function toFormDataFile(file) {
  // RN/Expo fetch + FormData 通常接受 { uri, name, type }
  return {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  };
}

function guessNameFromUri(uri, fallback) {
  const parts = String(uri).split("/");
  const last = parts[parts.length - 1];
  return last && last.includes(".") ? last : fallback;
}

function guessMimeFromUri(uri) {
  const u = String(uri).toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return "image/jpeg";
  if (u.endsWith(".webp")) return "image/webp";
  return null;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const num = bytes / Math.pow(k, i);
  return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: 8, fontSize: 14, color: "#333" },

  panel: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  panelError: { borderColor: "#ff4d4f" },
  panelDisabled: { opacity: 0.65, backgroundColor: "#f6f6f6" },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  btnText: { color: "#111" },

  btnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  btnGhostText: { color: "#444" },

  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1677ff",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },

  btnDisabled: { opacity: 0.5 },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
    gap: 12,
  },
  itemName: { fontSize: 15, color: "#111" },
  itemMeta: { fontSize: 12, color: "#888", marginTop: 2 },

  removeText: { color: "#ff4d4f" },
  disabledText: { color: "#999" },

  empty: { color: "#999", paddingVertical: 10 },

  helper: { marginTop: 6, fontSize: 12, color: "#888" },
  errorText: { color: "#ff4d4f" },
});
```

---

## 3) 使用大全（覆盖真实项目场景）

### 3.1 上传任意文件（PDF/Word/Zip）

```jsx
<FilePickerUploader
  label="附件"
  mode="any"
  multiple
  uploadUrl="https://api.example.com/upload"
  fieldName="files"
  headers={{ Authorization: `Bearer ${token}` }}
  helperText="支持 PDF/Word/Zip，最多选择多个"
/>
```

---

### 3.2 仅上传图片（相册 + 拍照）

```jsx
const [images, setImages] = useState([]);

<FilePickerUploader
  label="图片"
  mode="image"
  multiple
  value={images}
  onChange={setImages}
  uploadUrl="https://api.example.com/upload/image"
  fieldName="images"
  extraFormData={{ bizType: "avatar" }}
/>;
```

---

### 3.3 单文件上传（类似只允许选一个）

```jsx
const [file, setFile] = useState([]);

<FilePickerUploader
  label="营业执照"
  mode="any"
  multiple={false}
  value={file}
  onChange={setFile}
  uploadUrl="https://api.example.com/upload/license"
  fieldName="file"
  helperText="只需上传一份文件"
/>
```

---

### 3.4 表单集成：React Hook Form（最常见）

```jsx
import { Controller } from "react-hook-form";

<Controller
  name="attachments"
  control={control}
  rules={{ validate: (v) => (v?.length ? true : "请上传至少一个附件") }}
  render={({ field: { value, onChange }, fieldState: { error } }) => (
    <FilePickerUploader
      label="附件"
      mode="any"
      multiple
      value={value}
      onChange={onChange}
      uploadUrl="https://api.example.com/upload"
      fieldName="files"
      errorText={error?.message}
    />
  )}
/>
```

---

### 3.5 “先选后上传” vs “选择即上传”

* **先选后上传**：用户确认后再点“上传”（适合多选）
* **选择即上传**：拿到文件立刻 upload（适合头像、单图）

选择即上传示例（父组件）：

```jsx
const [files, setFiles] = useState([]);

<FilePickerUploader
  value={files}
  onChange={(next) => {
    setFiles(next);
    // 这里也可以在 next 变化时自动调用上传（你可在组件里也实现 autoUpload）
  }}
  uploadUrl="https://api.example.com/upload"
  fieldName="files"
/>
```

---

## 4) 知识点大全（文件上传在 RN 必懂）

### 4.1 RN 为什么没有 `<input type="file">`

* RN 不是浏览器环境，没有 DOM
* 文件选择需要使用系统能力：**Document Picker / Media Picker / Camera**

### 4.2 文件选择的两条链路

* **文档类**：`expo-document-picker`

  * 适合：PDF、Word、压缩包、任意文件
* **媒体类**：`expo-image-picker`

  * 适合：相册选图、拍照、选视频（可配置）

### 4.3 文件对象在 RN 的常见结构

通常不会拿到真正的 `File` 对象，而是：

* `uri`：本地路径或缓存路径（核心）
* `name`：文件名
* `mimeType` / `type`：MIME 类型
* `size`：字节大小（部分平台可能缺失）

上传时，FormData 里用：

```js
form.append("file", { uri, name, type })
```

### 4.4 multipart/form-data 上传注意事项（高频坑）

* 不要手动设置 `Content-Type: multipart/form-data`
  因为需要 `boundary`，`fetch` 会自动生成；你手动写会导致服务端解析失败。
* 服务端字段名要对齐：

  * 单文件：`file`
  * 多文件：常见 `files[]` 或 `files`（看后端怎么接）

### 4.5 权限（iOS/Android）

* 相册：Media Library 权限
* 相机：Camera 权限
* 文档选择器通常不需要额外权限（由系统 Picker 提供）

### 4.6 预览/压缩/裁剪（进阶）

* 图片压缩、裁剪：可引入专门库（Expo 下也有方案）
* 大文件：可做上传前大小校验、分片上传（更复杂）

### 4.7 iOS/Android 差异点

* `size`、`mimeType` 可能不稳定或为空，需要兜底
* 多选支持与行为在不同系统/版本存在差异（例如选择上限、selectionLimit 支持情况）

### 4.8 安全与服务端配合（必须沟通）

* 服务端需校验：

  * MIME 类型
  * 文件大小
  * 病毒扫描（企业场景）
  * 存储策略（S3/OSS/本地）
* 客户端通常只做“体验与基本约束”，安全以服务端为主

---

## 5) 非 Expo（纯 RN）怎么做（替代说明）

如果你的项目不是 Expo：

* 用 `react-native-document-picker` 代替 `expo-document-picker`
* 图片可用 `react-native-image-picker`

整体组件结构**完全一致**：拿 `uri/name/type` → `FormData` → `fetch/axios` 上传。

---

## 6) 你下一步如果要“企业级上传组件”

我可以继续把它升级成你项目里常见的完整版，例如：

1. 上传进度条（`XMLHttpRequest` 或 axios 进度回调）
2. 并发上传队列（多文件分批）
3. 文件类型白名单 + 大小限制 + 失败重试
4. 上传前签名直传 OSS/S3（更标准的生产方案）

你告诉我：你现在是 **Expo** 还是 **纯 RN CLI**？以及后端是 **Express/Nest** 还是直传 **OSS/S3**？我会按你的栈给你“最贴合生产”的上传实现与后端字段约定示例。
