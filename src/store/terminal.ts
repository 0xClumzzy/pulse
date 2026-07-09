import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Theme } from '../types/theme';
import type { Tab, Pane, TerminalState } from '../types/terminal';
import { catppuccinMocha } from '../themes/catppuccin-mocha';

let tabCounter = 0;

const createPane = (ptyId?: string): Pane => ({
  id: `pane-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ptyId: ptyId || null,
});

const createTab = (): Tab => {
  tabCounter++;
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    title: `Shell ${tabCounter}`,
    panes: [createPane()],
  };
};

const getLeafPanes = (pane: Pane): Pane[] => {
  if (!pane.children || pane.children.length === 0) {
    return [pane];
  }
  return pane.children.flatMap(getLeafPanes);
};

// Helper to close all PTY sessions for panes in a tab
const closePanesInTab = (panes: Pane[]) => {
  for (const pane of panes) {
    if (pane.ptyId) {
      invoke('pty_close', { id: pane.ptyId }).catch((e: unknown) =>
        console.warn('Failed to close PTY:', e)
      );
    }
    if (pane.children) {
      closePanesInTab(pane.children);
    }
  }
};

const splitPaneInTree = (
  panes: Pane[],
  targetId: string,
  newPane: Pane,
  direction: 'horizontal' | 'vertical'
): boolean => {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.id === targetId) {
      const oldPaneCopy = { ...pane };
      panes[i] = {
        id: `pane-parent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        ptyId: null,
        direction,
        children: [oldPaneCopy, newPane],
        size: 50,
      };
      return true;
    }
    if (pane.children) {
      const childrenCopy = [...pane.children];
      if (splitPaneInTree(childrenCopy, targetId, newPane, direction)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
};

const closePaneInTree = (
  panes: Pane[],
  targetId: string,
  onClosedPty: (ptyId: string) => void
): boolean => {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.children) {
      const targetIndex = pane.children.findIndex((c) => c.id === targetId);
      if (targetIndex !== -1) {
        const removedPane = pane.children[targetIndex];
        if (removedPane.ptyId) {
          onClosedPty(removedPane.ptyId);
        }
        if (removedPane.children) {
          closePanesInTab(removedPane.children);
        }
        const remainingIndex = targetIndex === 0 ? 1 : 0;
        panes[i] = pane.children[remainingIndex];
        return true;
      }

      const childrenCopy = [...pane.children];
      if (closePaneInTree(childrenCopy, targetId, onClosedPty)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
};

const updatePanePtyInTree = (panes: Pane[], paneId: string, ptyId: string): boolean => {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.id === paneId) {
      panes[i] = { ...pane, ptyId };
      return true;
    }
    if (pane.children) {
      const childrenCopy = [...pane.children];
      if (updatePanePtyInTree(childrenCopy, paneId, ptyId)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
};

interface TerminalStore extends TerminalState {
  theme: Theme;
  cosmicText: boolean;
  initTheme: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  toggleCosmicText: () => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setActivePane: (id: string) => void;
  splitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void;
  closePane: (paneId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updatePanePty: (paneId: string, ptyId: string) => void;
  toggleSettings: () => void;
  toggleCommandPalette: () => void;
  toggleSearch: () => void;
  movePane: (direction: 'left' | 'right' | 'up' | 'down') => void;
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

const initialTab = createTab();

const initialTheme = catppuccinMocha;

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  activePaneId: initialTab.panes[0].id,
  settingsOpen: false,
  commandPaletteOpen: false,
  searchOpen: false,
  theme: initialTheme,
  cosmicText: false,

  initTheme: async () => {
    const saved = await getSavedTheme();
    set({ theme: saved });
  },

  toggleCosmicText: () => set((state) => ({ cosmicText: !state.cosmicText })),

  setTheme: (theme) => {
    invoke('save_config', { theme: JSON.stringify(theme) }).catch((e) =>
      console.error('Failed to save theme:', e)
    );
    set({ theme });
  },

  addTab: () => {
    const newTab = createTab();
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
      activePaneId: newTab.panes[0].id,
    }));
  },

  closeTab: (id) => {
    const state = get();
    const tabToClose = state.tabs.find((t) => t.id === id);
    if (tabToClose) {
      closePanesInTab(tabToClose.panes);
    }

    const newTabs = state.tabs.filter((t) => t.id !== id);
    if (newTabs.length === 0) {
      const newTab = createTab();
      set({
        tabs: [newTab],
        activeTabId: newTab.id,
        activePaneId: newTab.panes[0].id,
      });
      return;
    }
    const activeIndex = state.tabs.findIndex((t) => t.id === id);
    const newActiveIndex = Math.min(activeIndex, newTabs.length - 1);
    set({
      tabs: newTabs,
      activeTabId: state.activeTabId === id ? newTabs[newActiveIndex].id : state.activeTabId,
      activePaneId: state.activeTabId === id ? newTabs[newActiveIndex].panes[0].id : state.activePaneId,
    });
  },

  setActiveTab: (id) => {
    set((state) => {
      const targetTab = state.tabs.find((t) => t.id === id);
      if (!targetTab) return state;
      const leafPanes = getLeafPanes(targetTab.panes[0]);
      return {
        activeTabId: id,
        activePaneId: leafPanes[0]?.id || state.activePaneId,
      };
    });
  },

  setActivePane: (id) => set({ activePaneId: id }),

  splitPane: (paneId, direction) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      const newPane = createPane();
      const panesCopy = [...tab.panes];

      if (splitPaneInTree(panesCopy, paneId, newPane, direction)) {
        const newTabs = [...state.tabs];
        newTabs[tabIndex] = { ...tab, panes: panesCopy };
        return {
          tabs: newTabs,
          activePaneId: newPane.id,
        };
      }
      return state;
    });
  },

  closePane: (paneId) => {
    const state = get();
    const tabIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
    if (tabIndex === -1) return;

    const tab = state.tabs[tabIndex];
    const leafPanes = getLeafPanes(tab.panes[0]);

    if (leafPanes.length <= 1) {
      get().closeTab(state.activeTabId);
      return;
    }

    const panesCopy = [...tab.panes];
    const handleClosedPty = (ptyId: string) => {
      invoke('pty_close', { id: ptyId }).catch((e: unknown) =>
        console.warn('Failed to close PTY:', e)
      );
    };

    if (closePaneInTree(panesCopy, paneId, handleClosedPty)) {
      const newTabs = [...state.tabs];
      newTabs[tabIndex] = { ...tab, panes: panesCopy };
      const newLeafPanes = getLeafPanes(panesCopy[0]);

      set({
        tabs: newTabs,
        activePaneId: newLeafPanes[0]?.id || state.activePaneId,
      });
    }
  },

  updateTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, title } : t
      ),
    }));
  },

  updatePanePty: (paneId, ptyId) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      const panesCopy = [...tab.panes];
      if (updatePanePtyInTree(panesCopy, paneId, ptyId)) {
        const newTabs = [...state.tabs];
        newTabs[tabIndex] = { ...tab, panes: panesCopy };
        return { tabs: newTabs };
      }
      return state;
    });
  },

  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

  movePane: (direction) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (!tab || tab.panes.length === 0) return state;

      const leafPanes = getLeafPanes(tab.panes[0]);
      const currentIndex = leafPanes.findIndex((p) => p.id === state.activePaneId);
      if (currentIndex === -1) return state;

      let newIndex = currentIndex;
      switch (direction) {
        case 'left':
        case 'up':
          newIndex = (currentIndex - 1 + leafPanes.length) % leafPanes.length;
          break;
        case 'right':
        case 'down':
          newIndex = (currentIndex + 1) % leafPanes.length;
          break;
      }

      return { activePaneId: leafPanes[newIndex].id };
    });
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
