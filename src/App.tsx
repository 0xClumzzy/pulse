import { useEffect, useRef, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import SplitPane from './components/SplitPane';
import { SearchBar } from './components/SearchBar';
import { CommandPalette } from './components/CommandPalette';
import { Settings } from './components/Settings';
import { ReconSidebar } from './components/ReconSidebar';
import { PayloadPalette } from './components/PayloadPalette';
import { HandlerPanel } from './components/HandlerPanel';
import { useTerminalStore } from './store/terminal';
import { SearchAddon } from '@xterm/addon-search';
import './App.css';
import './styles/glass.css';

function matchesKeybinding(e: KeyboardEvent, binding: string): boolean {
  if (!binding) return false;
  const parts = binding.split('+');
  let match = true;
  
  let reqCtrl = false;
  let reqShift = false;
  let reqAlt = false;
  let reqMeta = false;
  let targetKey = '';

  for (const part of parts) {
    const p = part.trim().toLowerCase();
    if (p === 'ctrl' || p === 'control') reqCtrl = true;
    else if (p === 'shift') reqShift = true;
    else if (p === 'alt' || p === 'opt' || p === 'option') reqAlt = true;
    else if (p === 'meta' || p === 'cmd' || p === 'command' || p === 'win' || p === 'super') reqMeta = true;
    else targetKey = p;
  }

  const hasCtrl = e.ctrlKey;
  const hasShift = e.shiftKey;
  const hasAlt = e.altKey;
  const hasMeta = e.metaKey;

  if (hasCtrl !== reqCtrl) match = false;
  if (hasShift !== reqShift) match = false;
  if (hasAlt !== reqAlt) match = false;
  if (hasMeta !== reqMeta) match = false;
  
  let eventKey = e.key.toLowerCase();
  if (eventKey === 'arrowleft') eventKey = 'left';
  if (eventKey === 'arrowright') eventKey = 'right';
  if (eventKey === 'arrowup') eventKey = 'up';
  if (eventKey === 'arrowdown') eventKey = 'down';

  let targetNormKey = targetKey;
  if (targetNormKey === 'arrowleft') targetNormKey = 'left';
  if (targetNormKey === 'arrowright') targetNormKey = 'right';
  if (targetNormKey === 'arrowup') targetNormKey = 'up';
  if (targetNormKey === 'arrowdown') targetNormKey = 'down';

  if (eventKey !== targetNormKey) match = false;

  return match;
}

function App() {
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const activePaneId = useTerminalStore((s) => s.activePaneId);
  const payloadPaletteOpen = useTerminalStore((s) => s.payloadPaletteOpen);
  const togglePayloadPalette = useTerminalStore((s) => s.togglePayloadPalette);
  const writeToActiveTerminal = useTerminalStore((s) => s.writeToActiveTerminal);
  const toggleRecon = useTerminalStore((s) => s.toggleRecon);

  const searchAddon = useRef<SearchAddon | null>(null);

  const initTheme = useTerminalStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Apply theme CSS variables
  const theme = useTerminalStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    const bg = theme.background;
    const opacity = theme.window.opacity;
    const glassBlur = theme.glass.blurRadius;

    root.style.setProperty('--bg', bg);
    root.style.setProperty('--fg', theme.foreground);
    root.style.setProperty('--teal', theme.palette.teal || theme.palette.cyan);
    root.style.setProperty('--peach', theme.palette.peach || theme.palette.yellow);
    root.style.setProperty('--mauve', theme.palette.mauve || theme.palette.magenta);
    root.style.setProperty('--overlay', `rgba(${hexToRgb(bg)}, ${opacity})`);
    root.style.setProperty('--glass-blur', `${glassBlur}px`);
    root.style.setProperty('--glass-border', `rgba(255, 255, 255, ${Math.min(opacity * 0.12, 0.12)})`);
    root.style.setProperty('--tab-height', `${theme.tabBar.height}px`);
    root.style.setProperty('--font-mono', theme.font.family);

    // Derive semi-transparent panel colors from the theme background
    const rgb = hexToRgb(bg);
    root.style.setProperty('--titlebar-bg', `rgba(${rgb}, ${Math.min(opacity * 0.8, 0.9)})`);
    root.style.setProperty('--titlebar-border', `rgba(255, 255, 255, 0.06)`);
    root.style.setProperty('--tabbar-bg', `rgba(${rgb}, ${Math.min(opacity * 0.8, 0.9)})`);
    root.style.setProperty('--tabbar-border', `rgba(255, 255, 255, 0.06)`);
    root.style.setProperty('--pane-border', `rgba(255, 255, 255, 0.06)`);
    root.style.setProperty('--pane-active-border', theme.pane.activeBorderColor);
    root.style.setProperty('--panel-bg', `rgba(${rgb}, ${Math.min(opacity * 1.1, 0.95)})`);
    root.style.setProperty('--panel-border', `rgba(255, 255, 255, 0.1)`);
    root.style.setProperty('--selection-bg', theme.selection.background);
    root.style.setProperty('--selection-fg', theme.selection.foreground);
  }, [theme]);

  const handleFocus = useCallback((id: string) => {
    useTerminalStore.getState().setActivePane(id);
  }, []);

  const handlePayloadSelect = useCallback((payload: string) => {
    writeToActiveTerminal(payload);
  }, [writeToActiveTerminal]);

  // Keyboard shortcuts
  const activeTabIdRef = useRef(activeTabId);
  const activePaneIdRef = useRef(activePaneId);
  const tabsRef = useRef(tabs);
  activeTabIdRef.current = activeTabId;
  activePaneIdRef.current = activePaneId;
  tabsRef.current = tabs;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const bindings = useTerminalStore.getState().theme.keybindings;

    if (matchesKeybinding(e, bindings.newTab)) {
      e.preventDefault();
      useTerminalStore.getState().addTab();
    }
    else if (matchesKeybinding(e, bindings.closeTab)) {
      e.preventDefault();
      useTerminalStore.getState().closeTab(activeTabIdRef.current);
    }
    else if (matchesKeybinding(e, bindings.splitVertical)) {
      e.preventDefault();
      useTerminalStore.getState().splitPane(activePaneIdRef.current, 'vertical');
    }
    else if (matchesKeybinding(e, bindings.splitHorizontal)) {
      e.preventDefault();
      useTerminalStore.getState().splitPane(activePaneIdRef.current, 'horizontal');
    }
    else if (matchesKeybinding(e, bindings.closePane)) {
      e.preventDefault();
      useTerminalStore.getState().closePane(activePaneIdRef.current);
    }
    else if (matchesKeybinding(e, bindings.paneLeft)) {
      e.preventDefault();
      useTerminalStore.getState().movePane('left');
    }
    else if (matchesKeybinding(e, bindings.paneRight)) {
      e.preventDefault();
      useTerminalStore.getState().movePane('right');
    }
    else if (matchesKeybinding(e, bindings.paneUp)) {
      e.preventDefault();
      useTerminalStore.getState().movePane('up');
    }
    else if (matchesKeybinding(e, bindings.paneDown)) {
      e.preventDefault();
      useTerminalStore.getState().movePane('down');
    }
    else if (matchesKeybinding(e, bindings.commandPalette)) {
      e.preventDefault();
      useTerminalStore.getState().toggleCommandPalette();
    }
    else if (matchesKeybinding(e, bindings.search)) {
      e.preventDefault();
      useTerminalStore.getState().toggleSearch();
    }
    else if (matchesKeybinding(e, bindings.settings)) {
      e.preventDefault();
      useTerminalStore.getState().toggleSettings();
    }
    else if (matchesKeybinding(e, bindings.nextTab)) {
      e.preventDefault();
      const current = tabsRef.current.findIndex((t) => t.id === activeTabIdRef.current);
      const next = (current + 1) % tabsRef.current.length;
      useTerminalStore.getState().setActiveTab(tabsRef.current[next].id);
    }
    else if (matchesKeybinding(e, bindings.prevTab)) {
      e.preventDefault();
      const current = tabsRef.current.findIndex((t) => t.id === activeTabIdRef.current);
      const prev = (current - 1 + tabsRef.current.length) % tabsRef.current.length;
      useTerminalStore.getState().setActiveTab(tabsRef.current[prev].id);
    }
    // Handle Ctrl+Alt+1..9 to select tabs
    else if (e.ctrlKey && e.altKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (tabsRef.current[index]) {
        useTerminalStore.getState().setActiveTab(tabsRef.current[index].id);
      }
    }
    // Handle zoom shortcuts
    else if (matchesKeybinding(e, bindings.zoomIn)) {
      e.preventDefault();
      useTerminalStore.getState().zoomIn();
    }
    else if (matchesKeybinding(e, bindings.zoomOut)) {
      e.preventDefault();
      useTerminalStore.getState().zoomOut();
    }
    else if (matchesKeybinding(e, bindings.zoomReset)) {
      e.preventDefault();
      useTerminalStore.getState().zoomReset();
    }
    // Security features
    else if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      toggleRecon();
    }
    else if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      togglePayloadPalette();
    }
  }, [toggleRecon, togglePayloadPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="glass-window">
      <TitleBar />
      <TabBar />
      <div className="terminal-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              display: tab.id === activeTabId ? 'block' : 'none',
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
            }}
          >
            {tab.panes[0] && (
              <SplitPane
                pane={tab.panes[0]}
                isFocused={tab.id === activeTabId}
                onFocus={handleFocus}
                searchAddon={searchAddon}
              />
            )}
          </div>
        ))}
        <SearchBar searchAddon={searchAddon} />
        <ReconSidebar />
        <HandlerPanel />
      </div>
      <CommandPalette />
      <Settings />
      {payloadPaletteOpen && (
        <PayloadPalette
          onSelect={handlePayloadSelect}
          onClose={togglePayloadPalette}
        />
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '30, 30, 46';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default App;
