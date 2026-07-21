import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { Tab, Pane, TerminalState, HostTag, HostEnvironment } from '../types/terminal';
import { useThemeStore } from './theme';
import { useReconStore } from './recon';

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

export type PayloadEncodeMode = 'none' | 'base64' | 'url';
export type PaletteTab = 'commands' | 'payloads';

export function getActivePtyId(state: TerminalStore): string | null {
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  if (!tab) return null;
  const findPane = (panes: Pane[], id: string): Pane | null => {
    for (const p of panes) {
      if (p.id === id) return p;
      if (p.children) {
        const found = findPane(p.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const pane = findPane(tab.panes, state.activePaneId);
  return pane?.ptyId || null;
}

interface TerminalStore extends TerminalState {
  cosmicText: boolean;
  clipboardAllowed: Record<string, boolean>;
  hostTags: Record<string, HostTag>;
  payloadEncodeMode: PayloadEncodeMode;
  commandPaletteInitialTab: PaletteTab;
  lhost: string;
  lport: string;
  target: string;
  payloadPaletteOpen: boolean;
  toggleCosmicText: () => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setActivePane: (id: string) => void;
  splitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void;
  closePane: (paneId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updatePanePty: (paneId: string, ptyId: string) => void;
  setHostTag: (tabId: string, environment: HostEnvironment) => void;
  toggleSettings: () => void;
  toggleCommandPalette: () => void;
  openCommandPalette: (tab: PaletteTab) => void;
  toggleSearch: () => void;
  togglePayloadPalette: () => void;
  toggleClipboard: (ptyId: string) => void;
  movePane: (direction: 'left' | 'right' | 'up' | 'down') => void;
  setPayloadEncodeMode: (mode: PayloadEncodeMode) => void;
  setLhost: (val: string) => void;
  setLport: (val: string) => void;
  setTarget: (val: string) => void;
  writeToActiveTerminal: (data: string) => void;
}

const initialTab = createTab();

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  activePaneId: initialTab.panes[0].id,
  settingsOpen: false,
  commandPaletteOpen: false,
  searchOpen: false,
  payloadPaletteOpen: false,
  cosmicText: false,
  clipboardAllowed: {},
  hostTags: {},
  payloadEncodeMode: 'none',
  commandPaletteInitialTab: 'commands',
  lhost: '',
  lport: '',
  target: '',

  toggleCosmicText: () => set((state) => ({ cosmicText: !state.cosmicText })),

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
      getCurrentWindow().close();
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
    const findPaneInTab = (panes: Pane[], targetId: string): boolean => {
      for (const pane of panes) {
        if (pane.id === targetId) return true;
        if (pane.children && findPaneInTab(pane.children, targetId)) return true;
      }
      return false;
    };

    const tabIndex = state.tabs.findIndex((t) => findPaneInTab(t.panes, paneId));
    if (tabIndex === -1) return;

    const tab = state.tabs[tabIndex];
    const leafPanes = getLeafPanes(tab.panes[0]);

    if (leafPanes.length <= 1) {
      get().closeTab(tab.id);
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

      const newActivePaneId = newLeafPanes[0]?.id || state.activePaneId;
      const newActiveTabId = newTabs[newTabs.length - 1]?.id || state.activeTabId;

      set({
        tabs: newTabs,
        activeTabId: tab.id === state.activeTabId ? newActiveTabId : state.activeTabId,
        activePaneId: state.activePaneId === paneId ? newActivePaneId : state.activePaneId,
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

  setHostTag: (tabId, environment) => {
    const tagMap: Record<HostEnvironment, { color: string; label: string }> = {
      prod: { color: '#f38ba8', label: 'PROD' },
      staging: { color: '#fab387', label: 'STAGE' },
      dev: { color: '#a6e3a1', label: 'DEV' },
      ctf: { color: '#cba6f7', label: 'CTF' },
      homelab: { color: '#89dceb', label: 'HOME' },
      unknown: { color: '#6c7086', label: '' },
    };
    const tag: HostTag = { environment, ...tagMap[environment] };
    set((state) => ({
      hostTags: { ...state.hostTags, [tabId]: tag },
    }));
  },

  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  openCommandPalette: (tab) =>
    set({ commandPaletteOpen: true, commandPaletteInitialTab: tab }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  togglePayloadPalette: () => set((state) => ({ payloadPaletteOpen: !state.payloadPaletteOpen })),

  toggleClipboard: (ptyId) =>
    set((state) => ({
      clipboardAllowed: {
        ...state.clipboardAllowed,
        [ptyId]: !state.clipboardAllowed[ptyId],
      },
    })),

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

  setPayloadEncodeMode: (mode) => set({ payloadEncodeMode: mode }),
  setLhost: (val) => set({ lhost: val }),
  setLport: (val) => set({ lport: val }),
  setTarget: (val) => set({ target: val }),

  writeToActiveTerminal: (data) => {
    const state = get();
    const ptyId = getActivePtyId(state);
    if (!ptyId) return;
    let payload = data;
    if (state.payloadEncodeMode === 'base64') {
      try {
        payload = btoa(data);
      } catch {
        payload = data;
      }
    } else if (state.payloadEncodeMode === 'url') {
      try {
        payload = encodeURIComponent(data);
      } catch {
        payload = data;
      }
    }
    invoke('pty_write', { id: ptyId, data: payload }).catch((e: unknown) =>
      console.warn('Failed to write to terminal:', e)
    );
  },
}));
