import { create } from 'zustand';

let toastId = 0;

const useToasts = create((set) => ({
  toasts: [],

  addToast: ({ type = 'success', message, duration = 3000 }) => {
    const id = ++toastId;
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export default useToasts;
