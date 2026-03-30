import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultActive = null;

const useCtfStore = create(
  persist(
    (set, get) => ({
      activeCTF: defaultActive,

      startCTF: ({
        name,
        endTime = null,
        startTime,
        totalChallenges = 0,
        teamName = '',
        formatTags = [],
        difficulty = 3,
      }) =>
        set({
          activeCTF: {
            name,
            endTime: endTime != null ? Number(endTime) : null,
            startTime: startTime != null ? Number(startTime) : Date.now(),
            totalChallenges,
            solvedChallenges: 0,
            categories: [],
            flags: [],
            teamName,
            formatTags: Array.isArray(formatTags) ? formatTags : [],
            difficulty: Number(difficulty) || 3,
          },
        }),

      clearCTF: () => set({ activeCTF: null }),

      updateActiveMeta: (partial) =>
        set((s) => {
          if (!s.activeCTF) return s;
          return {
            activeCTF: { ...s.activeCTF, ...partial },
          };
        }),

      addFlag: (flag) =>
        set((s) => {
          if (!s.activeCTF) return s;
          const categories = [...s.activeCTF.categories];
          const existing = categories.find((c) => c.label === flag.category);
          if (existing) existing.count += 1;
          else categories.push({ label: flag.category, count: 1 });
          return {
            activeCTF: {
              ...s.activeCTF,
              solvedChallenges: s.activeCTF.solvedChallenges + 1,
              categories,
              flags: [...s.activeCTF.flags, flag],
            },
          };
        }),

      getTimeLeft: () => {
        const ctf = get().activeCTF;
        if (!ctf?.endTime) return null;
        const diff = ctf.endTime - Date.now();
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      },
    }),
    {
      name: 'slimeshell-ctf',
      partialize: (state) => ({ activeCTF: state.activeCTF }),
    },
  ),
);

export default useCtfStore;
