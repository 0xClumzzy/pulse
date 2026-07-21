import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Theme } from '../types/theme';
import { catppuccinMocha } from '../themes/catppuccin-mocha';

interface ThemeStore {
  theme: Theme;
  initTheme: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

const getSavedTheme = async (): Promise<Theme> => {
  try {
    const saved = await invoke<string>('load_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load saved theme:', e);
  }
  return catppuccinMocha;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: catppuccinMocha,

  initTheme: async () => {
    const saved = await getSavedTheme();
    set({ theme: saved });
  },

  setTheme: (theme) => {
    invoke('save_config', { theme: JSON.stringify(theme) }).catch((e) =>
      console.error('Failed to save theme:', e)
    );
    set({ theme });
  },

  zoomIn: () => {
    const state = get();
    const newFontSize = Math.min(state.theme.font.size + 2, 72);
    const newTheme = { ...state.theme, font: { ...state.theme.font, size: newFontSize } };
    invoke('save_config', { theme: JSON.stringify(newTheme) }).catch((e) =>
      console.error('Failed to save theme:', e)
    );
    set({ theme: newTheme });
  },

  zoomOut: () => {
    const state = get();
    const newFontSize = Math.max(state.theme.font.size - 2, 8);
    const newTheme = { ...state.theme, font: { ...state.theme.font, size: newFontSize } };
    invoke('save_config', { theme: JSON.stringify(newTheme) }).catch((e) =>
      console.error('Failed to save theme:', e)
    );
    set({ theme: newTheme });
  },

  zoomReset: () => {
    const state = get();
    const newTheme = { ...state.theme, font: { ...state.theme.font, size: 17 } };
    invoke('save_config', { theme: JSON.stringify(newTheme) }).catch((e) =>
      console.error('Failed to save theme:', e)
    );
    set({ theme: newTheme });
  },
}));
