import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let nextId = Date.now();

const SEED_NOTIFICATIONS = [
  { id: 1, type: 'info', title: 'Welcome to SlimeShell', message: 'All tools are ready. Press Cmd+K to search.', time: Date.now() - 60000, read: false },
  { id: 2, type: 'success', title: 'CTF Tracker loaded', message: '6 challenges imported from HackTheBox Cyber Apocalypse.', time: Date.now() - 300000, read: false },
  { id: 3, type: 'warning', title: 'Flipper firmware update', message: 'Flipper Zero firmware 0.98.2 is available. Check releases.', time: Date.now() - 3600000, read: false },
  { id: 4, type: 'info', title: 'New payloads added', message: '88 payloads across 6 categories are ready to use.', time: Date.now() - 7200000, read: true },
  { id: 5, type: 'success', title: 'Scripts synced', message: '12 scripts loaded into the script library.', time: Date.now() - 86400000, read: true },
];

const useNotifications = create(
  persist(
    (set) => ({
      notifications: SEED_NOTIFICATIONS,
      panelOpen: false,

      togglePanel: () => set(s => ({ panelOpen: !s.panelOpen })),
      openPanel: () => set({ panelOpen: true }),
      closePanel: () => set({ panelOpen: false }),

      addNotification: ({ type = 'info', title, message }) => set(s => ({
        notifications: [
          { id: nextId++, type, title, message, time: Date.now(), read: false },
          ...s.notifications,
        ].slice(0, 50),
      })),

      markRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),

      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),

      removeNotification: (id) => set(s => ({
        notifications: s.notifications.filter(n => n.id !== id),
      })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'slimeshell-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);

export default useNotifications;
