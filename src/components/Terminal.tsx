import { useEffect, useRef, memo } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useTerminalStore } from '../store/terminal';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  paneId: string;
  isFocused: boolean;
  onFocus: () => void;
  searchAddon?: React.MutableRefObject<SearchAddon | null>;
}

export function Terminal({ paneId, isFocused, onFocus, searchAddon }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const ptyIdRef = useRef<string | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlistenRefs = useRef<UnlistenFn[]>([]);

  const themeRef = useRef(useTerminalStore.getState().theme);
  const updatePanePty = useTerminalStore((s) => s.updatePanePty);
  const updateTabTitle = useTerminalStore((s) => s.updateTabTitle);
  const settingsOpen = useTerminalStore((s) => s.settingsOpen);
  const commandPaletteOpen = useTerminalStore((s) => s.commandPaletteOpen);
  const cosmicText = useTerminalStore((s) => s.cosmicText);
  const activeTabIdRef = useRef(useTerminalStore.getState().activeTabId);

  // Subscribe to store changes without re-creating terminal
  useEffect(() => {
    const unsub = useTerminalStore.subscribe((state) => {
      activeTabIdRef.current = state.activeTabId;
    });
    return unsub;
  }, []);

  // Create terminal once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const theme = themeRef.current;
    let isUnmounted = false;

    const term = new XTerminal({
      fontFamily: theme.font.family,
      fontSize: theme.font.size,
      fontWeight: theme.font.style === 'italic' ? 'normal' : theme.font.weight as any,
      fontStyle: theme.font.style as any,
      theme: {
        background: 'rgba(0,0,0,0)',
        foreground: theme.foreground,
        cursor: theme.cursor.cursor,
        cursorAccent: theme.cursor.text,
        selectionBackground: theme.selection.background,
        selectionForeground: theme.selection.foreground,
        black: theme.palette.black,
        red: theme.palette.red,
        green: theme.palette.green,
        yellow: theme.palette.yellow,
        blue: theme.palette.blue,
        magenta: theme.palette.magenta,
        cyan: theme.palette.cyan,
        white: theme.palette.white,
        brightBlack: theme.palette.brightBlack,
        brightRed: theme.palette.brightRed,
        brightGreen: theme.palette.brightGreen,
        brightYellow: theme.palette.brightYellow,
        brightBlue: theme.palette.brightBlue,
        brightMagenta: theme.palette.brightMagenta,
        brightCyan: theme.palette.brightCyan,
        brightWhite: theme.palette.brightWhite,
      },
      cursorBlink: theme.cursor.blinking,
      cursorStyle: theme.cursor.style,
      scrollback: 10000,
      allowProposedApi: true,
      drawBoldTextInBrightColors: true,
      minimumContrastRatio: 1,
    });

    const fitAddon = new FitAddon();
    const search = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(search);

    // Only set searchAddon ref if this pane is focused
    if (searchAddon && isFocused) {
      searchAddon.current = search;
    }

    term.open(containerRef.current);

    // Handle copy/paste
    term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl && isShift && e.key === 'C') {
        if (e.type === 'keydown') {
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).catch((err) => {
              console.error('Failed to copy to clipboard:', err);
            });
          }
        }
        return false;
      }

      if (isCtrl && isShift && e.key === 'V') {
        if (e.type === 'keydown') {
          navigator.clipboard.readText().then((text) => {
            if (ptyIdRef.current) {
              invoke('pty_write', { id: ptyIdRef.current, data: text });
            }
          }).catch((err) => {
            console.error('Failed to paste from clipboard:', err);
          });
        }
        return false;
      }

      return true;
    });

    // WebGL with fallback
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL addon failed, falling back to canvas');
    }

    fitAddon.fit();
    fitAddonRef.current = fitAddon;
    termRef.current = term;

    // Spawn PTY
    invoke<string>('pty_spawn', {}).then((ptyId) => {
      if (isUnmounted) {
        invoke('pty_close', { id: ptyId });
        return;
      }
      ptyIdRef.current = ptyId;
      updatePanePty(paneId, ptyId);

      // Store unlisten functions for cleanup
      listen<{ id: string; data: string }>('pty-data', (event) => {
        if (event.payload.id === ptyId) {
          term.write(event.payload.data);
        }
      }).then((unlisten) => {
        if (isUnmounted) {
          unlisten();
        } else {
          unlistenRefs.current.push(unlisten);
        }
      });

      listen<string>('pty-exit', (event) => {
        if (event.payload === ptyId) {
          useTerminalStore.getState().closePane(paneId);
        }
      }).then((unlisten) => {
        if (isUnmounted) {
          unlisten();
        } else {
          unlistenRefs.current.push(unlisten);
        }
      });
    });

    term.onData((data) => {
      if (ptyIdRef.current) {
        invoke('pty_write', { id: ptyIdRef.current, data });
      }
    });

    term.onTitleChange((title) => {
      const tabId = activeTabIdRef.current;
      if (tabId) {
        updateTabTitle(tabId, title || 'Shell');
      }
    });

    // Debounced resize
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        fitAddon.fit();
        if (ptyIdRef.current) {
          const dims = fitAddon.proposeDimensions();
          if (dims) {
            invoke('pty_resize', {
              id: ptyIdRef.current,
              cols: dims.cols,
              rows: dims.rows,
            });
          }
        }
      }, 50);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      isUnmounted = true;
      resizeObserver.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      // Clean up Tauri event listeners
      unlistenRefs.current.forEach((unlisten) => unlisten());
      unlistenRefs.current = [];
      if (ptyIdRef.current) {
        invoke('pty_close', { id: ptyIdRef.current });
      }
      term.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme without recreating terminal
  useEffect(() => {
    const unsub = useTerminalStore.subscribe((state) => {
      const t = termRef.current;
      if (!t) return;
      const theme = state.theme;
      t.options.theme = {
        background: 'rgba(0,0,0,0)',
        foreground: theme.foreground,
        cursor: theme.cursor.cursor,
        cursorAccent: theme.cursor.text,
        selectionBackground: theme.selection.background,
        selectionForeground: theme.selection.foreground,
        black: theme.palette.black,
        red: theme.palette.red,
        green: theme.palette.green,
        yellow: theme.palette.yellow,
        blue: theme.palette.blue,
        magenta: theme.palette.magenta,
        cyan: theme.palette.cyan,
        white: theme.palette.white,
        brightBlack: theme.palette.brightBlack,
        brightRed: theme.palette.brightRed,
        brightGreen: theme.palette.brightGreen,
        brightYellow: theme.palette.brightYellow,
        brightBlue: theme.palette.brightBlue,
        brightMagenta: theme.palette.brightMagenta,
        brightCyan: theme.palette.brightCyan,
        brightWhite: theme.palette.brightWhite,
      };
      t.options.fontFamily = theme.font.family;
      t.options.fontSize = theme.font.size;
      t.options.cursorBlink = theme.cursor.blinking;
      t.options.cursorStyle = theme.cursor.style;
    });
    return unsub;
  }, []);

  // Update searchAddon ref when focus changes
  useEffect(() => {
    if (isFocused && searchAddon && termRef.current) {
      // Re-register this pane's search addon when it gains focus
      const term = termRef.current;
      const addons = (term as any)._addonManager?._addons;
      if (addons) {
        for (const addon of addons) {
          if (addon.instance instanceof SearchAddon) {
            searchAddon.current = addon.instance;
            break;
          }
        }
      }
    }
  }, [isFocused, searchAddon]);

  // Auto-focus when becomes active
  useEffect(() => {
    if (isFocused && termRef.current) {
      termRef.current.focus();
    }
  }, [isFocused]);

  // Re-focus after settings or other panels close
  useEffect(() => {
    if (!settingsOpen && !commandPaletteOpen && isFocused && termRef.current) {
      const timer = setTimeout(() => {
        if (termRef.current) {
          termRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [settingsOpen, commandPaletteOpen, isFocused]);

  return (
    <div
      ref={containerRef}
      className={`terminal ${isFocused ? 'focused' : ''} ${cosmicText ? 'cosmic-enabled' : ''}`}
      onClick={onFocus}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default memo(Terminal);
