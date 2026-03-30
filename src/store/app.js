import { create } from "zustand";
import { persist } from "zustand/middleware";

function applyAccentColor(color) {
  const el = document.documentElement.style;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  el.setProperty("--color-mint", color);
  el.setProperty(
    "--color-mint-dark",
    `rgb(${Math.round(r * 0.8)},${Math.round(g * 0.8)},${Math.round(b * 0.8)})`,
  );
  el.setProperty("--accent", color);
  el.setProperty("--accent-rgb", `${r},${g},${b}`);
}

const FONT_SCALES = { small: 0.9, default: 1, large: 1.15 };

function applyFontSize(size) {
  document.documentElement.style.setProperty(
    "--font-scale",
    FONT_SCALES[size] ?? 1,
  );
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      lhost: "10.10.14.1",
      lport: "4444",
      username: "MrGreenSlime",
      shellPreference: "/bin/bash",
      setLhost: (lhost) => set({ lhost }),
      setLport: (lport) => set({ lport }),
      setUsername: (username) => set({ username }),
      setShellPreference: (shellPreference) => set({ shellPreference }),

      recentTools: [],
      addRecentTool: (path, label) =>
        set((state) => {
          const filtered = state.recentTools.filter((t) => t.path !== path);
          return {
            recentTools: [
              { path, label, timestamp: Date.now() },
              ...filtered,
            ].slice(0, 8),
          };
        }),

      favorites: [],
      toggleFavorite: (path) =>
        set((state) => ({
          favorites: state.favorites.includes(path)
            ? state.favorites.filter((f) => f !== path)
            : [...state.favorites, path],
        })),
      isFavorite: (path) => get().favorites.includes(path),

      accentColor: "#6EE7B7",
      setAccentColor: (color) => {
        set({ accentColor: color });
        applyAccentColor(color);
      },

      fontSize: "default",
      setFontSize: (size) => {
        set({ fontSize: size });
        applyFontSize(size);
      },

      hasSeenOnboarding: false,
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
    }),
    {
      name: "slimeshell-app",
      onRehydrateStorage: () => (state) => {
        if (state?.accentColor) applyAccentColor(state.accentColor);
        if (state?.fontSize) applyFontSize(state.fontSize);
      },
      partialize: (state) => ({
        lhost: state.lhost,
        lport: state.lport,
        username: state.username,
        shellPreference: state.shellPreference,
        recentTools: state.recentTools,
        favorites: state.favorites,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
