import { useEffect, useRef, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import { SplitPane } from './components/SplitPane';
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
  const setActivePane = useTerminalStore((s) => s.setActivePane);
  const addTab = useTerminalStore((s) => s.addTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const closePane = useTerminalStore((s) => s.closePane);
  const splitPane = useTerminalStore((s) => s.splitPane);
  const movePane = useTerminalStore((s) => s.movePane);
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const toggleCommandPalette = useTerminalStore((s) => s.toggleCommandPalette);
  const toggleSearch = useTerminalStore((s) => s.toggleSearch);
  const tabsState = useTerminalStore((s) => s.tabs);
  const theme = useTerminalStore((s) => s.theme);

  const searchAddon = useRef<SearchAddon | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePane = activeTab?.panes[0];

  // Apply theme CSS variables
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
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Ctrl+Shift+T: New Tab
      if (isCtrl && isShift && e.key === 'T') {
        e.preventDefault();
        addTab();
      }

      // Ctrl+Shift+W: Close Tab
      if (isCtrl && isShift && e.key === 'W') {
        e.preventDefault();
        closeTab(activeTabId);
      }

      // Ctrl+Shift+E: Split Vertically
      if (isCtrl && isShift && e.key === 'E') {
        e.preventDefault();
        splitPane(activePaneId, 'vertical');
      }

      // Ctrl+Shift+O: Split Horizontally
      if (isCtrl && isShift && e.key === 'O') {
        e.preventDefault();
        splitPane(activePaneId, 'horizontal');
      }

      // Ctrl+Shift+X: Close Pane
      if (isCtrl && isShift && e.key === 'X') {
        e.preventDefault();
        closePane(activePaneId);
      }

      // Ctrl+Shift+Arrow: Move between panes
      if (isCtrl && isShift) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          movePane('left');
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          movePane('right');
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          movePane('up');
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          movePane('down');
        }
      }

      // Ctrl+Shift+P: Command Palette
      if (isCtrl && isShift && e.key === 'P') {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Ctrl+Shift+F: Search
      if (isCtrl && isShift && e.key === 'F') {
        e.preventDefault();
        toggleSearch();
      }

      // Ctrl+Shift+,: Settings
      if (isCtrl && isShift && e.key === ',') {
        e.preventDefault();
        toggleSettings();
      }

      // Ctrl+PageDown/Up: Tab navigation
      if (isCtrl && e.key === 'PageDown') {
        e.preventDefault();
        const currentIndex = tabsState.findIndex((t) => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabsState.length;
        useTerminalStore.getState().setActiveTab(tabsState[nextIndex].id);
      }

      if (isCtrl && e.key === 'PageUp') {
        e.preventDefault();
        const currentIndex = tabsState.findIndex((t) => t.id === activeTabId);
        const prevIndex = (currentIndex - 1 + tabsState.length) % tabsState.length;
        useTerminalStore.getState().setActiveTab(tabsState[prevIndex].id);
      }

      // Ctrl+Alt+1-9: Go to tab
      if (isCtrl && isAlt && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (tabsState[index]) {
          useTerminalStore.getState().setActiveTab(tabsState[index].id);
        }
      }
    },
    [activeTabId, activePaneId, addTab, closeTab, closePane, splitPane, movePane, toggleSettings, toggleCommandPalette, toggleSearch, tabsState]
  );

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
        {activePane && (
          <SplitPane
            pane={activePane}
            isFocused={true}
            onFocus={setActivePane}
            searchAddon={searchAddon}
          />
        )}
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
