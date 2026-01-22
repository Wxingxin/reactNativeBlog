下面给你一套在 React Native 中可直接落地的 **SelectOption（菜单选择/下拉选择）组件封装方案**。它覆盖真实项目常见需求：**单选/多选、标签展示、底部弹窗菜单（Modal）、搜索、禁用、清空、与表单库集成**，并给出「使用大全 + 知识点大全」。

> 说明：RN 没有原生 HTML 的 `<select>`，通常用 `Pressable + Modal + FlatList` 自己封装，或用第三方库（如 `react-native-paper` / `@react-native-picker/picker`）。这里给你的是**不依赖 UI 库、可控性更强的工程化封装**。

---

## 1) 组件封装：SelectOption（支持单选/多选 + 标签展示）

### `components/SelectOption.js`

```jsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";

/**
 * options: [{ label: string, value: string|number, disabled?: boolean }]
 *
 * 单选：value = string|number|null
 * 多选：value = Array<string|number>
 */
export default function SelectOption({
  label,
  placeholder = "请选择",
  options = [],

  // controlled value
  value,
  onChange,

  // behavior
  multiple = false,
  disabled = false,
  searchable = false,
  clearable = true,

  // UI
  title = "请选择",
  maxTagCount = 3,
  helperText,
  errorText,
  containerStyle,

  // quick custom
  renderOptionRight, // (item, selected) => ReactNode
}) {
  const [visible, setVisible] = useState(false);
  const [keyword, setKeyword] = useState("");

  const hasError = Boolean(errorText);

  const selectedSet = useMemo(() => {
    if (multiple) return new Set(Array.isArray(value) ? value : []);
    return new Set(value === null || value === undefined ? [] : [value]);
  }, [value, multiple]);

  const selectedItems = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o]));
    return Array.from(selectedSet).map((v) => map.get(v)).filter(Boolean);
  }, [options, selectedSet]);

  const displayTags = useMemo(() => {
    if (!multiple) {
      return selectedItems.length ? [selectedItems[0].label] : [];
    }
    return selectedItems.map((x) => x.label);
  }, [selectedItems, multiple]);

  const filteredOptions = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!searchable || !kw) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(kw));
  }, [options, searchable, keyword]);

  const open = () => {
    if (disabled) return;
    setKeyword("");
    setVisible(true);
  };

  const close = () => setVisible(false);

  const commitSingle = useCallback(
    (next) => {
      onChange?.(next);
      close();
    },
    [onChange]
  );

  const toggleMultiple = useCallback(
    (next) => {
      const arr = Array.isArray(value) ? value : [];
      const set = new Set(arr);
      if (set.has(next)) set.delete(next);
      else set.add(next);
      onChange?.(Array.from(set));
    },
    [onChange, value]
  );

  const clear = () => {
    if (disabled) return;
    onChange?.(multiple ? [] : null);
  };

  const renderTagSummary = () => {
    if (displayTags.length === 0) {
      return <Text style={styles.placeholder}>{placeholder}</Text>;
    }

    // 多选：展示若干 tag，超过后显示 +N
    if (multiple) {
      const visibleTags = displayTags.slice(0, maxTagCount);
      const rest = displayTags.length - visibleTags.length;

      return (
        <View style={styles.tagsRow}>
          {visibleTags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{t}</Text>
            </View>
          ))}
          {rest > 0 ? (
            <View style={styles.tagMore}>
              <Text style={styles.tagMoreText}>+{rest}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    // 单选：直接显示文本
    return <Text style={styles.singleText}>{displayTags[0]}</Text>;
  };

  const renderItem = ({ item }) => {
    const selected = selectedSet.has(item.value);
    const itemDisabled = disabled || item.disabled;

    return (
      <Pressable
        onPress={() => {
          if (itemDisabled) return;
          if (multiple) toggleMultiple(item.value);
          else commitSingle(item.value);
        }}
        style={[
          styles.optionRow,
          selected && styles.optionRowSelected,
          itemDisabled && styles.optionRowDisabled,
        ]}
        disabled={itemDisabled}
        accessibilityRole="button"
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.optionLabel, itemDisabled && styles.disabledText]}>
            {item.label}
          </Text>
        </View>

        {renderOptionRight ? (
          renderOptionRight(item, selected)
        ) : (
          <Text style={[styles.optionMark, selected && styles.optionMarkSelected]}>
            {selected ? "✓" : ""}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={open}
        disabled={disabled}
        style={[
          styles.field,
          disabled && styles.fieldDisabled,
          hasError && styles.fieldError,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <View style={{ flex: 1 }}>{renderTagSummary()}</View>

        {clearable && !disabled && (multiple ? selectedItems.length > 0 : value !== null && value !== undefined) ? (
          <Pressable onPress={clear} hitSlop={10} style={styles.clearBtn}>
            <Text style={styles.clearText}>清空</Text>
          </Pressable>
        ) : null}

        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {(helperText || errorText) ? (
        <Text style={[styles.helper, hasError && styles.errorText]}>
          {hasError ? errorText : helperText}
        </Text>
      ) : null}

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={close} hitSlop={10}>
              <Text style={styles.closeText}>关闭</Text>
            </Pressable>
          </View>

          {searchable ? (
            <View style={styles.searchBox}>
              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="搜索选项..."
                placeholderTextColor="#999"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>
          ) : null}

          <FlatList
            data={filteredOptions}
            keyExtractor={(it) => String(it.value)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
          />

          {multiple ? (
            <View style={styles.footer}>
              <Pressable onPress={close} style={styles.footerBtn}>
                <Text style={styles.footerBtnText}>完成</Text>
              </Pressable>
            </View>
          ) : null}

          {Platform.OS === "ios" ? <View style={{ height: 10 }} /> : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: 8, fontSize: 14, color: "#333" },

  field: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  fieldDisabled: { opacity: 0.6, backgroundColor: "#f6f6f6" },
  fieldError: { borderColor: "#ff4d4f" },

  placeholder: { color: "#999", fontSize: 16 },
  singleText: { color: "#111", fontSize: 16 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f0f5ff",
    maxWidth: 160,
  },
  tagText: { fontSize: 13, color: "#1d39c4" },
  tagMore: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f5f5f5",
  },
  tagMoreText: { fontSize: 13, color: "#555" },

  clearBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  clearText: { fontSize: 12, color: "#1677ff" },
  chevron: { fontSize: 16, color: "#666" },

  helper: { marginTop: 6, fontSize: 12, color: "#888" },
  errorText: { color: "#ff4d4f" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 16, color: "#111", fontWeight: "600" },
  closeText: { fontSize: 14, color: "#1677ff" },

  searchBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fff",
  },

  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  optionRowSelected: { backgroundColor: "#f0f5ff" },
  optionRowDisabled: { opacity: 0.5 },
  optionLabel: { fontSize: 16, color: "#111" },
  disabledText: { color: "#777" },
  optionMark: { width: 24, textAlign: "right", color: "#999", fontSize: 16 },
  optionMarkSelected: { color: "#1677ff" },

  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#1677ff",
  },
  footerBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
```

