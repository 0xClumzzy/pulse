import { create } from 'zustand';
import type { Theme } from '../types/theme';
import type { Tab, Pane, TerminalState } from '../types/terminal';
import { catppuccinMocha } from '../themes/catppuccin-mocha';

let tabCounter = 0;

const createPane = (ptyId?: string): Pane => ({
  id: `pane-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  ptyId: ptyId || null,
});

const createTab = (): Tab => {
  tabCounter++;
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `Shell ${tabCounter}`,
    panes: [createPane()],
  };
};

interface TerminalStore extends TerminalState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
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
}

const initialTab = createTab();

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  activePaneId: initialTab.panes[0].id,
  settingsOpen: false,
  commandPaletteOpen: false,
  searchOpen: false,
  theme: catppuccinMocha,

  setTheme: (theme) => set({ theme }),

  addTab: () => {
    const newTab = createTab();
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
      activePaneId: newTab.panes[0].id,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      if (newTabs.length === 0) {
        const newTab = createTab();
        return {
          tabs: [newTab],
          activeTabId: newTab.id,
          activePaneId: newTab.panes[0].id,
        };
      }
      const activeIndex = state.tabs.findIndex((t) => t.id === id);
      const newActiveIndex = Math.min(activeIndex, newTabs.length - 1);
      return {
        tabs: newTabs,
        activeTabId: newTabs[newActiveIndex].id,
        activePaneId: newTabs[newActiveIndex].panes[0].id,
      };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),
  setActivePane: (id) => set({ activePaneId: id }),

  splitPane: (paneId, direction) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      const paneIndex = tab.panes.findIndex((p) => p.id === paneId);
      if (paneIndex === -1) return state;

      const newPane = createPane();
      const oldPane = tab.panes[paneIndex];
      const newPanes = [...tab.panes];
      newPanes[paneIndex] = {
        ...oldPane,
        direction,
        children: [oldPane, newPane],
        size: 50,
      };

      const newTabs = [...state.tabs];
      newTabs[tabIndex] = { ...tab, panes: newPanes };

      return {
        tabs: newTabs,
        activePaneId: newPane.id,
      };
    });
  },

  closePane: (paneId) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      if (tab.panes.length <= 1) {
        get().closeTab(state.activeTabId);
        return state;
      }

      const newPanes = tab.panes.filter((p) => p.id !== paneId);
      const newTabs = [...state.tabs];
      newTabs[tabIndex] = { ...tab, panes: newPanes };

      return {
        tabs: newTabs,
        activePaneId: newPanes[0]?.id || state.activePaneId,
      };
    });
  },

  updateTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, title } : t
      ),
    }));
  },

  updatePanePty: (paneId, ptyId) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === state.activeTabId
          ? {
              ...t,
              panes: t.panes.map((p) =>
                p.id === paneId ? { ...p, ptyId } : p
              ),
            }
          : t
      ),
    }));
  },

  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

  movePane: (direction) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (!tab) return state;

      const currentIndex = tab.panes.findIndex((p) => p.id === state.activePaneId);
      let newIndex = currentIndex;

      switch (direction) {
        case 'left':
        case 'up':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'right':
        case 'down':
          newIndex = Math.min(tab.panes.length - 1, currentIndex + 1);
          break;
      }

      if (newIndex !== currentIndex) {
        return { activePaneId: tab.panes[newIndex].id };
      }
      return state;
    });
  },
}));
