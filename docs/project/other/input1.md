下面给你一套**可直接跑起来的 RN 搜索组件 + 搜索建议列表 + 点击进入详情页**示例，后端用开源的 **DummyJSON 产品 API** 代替：支持 `/products/search?q=` 搜索、`/products/:id` 取详情。([DummyJSON][1])

> 设计点：
>
> * 输入框 **实时列出相关条目**（debounce 防抖）
> * 支持 **并发保护**（只采纳最后一次请求结果）
> * 点击条目 **navigate 到详情页**（React Navigation）

---

## 0) 依赖安装（React Navigation）

```bash
npm i @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

> 如果你不是 Expo（RN CLI），安装方式略有不同，但代码结构一致。

---

## 1) 文件结构建议

```
src/
  api/
    dummyjson.ts
  hooks/
    useDebouncedValue.ts
  screens/
    SearchScreen.tsx
    ProductDetailScreen.tsx
  navigation/
    AppNavigator.tsx
App.tsx
```

---

## 2) API 封装（DummyJSON）

`src/api/dummyjson.ts`

```ts
export type Product = {
  id: number
  title: string
  description: string
  price: number
  thumbnail?: string
  images?: string[]
  brand?: string
  category?: string
}

type SearchResponse = {
  products: Product[]
  total: number
  skip: number
  limit: number
}

const BASE = 'https://dummyjson.com'

export async function searchProducts(q: string, limit = 10): Promise<Product[]> {
  // DummyJSON: /products/search?q=... (支持 query 搜索) :contentReference[oaicite:1]{index=1}
  const url = `${BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data: SearchResponse = await res.json()
  return data.products ?? []
}

export async function getProductById(id: number): Promise<Product> {
  // DummyJSON: /products/:id :contentReference[oaicite:2]{index=2}
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error(`Get product failed: ${res.status}`)
  return res.json()
}
```

---

## 3) 防抖 Hook（实时搜索必备）

`src/hooks/useDebouncedValue.ts`

```ts
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
```

---

## 4) 搜索页：实时列出相关条目 + 点击跳转

`src/screens/SearchScreen.tsx`

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { Product, searchProducts } from '../api/dummyjson'
import type { RootStackParamList } from '../navigation/AppNavigator'

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>

export default function SearchScreen() {
  const navigation = useNavigation<Nav>()

  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350)

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 并发保护：只接受最后一次请求返回
  const requestSeq = useRef(0)

  const canSearch = useMemo(() => debouncedKeyword.length >= 2, [debouncedKeyword])

  useEffect(() => {
    if (!canSearch) {
      setItems([])
      setError(null)
      setLoading(false)
      return
    }

    let alive = true
    const seq = ++requestSeq.current

    setLoading(true)
    setError(null)

    searchProducts(debouncedKeyword, 12)
      .then((list) => {
        // 只采纳最后一次请求结果
        if (!alive) return
        if (seq !== requestSeq.current) return
        setItems(list)
      })
      .catch((e: unknown) => {
        if (!alive) return
        if (seq !== requestSeq.current) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setItems([])
      })
      .finally(() => {
        if (!alive) return
        if (seq !== requestSeq.current) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [debouncedKeyword, canSearch])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>搜索产品</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="输入关键词（至少 2 个字符）"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.input}
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator /> : null}
      </View>

      {error ? <Text style={styles.error}>请求失败：{error}</Text> : null}

      {!canSearch ? (
        <Text style={styles.hint}>开始输入以显示建议条目…</Text>
      ) : items.length === 0 && !loading ? (
        <Text style={styles.hint}>没有匹配结果</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  ¥{item.price} · {item.brand ?? 'Unknown brand'} · {item.category ?? 'Unknown category'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 16 },
  error: { marginTop: 10, color: '#c00' },
  hint: { marginTop: 14, color: '#666' },
  sep: { height: 1, backgroundColor: '#eee', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  rowPressed: { backgroundColor: '#f5f5f5' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { marginTop: 4, color: '#666' },
  chevron: { fontSize: 24, color: '#999', paddingLeft: 10 },
})
```

---

## 5) 产品详情页（点击条目进入内容界面）

`src/screens/ProductDetailScreen.tsx`

```tsx
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { getProductById, Product } from '../api/dummyjson'

type R = RouteProp<RootStackParamList, 'ProductDetail'>

export default function ProductDetailScreen() {
  const route = useRoute<R>()
  const { id } = route.params

  const [data, setData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    getProductById(id)
      .then((p) => {
        if (!alive) return
        setData(p)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>加载中…</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#c00' }}>加载失败：{error ?? 'No data'}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.meta}>¥{data.price} · {data.brand ?? 'Unknown brand'}</Text>
      <Text style={styles.desc}>{data.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800' },
  meta: { marginTop: 10, color: '#666' },
  desc: { marginTop: 14, fontSize: 16, lineHeight: 22 },
})
```

---

## 6) 导航配置（Stack）

`src/navigation/AppNavigator.tsx`

```tsx
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SearchScreen from '../screens/SearchScreen'
import ProductDetailScreen from '../screens/ProductDetailScreen'

export type RootStackParamList = {
  Search: undefined
  ProductDetail: { id: number }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detail' }} />
    </Stack.Navigator>
  )
}
```

`App.tsx`

```tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}
```

---

## 7) 这套组件已经满足你的需求点

* ✅ “搜索组件” = `SearchScreen`（输入 + 建议列表）
* ✅ “实时列出相关条目” = debounce + `/products/search`
* ✅ “点击条目进入内容界面” = `navigate('ProductDetail', { id })`
* ✅ “后端接口用开源 API” = DummyJSON 产品接口 ([DummyJSON][1])

---

## 可选增强（你下一步很可能需要）

如果你要更“电商感”，我可以继续帮你加：

* 搜索历史（AsyncStorage）
* 高亮匹配关键词
* 空状态/错误状态更精致
* 详情页展示图片轮播（用 `data.images`）
* React Query/RTK Query 缓存与自动重试

你现在项目是 **Expo Router** 还是 **React Navigation Stack**？如果你用 Expo Router，我可以把跳转写成 `router.push(`/product/${id}`)` 的版本。

[1]: https://dummyjson.com/docs/products?utm_source=chatgpt.com "Free Fake REST API for Placeholder JSON Data"
