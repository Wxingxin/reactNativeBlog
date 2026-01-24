import { create } from 'zustand'

export const useObjectListStore = create((set) => ({
  list: [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
  ],

  addItem: (item) =>
    set((state) => ({
      list: [...state.list, item],
    })),

  addByName: (name) =>
    set((state) => {
      const maxId = state.list.reduce(
        (max, item) => (item.id > max ? item.id : max),
        0
      )
      return {
        list: [...state.list, { id: maxId + 1, name }],
      }
    }),

  removeById: (id) =>
    set((state) => ({
      list: state.list.filter((item) => item.id !== id),
    })),

  clear: () => set({ list: [] }),
}))
