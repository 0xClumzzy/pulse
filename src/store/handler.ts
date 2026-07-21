import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface HandlerInfo {
  id: string;
  port: number;
  status: string;
  connections: ConnectionInfo[];
}

export interface ConnectionInfo {
  id: string;
  remote_addr: string;
  connected_at: string;
  status: string;
}

interface HandlerStore {
  handlerOpen: boolean;
  handlers: HandlerInfo[];
  toggleHandler: () => void;
  startHandler: (port: number) => Promise<void>;
  stopHandler: (id: string) => Promise<void>;
  removeHandler: (id: string) => Promise<void>;
  refreshHandlers: () => Promise<void>;
}

export const useHandlerStore = create<HandlerStore>((set) => ({
  handlerOpen: false,
  handlers: [],

  toggleHandler: () => set((state) => ({ handlerOpen: !state.handlerOpen })),

  startHandler: async (port) => {
    try {
      const info = await invoke<HandlerInfo>('handler_start', { port });
      set((state) => ({ handlers: [...state.handlers, info] }));
    } catch (e) {
      console.error('Failed to start handler:', e);
    }
  },

  stopHandler: async (id) => {
    try {
      await invoke('handler_stop', { id });
      set((state) => ({
        handlers: state.handlers.map((h) =>
          h.id === id ? { ...h, status: 'stopped' } : h
        ),
      }));
    } catch (e) {
      console.error('Failed to stop handler:', e);
    }
  },

  removeHandler: async (id) => {
    try {
      await invoke('handler_remove', { id });
      set((state) => ({
        handlers: state.handlers.filter((h) => h.id !== id),
      }));
    } catch (e) {
      console.error('Failed to remove handler:', e);
    }
  },

  refreshHandlers: async () => {
    try {
      const handlers = await invoke<HandlerInfo[]>('handler_list');
      set({ handlers });
    } catch (e) {
      console.error('Failed to refresh handlers:', e);
    }
  },
}));
