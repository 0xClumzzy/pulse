import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { ReconSummary, ReconEntry, HostFingerprint, HostKeyAlert } from '../types/terminal';

interface ReconStore {
  reconOpen: boolean;
  reconSummary: ReconSummary;
  reconEntries: ReconEntry[];
  hostKeys: HostFingerprint[];
  hostKeyAlerts: HostKeyAlert[];
  toggleRecon: () => void;
  refreshRecon: () => Promise<void>;
  addReconEntries: (entries: ReconEntry[]) => void;
  addHostKeyAlert: (alert: HostKeyAlert) => void;
  refreshHostKeys: () => Promise<void>;
  clearRecon: () => void;
}

export const useReconStore = create<ReconStore>((set) => ({
  reconOpen: false,
  reconSummary: {
    credentials_found: 0,
    commands_executed: 0,
    connections_opened: 0,
    total_sessions: 0,
  },
  reconEntries: [],
  hostKeys: [],
  hostKeyAlerts: [],

  toggleRecon: () => set((state) => ({ reconOpen: !state.reconOpen })),

  addReconEntries: (entries) =>
    set((state) => ({
      reconEntries: [...state.reconEntries, ...entries].slice(-500),
    })),

  addHostKeyAlert: (alert) =>
    set((state) => ({
      hostKeyAlerts: [...state.hostKeyAlerts, alert],
    })),

  refreshHostKeys: async () => {
    try {
      const keys = await invoke<HostFingerprint[]>('get_host_keys');
      set({ hostKeys: keys });
    } catch (e) {
      console.error('Failed to refresh host keys:', e);
    }
  },

  clearRecon: () => {
    invoke('clear_recon').catch(() => {});
    set({ reconEntries: [] });
  },

  refreshRecon: async () => {
    try {
      const summary = await invoke<ReconSummary>('get_recon_summary');
      set({ reconSummary: summary });
    } catch (e) {
      console.error('Failed to refresh recon:', e);
    }
  },
}));
