import { create } from 'zustand'

export const useCountStore = create((set) => ({
  count: 0,

  increment: () =>
    set((state) => ({ count: state.count + 1 })),

  decrement: () =>
    set((state) => ({ count: state.count - 1 })),

  incrementBy: (amount) =>
    set((state) => ({ count: state.count + amount })),

  decrementBy: (amount) =>
    set((state) => ({ count: state.count - amount })),

  reset: () => set({ count: 0 }),
}))
