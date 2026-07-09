import { useEffect, useRef, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import SplitPane from './components/SplitPane';
import { SearchBar } from './components/SearchBar';
import { CommandPalette } from './components/CommandPalette';
import { Settings } from './components/Settings';
import { useTerminalStore } from './store/terminal';
import { SearchAddon } from '@xterm/addon-search';
import { motion } from 'framer-motion';
import './styles/glass.css';

function App() {
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const activePaneId = useTerminalStore((s) => s.activePaneId);

  const searchAddon = useRef<SearchAddon | null>(null);

  // Apply theme CSS variables
  const theme = useTerminalStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.background);
    root.style.setProperty('--fg', theme.foreground);
    root.style.setProperty('--teal', theme.palette.teal || theme.palette.cyan);
    root.style.setProperty('--peach', theme.palette.peach || theme.palette.yellow);
    root.style.setProperty('--mauve', theme.palette.mauve || theme.palette.magenta);
    root.style.setProperty('--overlay', `rgba(${hexToRgb(theme.background)}, ${theme.window.opacity})`);
    root.style.setProperty('--glass-blur', `${theme.glass.blurRadius}px`);
    root.style.setProperty('--tab-height', `${theme.tabBar.height}px`);
    root.style.setProperty('--font-mono', theme.font.family);
  }, [theme]);

  // Keyboard shortcuts
  const activeTabIdRef = useRef(activeTabId);
  const activePaneIdRef = useRef(activePaneId);
  const tabsRef = useRef(tabs);
  activeTabIdRef.current = activeTabId;
  activePaneIdRef.current = activePaneId;
  tabsRef.current = tabs;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    if (isCtrl && isShift && e.key === 'T') {
      e.preventDefault();
      useTerminalStore.getState().addTab();
    }
    if (isCtrl && isShift && e.key === 'W') {
      e.preventDefault();
      useTerminalStore.getState().closeTab(activeTabIdRef.current);
    }
    if (isCtrl && isShift && e.key === 'E') {
      e.preventDefault();
      useTerminalStore.getState().splitPane(activePaneIdRef.current, 'vertical');
    }
    if (isCtrl && isShift && e.key === 'O') {
      e.preventDefault();
      useTerminalStore.getState().splitPane(activePaneIdRef.current, 'horizontal');
    }
    if (isCtrl && isShift && e.key === 'X') {
      e.preventDefault();
      useTerminalStore.getState().closePane(activePaneIdRef.current);
    }
    if (isCtrl && isShift) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); useTerminalStore.getState().movePane('left'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); useTerminalStore.getState().movePane('right'); }
      if (e.key === 'ArrowUp') { e.preventDefault(); useTerminalStore.getState().movePane('up'); }
      if (e.key === 'ArrowDown') { e.preventDefault(); useTerminalStore.getState().movePane('down'); }
    }
    if (isCtrl && isShift && e.key === 'P') {
      e.preventDefault();
      useTerminalStore.getState().toggleCommandPalette();
    }
    if (isCtrl && isShift && e.key === 'F') {
      e.preventDefault();
      useTerminalStore.getState().toggleSearch();
    }
    if (isCtrl && isShift && (e.key === ',' || e.key === '<')) {
      e.preventDefault();
      useTerminalStore.getState().toggleSettings();
    }
    if (isCtrl && e.key === 'PageDown') {
      e.preventDefault();
      const current = tabsRef.current.findIndex((t) => t.id === activeTabIdRef.current);
      const next = (current + 1) % tabsRef.current.length;
      useTerminalStore.getState().setActiveTab(tabsRef.current[next].id);
    }
    if (isCtrl && e.key === 'PageUp') {
      e.preventDefault();
      const current = tabsRef.current.findIndex((t) => t.id === activeTabIdRef.current);
      const prev = (current - 1 + tabsRef.current.length) % tabsRef.current.length;
      useTerminalStore.getState().setActiveTab(tabsRef.current[prev].id);
    }
    if (isCtrl && isAlt && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (tabsRef.current[index]) {
        useTerminalStore.getState().setActiveTab(tabsRef.current[index].id);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      className="glass-window"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
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
            }}
          >
            {tab.panes[0] && (
              <SplitPane
                pane={tab.panes[0]}
                isFocused={tab.id === activeTabId}
                onFocus={(id) => useTerminalStore.getState().setActivePane(id)}
                searchAddon={searchAddon}
              />
            )}
          </div>
        ))}
        <SearchBar searchAddon={searchAddon} />
      </div>
      <CommandPalette />
      <Settings />
    </motion.div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '30, 30, 46';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default App;
