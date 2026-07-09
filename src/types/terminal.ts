export interface Tab {
  id: string;
  title: string;
  panes: Pane[];
}

export interface Pane {
  id: string;
 ptyId: string | null;
  direction?: 'horizontal' | 'vertical';
  children?: Pane[];
  size?: number;
}

export interface TerminalState {
  tabs: Tab[];
  activeTabId: string;
  activePaneId: string;
  settingsOpen: boolean;
  commandPaletteOpen: boolean;
  searchOpen: boolean;
}