---

## 2) 使用大全（单选 / 多选 / 搜索 / 表单 / 列表）

### 2.1 单选（最常见：性别、城市、类型）

```jsx
import React, { useState } from "react";
import { View } from "react-native";
import SelectOption from "./components/SelectOption";

export default function DemoSingle() {
  const [city, setCity] = useState(null);

  return (
    <View style={{ padding: 16 }}>
      <SelectOption
        label="所在城市"
        title="选择城市"
        value={city}
        onChange={setCity}
        options={[
          { label: "上海", value: "sh" },
          { label: "北京", value: "bj" },
          { label: "深圳", value: "sz" },
        ]}
        placeholder="请选择城市"
        clearable
      />
    </View>
  );
}
```

---

### 2.2 多选 + 标签展示（最常见：兴趣、技能、权限）

```jsx
export default function DemoMulti() {
  const [skills, setSkills] = useState(["react"]);

  return (
    <View style={{ padding: 16 }}>
      <SelectOption
        label="技能标签"
        title="选择技能"
        multiple
        value={skills}
        onChange={setSkills}
        maxTagCount={3}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
          { label: "RN", value: "rn" },
          { label: "Node.js", value: "node" },
          { label: "TypeScript", value: "ts" },
        ]}
        placeholder="请选择技能"
      />
    </View>
  );
}
```

