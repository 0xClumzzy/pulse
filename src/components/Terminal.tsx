import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
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

  const theme = useTerminalStore((s) => s.theme);
  const updatePanePty = useTerminalStore((s) => s.updatePanePty);
  const updateTabTitle = useTerminalStore((s) => s.updateTabTitle);
  const activeTabId = useTerminalStore((s) => s.activeTabId);

  const createTerminal = useCallback(async () => {
    if (!containerRef.current) return;

    const term = new XTerminal({
      fontFamily: theme.font.family,
      fontSize: theme.font.size,
      fontWeight: theme.font.style === 'italic' ? 'normal' : theme.font.weight as any,
      fontStyle: theme.font.style as any,
      theme: {
        background: theme.background,
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
      cursorOpacity: theme.cursor.opacity,
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const search = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(search);

    if (searchAddon) {
      searchAddon.current = search;
    }

    term.open(containerRef.current);

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
    try {
      const ptyId = await invoke<string>('pty_spawn', {});
      ptyIdRef.current = ptyId;
      updatePanePty(paneId, ptyId);

      // Listen for PTY data
      const unlistenData = await listen<{ id: string; data: string }>(
        'pty-data',
        (event) => {
          if (event.payload.id === ptyId) {
            term.write(event.payload.data);
          }
        }
      );

      // Listen for PTY exit
      const unlistenExit = await listen<string>('pty-exit', (event) => {
        if (event.payload === ptyId) {
          term.write('\r\n\x1b[33m[Process exited]\x1b[0m\r\n');
        }
      });

      // Handle user input
      term.onData(async (data) => {
        if (ptyIdRef.current) {
          await invoke('pty_write', { id: ptyIdRef.current, data });
        }
      });

      // Handle title changes
      term.onTitleChange((title) => {
        if (activeTabId) {
          updateTabTitle(activeTabId, title || 'Shell');
        }
      });

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
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
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        unlistenData();
        unlistenExit();
        resizeObserver.disconnect();
        if (ptyIdRef.current) {
          invoke('pty_close', { id: ptyIdRef.current });
        }
      };
    } catch (e) {
      console.error('Failed to spawn PTY:', e);
      term.write('\x1b[31mFailed to start terminal\x1b[0m\r\n');
      return () => {};
    }
  }, [theme, paneId, updatePanePty, updateTabTitle, activeTabId, searchAddon]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    createTerminal().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
      if (termRef.current) {
        termRef.current.dispose();
      }
    };
  }, [createTerminal]);

  // Update theme when it changes
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.theme = {
        background: theme.background,
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
      termRef.current.options.fontFamily = theme.font.family;
      termRef.current.options.fontSize = theme.font.size;
      termRef.current.options.cursorBlink = theme.cursor.blinking;
      termRef.current.options.cursorStyle = theme.cursor.style;

      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={`terminal ${isFocused ? 'focused' : ''}`}
      onClick={onFocus}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
