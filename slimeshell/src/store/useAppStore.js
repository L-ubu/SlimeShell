import { create } from 'zustand'

export const useAppStore = create((set) => ({
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  clipboardHistory: [],
  addToClipboard: (item) => set((state) => ({
    clipboardHistory: [
      { content: item.content, source: item.source, timestamp: Date.now() },
      ...state.clipboardHistory,
    ].slice(0, 100),
  })),

  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [{ ...notification, id: Date.now(), read: false }, ...state.notifications],
  })),
}))