> 多选模式下：点击选项会 toggle；点击“完成”关闭弹窗。

---

### 2.3 带搜索（长列表必备：国家、学校、品类）

```jsx
<SelectOption
  label="选择国家"
  title="国家"
  value={country}
  onChange={setCountry}
  searchable
  options={countryOptions}
/>
```

---

### 2.4 禁用整个组件 / 禁用单个选项

```jsx
<SelectOption
  label="套餐"
  value={plan}
  onChange={setPlan}
  options={[
    { label: "基础版", value: "basic" },
    { label: "专业版（不可选）", value: "pro", disabled: true },
    { label: "旗舰版", value: "max" },
  ]}
/>
```

---

### 2.5 错误态（配合校验提示）

```jsx
const errorText = !category ? "请选择分类" : "";

<SelectOption
  label="分类"
  value={category}
  onChange={setCategory}
  errorText={errorText}
  options={categoryOptions}
/>
```

---

### 2.6 React Hook Form 集成（表单标准）

```jsx
import { Controller, useForm } from "react-hook-form";

const { control } = useForm({ defaultValues: { tags: [] } });

<Controller
  control={control}
  name="tags"
  rules={{ validate: (v) => (v?.length ? true : "至少选择一个标签") }}
  render={({ field: { value, onChange }, fieldState: { error } }) => (
    <SelectOption
      label="标签"
      multiple
      value={value}
      onChange={onChange}
      options={tagOptions}
      errorText={error?.message}
      searchable
    />
  )}
/>;
```

---

## 3) 知识点大全（SelectOption 工程化必懂）

### 3.1 为什么 RN 需要自己封装 Select

* RN 没有 Web 的 `<select>`。
* 真实项目通常采用两类方案：

  1. **自定义**：`Pressable + Modal + FlatList`（可控性强、样式统一）
  2. **第三方**：Picker/ActionSheet/BottomSheet（更快但可定制受限）

### 3.2 单选 / 多选的数据模型

* 单选：`value = string | number | null`
* 多选：`value = Array<string|number>`
* UI 的“是否选中”必须由 `selectedSet.has(item.value)` 推导（避免内部状态失真）

### 3.3 受控组件（Controlled）是关键

* `value` 与 `onChange` 由父组件持有
* 好处：

  * 表单校验与回填容易
  * 与 React Hook Form / Formik 无缝
  * 组件复用不受业务限制

### 3.4 为什么用 Modal + FlatList

* **Modal**：实现遮罩、底部弹出、点击外部关闭
* **FlatList**：长列表性能更好（虚拟列表），比 map 渲染更稳

### 3.5 搜索过滤的正确姿势

* 用 `useMemo` 基于 `keyword` + `options` 计算 `filteredOptions`
* 避免每次渲染都全量 filter（大列表会卡）

### 3.6 多选的标签展示（Tags）

* 多选选中项显示为“标签”，是移动端常见的选择反馈
* `maxTagCount` 控制展示数量，超出用 `+N` 汇总，避免 UI 被撑爆

### 3.7 关闭策略（UX 细节）

* 单选：选中立即关闭（更符合直觉）
* 多选：点选不关闭；点击“完成”关闭（避免反复打开）

### 3.8 禁用策略

* 全局禁用：组件 `disabled`
* 单项禁用：`option.disabled`
* 最终禁用：`disabled || option.disabled`

### 3.9 可扩展点（企业级组件常见演进）

* `renderOptionRight`：右侧自定义渲染（图标、描述、价格、徽标）
* `renderHeader` / `renderFooter`：自定义头尾
* 支持分组（SectionList）
* 支持异步加载（分页、远程搜索）

---

## 4) 你可能下一步会需要的“增强版本”

如果你在做后台/复杂业务，通常还会需要：

1. **级联选择**（省/市/区）
2. **分组选择**（按字母/分类）
3. **远程搜索**（输入关键字请求接口）
4. **BottomSheet 替代 Modal**（手势下拉关闭、更贴近 iOS/Android 交互）

你告诉我：你这个 SelectOption 更像 **“表单选择”** 还是 **“筛选标签（Filter）”**？我可以基于上面组件直接给你一个更贴近对应场景的版本（例如：筛选场景支持“清空/重置/确认”三按钮）。
