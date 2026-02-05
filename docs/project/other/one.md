下面给你一个**纯 React Native（无第三方日历库）**实现的 `Calendar` 组件：支持**月视图**、**上/下月切换**、**选中日期**、**禁用日期**、**自定义渲染格子**，并且用 **TypeScript** 写好可直接拷贝用。

> 如果你用的是 Expo / RN CLI 都可以。样式用 `StyleSheet`，不依赖 `nativewind`。

---

## Calendar.tsx（可直接用）

```tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
} from "react-native";

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

export type CalendarProps = {
  /** 受控：当前选中日期 */
  value?: Date | null;
  /** 非受控：默认选中日期 */
  defaultValue?: Date | null;
  /** 选中变化回调 */
  onChange?: (date: Date) => void;

  /** 受控：当前展示的月份（以该 Date 所在月为准） */
  month?: Date;
  /** 非受控：默认展示月份 */
  defaultMonth?: Date;
  /** 月份切换回调 */
  onMonthChange?: (month: Date) => void;

  /** 周起始日：0=周日, 1=周一 */
  weekStartsOn?: 0 | 1;

  /** 最小/最大可选日期 */
  minDate?: Date;
  maxDate?: Date;

  /** 禁用某些日期（返回 true 表示禁用） */
  isDateDisabled?: (date: Date) => boolean;

  /** 自定义某天渲染（高级） */
  renderDay?: (params: {
    date: Date;
    inCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    disabled: boolean;
  }) => React.ReactNode;

  /** 容器样式 */
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;

  /** 星期标题样式 */
  weekdayTextStyle?: TextStyle;

  /** 日期格子样式 */
  dayCellStyle?: ViewStyle;
  dayTextStyle?: TextStyle;

  /** 选中样式 */
  selectedDayCellStyle?: ViewStyle;
  selectedDayTextStyle?: TextStyle;

  /** 非本月日期样式 */
  outsideMonthTextStyle?: TextStyle;

  /** 禁用样式 */
  disabledDayTextStyle?: TextStyle;

  /** 今天样式（未选中时） */
  todayRingStyle?: ViewStyle;

  /** 是否显示非本月日期（默认 true） */
  showOutsideDays?: boolean;
};

const WEEKDAYS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBeforeDay(a: Date, b: Date) {
  // compare by yyyy-mm-dd
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aa < bb;
}
function isAfterDay(a: Date, b: Date) {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aa > bb;
}
function formatMonthTitle(d: Date) {
  // 你也可以换成中文：`${d.getFullYear()}年${d.getMonth() + 1}月`
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildMonthGrid(month: Date, weekStartsOn: 0 | 1): DayCell[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  // JS: 0=Sun..6=Sat
  const startDow = start.getDay();
  const offset = weekStartsOn === 0 ? startDow : (startDow + 6) % 7;

  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - offset);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      date: d,
      inCurrentMonth: d.getMonth() === month.getMonth(),
    });
  }

  // 如果该月正好只需要 35 格，你可以做裁剪；这里固定 42 格更稳定
  // （UI 上更一致，尤其是带 header 的布局）
  return cells;
}

export function Calendar({
  value,
  defaultValue = null,
  onChange,

  month,
  defaultMonth,
  onMonthChange,

  weekStartsOn = 1,

  minDate,
  maxDate,
  isDateDisabled,

  renderDay,

  style,
  headerStyle,
  headerTextStyle,
  weekdayTextStyle,

  dayCellStyle,
  dayTextStyle,
  selectedDayCellStyle,
  selectedDayTextStyle,
  outsideMonthTextStyle,
  disabledDayTextStyle,
  todayRingStyle,

  showOutsideDays = true,
}: CalendarProps) {
  const [innerSelected, setInnerSelected] = useState<Date | null>(defaultValue);
  const [innerMonth, setInnerMonth] = useState<Date>(
    defaultMonth ? startOfMonth(defaultMonth) : startOfMonth(new Date())
  );

  const selected = value !== undefined ? value : innerSelected;
  const currentMonth = month !== undefined ? startOfMonth(month) : innerMonth;

  const weekdays = weekStartsOn === 0 ? WEEKDAYS_SUN : WEEKDAYS_MON;

  const data = useMemo(
    () => buildMonthGrid(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn]
  );

  const today = useMemo(() => new Date(), []);

  const goMonth = (delta: number) => {
    const next = addMonths(currentMonth, delta);
    if (month === undefined) setInnerMonth(next);
    onMonthChange?.(next);
  };

  const commitSelect = (d: Date) => {
    if (value === undefined) setInnerSelected(d);
    onChange?.(d);
  };

  const isDisabled = (d: Date) => {
    if (minDate && isBeforeDay(d, minDate)) return true;
    if (maxDate && isAfterDay(d, maxDate)) return true;
    if (isDateDisabled?.(d)) return true;
    return false;
  };

  const renderCell = ({ item }: { item: DayCell }) => {
    const { date, inCurrentMonth } = item;

    if (!showOutsideDays && !inCurrentMonth) {
      return <View style={[styles.dayCell, dayCellStyle]} />;
    }

    const disabled = isDisabled(date) || !inCurrentMonth; // 常见做法：非本月默认不可选
    const isSel = !!selected && isSameDay(date, selected);
    const isTod = isSameDay(date, today);

    if (renderDay) {
      return (
        <View style={[styles.dayCell, dayCellStyle]}>
          {renderDay({
            date,
            inCurrentMonth,
            isToday: isTod,
            isSelected: isSel,
            disabled,
          })}
        </View>
      );
    }

    return (
      <View style={[styles.dayCell, dayCellStyle]}>
        <Pressable
          onPress={() => commitSelect(date)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.dayButton,
            isSel && styles.daySelected,
            isSel && selectedDayCellStyle,
            !isSel && isTod && styles.todayRing,
            !isSel && isTod && todayRingStyle,
            pressed && !disabled && styles.dayPressed,
            disabled && styles.dayDisabled,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              dayTextStyle,
              isSel && styles.dayTextSelected,
              isSel && selectedDayTextStyle,
              !inCurrentMonth && styles.outsideMonthText,
              !inCurrentMonth && outsideMonthTextStyle,
              disabled && styles.disabledDayText,
              disabled && disabledDayTextStyle,
            ]}
          >
            {date.getDate()}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={[styles.header, headerStyle]}>
        <Pressable onPress={() => goMonth(-1)} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>

        <Text style={[styles.headerText, headerTextStyle]}>
          {formatMonthTitle(currentMonth)}
        </Text>

        <Pressable onPress={() => goMonth(1)} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Weekdays */}
      <View style={styles.weekdaysRow}>
        {weekdays.map((w) => (
          <Text key={w} style={[styles.weekdayText, weekdayTextStyle]}>
            {w}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={data}
        keyExtractor={(it) => it.date.toISOString()}
        numColumns={7}
        scrollEnabled={false}
        renderItem={renderCell}
      />
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
  },
  navBtn: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  navText: {
    fontSize: 22,
    fontWeight: "700",
  },

  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  weekdayText: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
  },

  dayCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayButton: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPressed: {
    opacity: 0.7,
  },
  dayDisabled: {
    opacity: 0.35,
  },

  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },

  daySelected: {
    // 不指定颜色，避免和你的主题冲突；你可在 props 里覆盖 selectedDayCellStyle
    transform: [{ scale: 1.02 }],
  },
  dayTextSelected: {
    fontWeight: "800",
  },

  outsideMonthText: {
    opacity: 0.35,
  },
  disabledDayText: {
    opacity: 0.5,
  },

  todayRing: {
    borderWidth: 1,
  },
});
```

---

## 用法示例

```tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import { Calendar } from "./Calendar";

export default function Demo() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Calendar
        value={date}
        onChange={setDate}
        weekStartsOn={1}
        minDate={new Date(2020, 0, 1)}
        isDateDisabled={(d) => d.getDay() === 0} // 禁用周日
        selectedDayCellStyle={{ backgroundColor: "black" }}
        selectedDayTextStyle={{ color: "white" }}
        todayRingStyle={{ borderColor: "black" }}
      />

      <Text>
        Selected: {date ? date.toDateString() : "none"}
      </Text>
    </View>
  );
}
```

---

## 下一步我建议你加的能力（我也可以继续给你写）

1. **范围选择（start/end）**：酒店/打卡常用
2. **标记点（dots）/事件数量**：日程类
3. **可滚动多月（上下滑）**：更像系统日历
4. **非本月日期可点击**：点击后自动跳转到对应月
5. **国际化：中文星期 / 月份标题**

你想做哪一种：**“单选”**、**“范围选择”**，还是**“带事件标记的日历”**？我可以在这个基础上直接扩展。
v