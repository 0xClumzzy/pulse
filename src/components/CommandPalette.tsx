import { useState, useRef, useEffect, useMemo } from 'react';
import { useTerminalStore } from '../store/terminal';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const commandPaletteOpen = useTerminalStore((s) => s.commandPaletteOpen);
  const toggleCommandPalette = useTerminalStore((s) => s.toggleCommandPalette);
  const addTab = useTerminalStore((s) => s.addTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const splitPane = useTerminalStore((s) => s.splitPane);
  const activePaneId = useTerminalStore((s) => s.activePaneId);
  const tabs = useTerminalStore((s) => s.tabs);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      { id: 'new-tab', label: 'New Tab', shortcut: 'Ctrl+Shift+T', action: () => { addTab(); toggleCommandPalette(); } },
      { id: 'close-tab', label: 'Close Tab', shortcut: 'Ctrl+Shift+W', action: () => { closeTab(activeTabId); toggleCommandPalette(); } },
      { id: 'split-h', label: 'Split Horizontally', shortcut: 'Ctrl+Shift+O', action: () => { splitPane(activePaneId, 'horizontal'); toggleCommandPalette(); } },
      { id: 'split-v', label: 'Split Vertically', shortcut: 'Ctrl+Shift+E', action: () => { splitPane(activePaneId, 'vertical'); toggleCommandPalette(); } },
      { id: 'settings', label: 'Open Settings', shortcut: 'Ctrl+Shift+,', action: () => { toggleSettings(); toggleCommandPalette(); } },
      { id: 'search', label: 'Search in Scrollback', shortcut: 'Ctrl+Shift+F', action: () => { toggleCommandPalette(); useTerminalStore.getState().toggleSearch(); } },
      { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', action: () => { useTerminalStore.getState().zoomIn(); toggleCommandPalette(); } },
      { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => { useTerminalStore.getState().zoomOut(); toggleCommandPalette(); } },
      { id: 'zoom-reset', label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => { useTerminalStore.getState().zoomReset(); toggleCommandPalette(); } },
      ...tabs.map((tab) => ({
        id: `goto-${tab.id}`,
        label: `Go to ${tab.title}`,
        action: () => {
          useTerminalStore.getState().setActiveTab(tab.id);
          toggleCommandPalette();
        },
      })),
    ],
    [addTab, closeTab, activeTabId, toggleSettings, splitPane, activePaneId, tabs, toggleCommandPalette]
  );

  const filteredCommands = useMemo(
    () =>
      commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
      ),
    [commands, query]
  );

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        toggleCommandPalette();
        break;
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <>
      <div
        className="command-palette-overlay"
        onClick={toggleCommandPalette}
      />
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-list">
          {filteredCommands.map((cmd, index) => (
            <div
              key={cmd.id}
              className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="command-item-label">{cmd.label}</span>
              {cmd.shortcut && (
                <span className="command-item-shortcut">
                  {cmd.shortcut.split('+').map((key, i) => (
                    <kbd key={i}>{key}</kbd>
                  ))}
                </span>
              )}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="command-item">
              <span className="command-item-label" style={{ opacity: 0.5 }}>
                No matching commands
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
