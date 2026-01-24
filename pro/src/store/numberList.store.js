import { create } from 'zustand'

export const useNumberListStore = create((set) => ({
  numbers: [1, 2, 3],

  addNumber: (num) =>
    set((state) => ({
      numbers: [...state.numbers, num],
    })),

  addRandom: () =>
    set((state) => ({
      numbers: [...state.numbers, Math.floor(Math.random() * 100)],
    })),

  removeLast: () =>
    set((state) => ({
      numbers: state.numbers.slice(0, -1),
    })),

  clear: () => set({ numbers: [] }),
}))
