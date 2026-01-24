import { create } from 'zustand'

// 免费接口：用户数据
const API_BASE = 'https://jsonplaceholder.typicode.com'

// 用于取消请求，避免“后发先至”的数据乱序
let usersAbortController = null
let userAbortController = null

export const useUserStore = create((set, get) => ({
  // ===== 基础状态 =====
  users: [],
  user: null,

  // 列表请求状态
  status: 'idle', // idle | loading | success | error
  error: null,

  // 单用户请求状态
  userStatus: 'idle',
  userError: null,

  // 其他辅助状态
  lastFetchedAt: null,
  searchTerm: '',
  searchResults: [],

  // ===== 异步动作：拉取用户列表 =====
  fetchUsers: async () => {
    // 1) 取消上一次列表请求
    if (usersAbortController) usersAbortController.abort()
    usersAbortController = new AbortController()

    // 2) 进入 loading 态
    set({ status: 'loading', error: null })
    try {
      // 3) 发起请求
      const response = await fetch(`${API_BASE}/users`, {
        signal: usersAbortController.signal,
      })
      if (!response.ok) throw new Error('Fetch users failed')

      // 4) 解析数据并更新 store
      const data = await response.json()
      set({
        users: data,
        status: 'success',
        lastFetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      // 5) 如果是取消请求，不做错误处理
      if (err?.name === 'AbortError') return
      set({ status: 'error', error: err?.message ?? 'Unknown error' })
    }
  },

  // ===== 异步动作：拉取单个用户 =====
  fetchUserById: async (id) => {
    // 1) 参数校验
    const userId = Number(id)
    if (!Number.isFinite(userId)) {
      set({ userStatus: 'error', userError: 'Invalid user id' })
      return
    }

    // 2) 简单缓存：列表里有就直接用
    const cached = get().users.find((u) => u.id === userId)
    if (cached) {
      set({ user: cached, userStatus: 'success', userError: null })
      return
    }

    // 3) 取消上一次单用户请求
    if (userAbortController) userAbortController.abort()
    userAbortController = new AbortController()

    // 4) 进入 loading 态并请求
    set({ userStatus: 'loading', userError: null })
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        signal: userAbortController.signal,
      })
      if (!response.ok) throw new Error('Fetch user failed')

      // 5) 更新单个用户数据
      const data = await response.json()
      set({ user: data, userStatus: 'success' })
    } catch (err) {
      if (err?.name === 'AbortError') return
      set({ userStatus: 'error', userError: err?.message ?? 'Unknown error' })
    }
  },

  // ===== 异步动作：刷新列表（语义更清晰） =====
  refreshUsers: async () => {
    await get().fetchUsers()
  },

  // ===== 异步动作：搜索（先拉取，再本地过滤） =====
  searchUsersByName: async (term) => {
    const keyword = term.trim()
    set({ searchTerm: keyword })

    // 1) 空关键词：清空结果
    if (!keyword) {
      set({ searchResults: [] })
      return
    }

    // 2) 列表为空则先拉取
    if (get().users.length === 0) {
      await get().fetchUsers()
    }

    // 3) 本地过滤（不走网络）
    const results = get().users.filter((u) =>
      u.name.toLowerCase().includes(keyword.toLowerCase())
    )
    set({ searchResults: results })
  },

  // ===== 纯同步动作 =====
  clearSearch: () => set({ searchTerm: '', searchResults: [] }),
  clearUser: () => set({ user: null, userStatus: 'idle', userError: null }),
}))
