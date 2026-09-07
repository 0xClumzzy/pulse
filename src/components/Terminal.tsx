import { useEffect, useRef, useState, memo } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { open } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useTerminalStore } from '../store/terminal';
import { useThemeStore } from '../store/theme';
import { ShaderEngine } from '../shaders/engine';
import type { Theme } from '../types/theme';
import '@xterm/xterm/css/xterm.css';

// Per-pane SearchAddon registry (avoids xterm internals hack)
const searchAddonRegistry = new Map<string, SearchAddon>();

interface TerminalProps {
  paneId: string;
  isFocused: boolean;
  onFocus: () => void;
  searchAddon?: React.MutableRefObject<SearchAddon | null>;
}

// Shared theme application function
function applyThemeToTerminal(term: XTerminal, theme: Theme): void {
  term.options.theme = {
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
  term.options.fontFamily = theme.font.family;
  term.options.fontSize = theme.font.size;
  term.options.cursorBlink = theme.cursor.blinking;
  term.options.cursorStyle = theme.cursor.style;
}

export function Terminal({ paneId, isFocused, onFocus, searchAddon }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const shaderEngineRef = useRef<ShaderEngine | null>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const ptyIdRef = useRef<string | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlistenRefs = useRef<UnlistenFn[]>([]);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [bellFlash, setBellFlash] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const updatePanePty = useTerminalStore((s) => s.updatePanePty);
  const updateTabTitle = useTerminalStore((s) => s.updateTabTitle);
  const settingsOpen = useTerminalStore((s) => s.settingsOpen);
  const commandPaletteOpen = useTerminalStore((s) => s.commandPaletteOpen);
  const cosmicText = useTerminalStore((s) => s.cosmicText);
  const activeTabIdRef = useRef(useTerminalStore.getState().activeTabId);
  const themeRef = useRef(useThemeStore.getState().theme);

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
      cursorBlink: theme.cursor.blinking,
      cursorStyle: theme.cursor.style,
      scrollback: theme.font.scrollback || 10000,
      allowProposedApi: true,
      drawBoldTextInBrightColors: true,
      minimumContrastRatio: 1,
      convertEol: true,
    });

    // Apply font features (ligatures etc.)
    if (theme.font.fontFeatures && theme.font.fontFeatures.length > 0) {
      (term.options as any).fontFeatures = theme.font.fontFeatures;
    }

    // Apply initial theme
    applyThemeToTerminal(term, theme);

    const fitAddon = new FitAddon();
    const search = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(search);

    const webLinksAddon = new WebLinksAddon((e, uri) => {
      if (e instanceof MouseEvent) {
        if (e.detail === 2) {
          open(uri);
        } else if (e.detail === 1) {
          navigator.clipboard.writeText(uri).then(() => {
            setCopied(true);
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(() => setCopied(false), 1200);
          }).catch(() => {});
        }
      }
    }, { willOpen: (e) => { e.preventDefault(); } });
    term.loadAddon(webLinksAddon);

    // Only register searchAddon if this pane is focused
    if (searchAddon && isFocused) {
      searchAddon.current = search;
    }
    searchAddonRegistry.set(paneId, search);

    term.open(containerRef.current);

    // Initialize shader engine
    if (shaderCanvasRef.current && containerRef.current) {
      const shaderEngine = new ShaderEngine();
      shaderEngine.init(shaderCanvasRef.current, containerRef.current.querySelector('canvas') as HTMLCanvasElement);
      if (theme.shader?.enabled && theme.shader.preset !== 'none') {
        shaderEngine.updateConfig(theme.shader);
        shaderEngine.startLoop();
      }
      shaderEngineRef.current = shaderEngine;
    }

    // Visual bell handler (Pulse feature)
    const pulseConfig = theme.pulse;
    if (pulseConfig?.visualBell) {
      term.onBell(() => {
        setBellFlash(true);
        setTimeout(() => setBellFlash(false), pulseConfig.visualBellDuration || 200);
      });
    }

    // OSC 9;4 progress bar handler (Pulse feature)
    term.parser.registerOscHandler(9, (data: string) => {
      // OSC 9;4;P format: P is progress (0-100) or -1 for indeterminate
      const parts = data.split(';');
      if (parts.length >= 2) {
        const p = parseInt(parts[1], 10);
        if (!isNaN(p)) {
          setProgress(p >= 0 ? Math.min(100, Math.max(0, p)) : null);
        }
      }
      return true;
    });

    // Handle copy/paste
    term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl && isShift && (e.key === 'c' || e.key === 'C')) {
        if (e.type === 'keydown') {
          e.preventDefault();
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).then(() => {
              setCopied(true);
              if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
              copiedTimerRef.current = setTimeout(() => setCopied(false), 1200);
            }).catch((err) => {
              console.error('Failed to copy to clipboard:', err);
            });
          }
        }
        return false;
      }

      if (isCtrl && isShift && (e.key === 'v' || e.key === 'V')) {
        if (e.type === 'keydown') {
          e.preventDefault();
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

      // Command completion notification (Pulse feature)
      if (pulseConfig?.commandNotifications) {
        let lastPrompt = '';
        term.onData((data) => {
          // Detect prompt return (PS1 markers)
          if (data.includes('\n$ ') || data.includes('\n# ') || data.includes('\n> ')) {
            if (lastPrompt) {
              const elapsed = Date.now() - lastPrompt;
              if (elapsed > 1000) {
                // Command took > 1s, show notification
                invoke('notify_command_complete', {
                  title: 'Command Complete',
                  body: `Finished after ${(elapsed / 1000).toFixed(1)}s`,
                }).catch(() => {});
              }
            }
            lastPrompt = '';
          }
          // Mark prompt detection
          if (data.endsWith('$ ') || data.endsWith('# ') || data.endsWith('> ')) {
            lastPrompt = Date.now();
          }
        });
      }
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

    // Debounced resize (150ms to reduce reflow thrashing)
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
      }, 150);
    });
    resizeObserver.observe(containerRef.current);

    // Mouse wheel zoom (Ctrl + scroll)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          useTerminalStore.getState().zoomIn();
        } else {
          useTerminalStore.getState().zoomOut();
        }
      }
    };
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      isUnmounted = true;
      searchAddonRegistry.delete(paneId);
      resizeObserver.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      if (bellTimerRef.current) clearTimeout(bellTimerRef.current);
      containerRef.current?.removeEventListener('wheel', handleWheel);
      // Clean up shader engine
      if (shaderEngineRef.current) {
        shaderEngineRef.current.stop();
        shaderEngineRef.current = null;
      }
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
    const unsub = useThemeStore.subscribe((state) => {
      const t = termRef.current;
      if (!t) return;
      applyThemeToTerminal(t, state.theme);
      // Update shader engine
      if (shaderEngineRef.current && state.theme.shader) {
        shaderEngineRef.current.updateConfig(state.theme.shader);
        if (state.theme.shader.enabled && state.theme.shader.preset !== 'none') {
          shaderEngineRef.current.startLoop();
        } else {
          shaderEngineRef.current.stop();
        }
      }
    });
    return unsub;
  }, []);

  // Update searchAddon ref when focus changes
  useEffect(() => {
    if (isFocused && searchAddon) {
      const registered = searchAddonRegistry.get(paneId);
      if (registered) {
        searchAddon.current = registered;
      }
    }
  }, [isFocused, searchAddon, paneId]);

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

  const scrollbarEnabled = themeRef.current.pulse?.scrollbar !== false;
  const shaderEnabled = themeRef.current.shader?.enabled && themeRef.current.shader?.preset !== 'none';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        className={`terminal ${isFocused ? 'focused' : ''} ${cosmicText ? 'cosmic-enabled' : ''} ${scrollbarEnabled ? 'scrollbar-visible' : ''}`}
        onClick={onFocus}
        style={{
          width: '100%',
          height: '100%',
          ...(bellFlash ? { filter: 'brightness(1.3)' } : {}),
          transition: bellFlash ? 'none' : 'filter 0.2s ease',
        }}
      />
      {shaderEnabled && (
        <canvas
          ref={shaderCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      {progress !== null && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-bar-text">{progress}%</span>
        </div>
      )}
      {copied && (
        <div className="copy-toast">Copied</div>
      )}
    </div>
  );
}

export default memo(Terminal);
