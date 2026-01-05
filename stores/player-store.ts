import { create } from "zustand"

interface PlayerState {
  // Transposition state
  transposition: number

  // Display settings
  fontSize: number
  isAutoScroll: boolean
  autoScrollSpeed: number
  isSimplified: boolean

  // Actions
  increaseKey: () => void
  decreaseKey: () => void
  resetKey: () => void
  setTransposition: (semitones: number) => void
  setFontSize: (size: number) => void
  setIsAutoScroll: (enabled: boolean) => void
  setAutoScrollSpeed: (speed: number) => void
  toggleSimplification: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  // Initial state
  transposition: 0,
  fontSize: 16,
  isAutoScroll: false,
  autoScrollSpeed: 50,
  isSimplified: false,

  // Actions
  increaseKey: () =>
    set((state) => ({
      transposition: state.transposition + 1,
    })),

  decreaseKey: () =>
    set((state) => ({
      transposition: state.transposition - 1,
    })),

  resetKey: () =>
    set({
      transposition: 0,
    }),

  setTransposition: (semitones: number) =>
    set({
      transposition: semitones,
    }),

  setFontSize: (size: number) =>
    set({
      fontSize: size,
    }),

  setIsAutoScroll: (enabled: boolean) =>
    set({
      isAutoScroll: enabled,
    }),

  setAutoScrollSpeed: (speed: number) =>
    set({
      autoScrollSpeed: speed,
    }),

  toggleSimplification: () =>
    set((state) => ({
      isSimplified: !state.isSimplified,
    })),
}))

