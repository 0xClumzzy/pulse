export interface Tab {
  id: string;
  title: string;
  panes: Pane[];
  hostTag?: HostTag;
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

export type HostEnvironment = 'prod' | 'staging' | 'dev' | 'ctf' | 'homelab' | 'unknown';

export interface HostTag {
  environment: HostEnvironment;
  color: string;
  label: string;
}

export interface ReconEntry {
  id: string;
  entry_type: string;
  value: string;
  context: string;
  timestamp: number;
  pane_id: string;
}

export interface HostFingerprint {
  hostname: string;
  key_type: string;
  fingerprint: string;
  first_seen: number;
  last_seen: number;
}

export interface HostKeyAlert {
  hostname: string;
  old_fingerprint: string;
  new_fingerprint: string;
  key_type: string;
  severity: string;
}

export const HOST_COLORS: Record<HostEnvironment, string> = {
  prod: '#f38ba8',
  staging: '#fab387',
  dev: '#a6e3a1',
  ctf: '#cba6f7',
  homelab: '#89dceb',
  unknown: '#6c7086',
};

export const HOST_LABELS: Record<HostEnvironment, string> = {
  prod: 'PROD',
  staging: 'STAGE',
  dev: 'DEV',
  ctf: 'CTF',
  homelab: 'HOME',
  unknown: '',
};
