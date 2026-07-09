import { useTerminalStore } from '../store/terminal';
import { builtInThemes } from '../themes';

export function Settings() {
  const settingsOpen = useTerminalStore((s) => s.settingsOpen);
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const theme = useTerminalStore((s) => s.theme);
  const setTheme = useTerminalStore((s) => s.setTheme);

  if (!settingsOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={toggleSettings} />
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={toggleSettings}>
            ×
          </button>
        </div>
        <div className="settings-content">
          {/* Theme Section */}
          <div className="settings-section">
            <div className="settings-section-title">Theme</div>
            <div className="theme-grid">
              {Object.entries(builtInThemes).map(([id, t]) => (
                <div
                  key={id}
                  className={`theme-card ${theme.metadata.name === t.metadata.name ? 'active' : ''}`}
                  style={{ background: t.background }}
                  onClick={() => setTheme(t)}
                >
                  <div className="theme-card-name" style={{ color: t.foreground }}>
                    {t.metadata.name}
                  </div>
                  <div className="theme-card-preview">
                    <div className="theme-card-color" style={{ background: t.palette.red }} />
                    <div className="theme-card-color" style={{ background: t.palette.green }} />
                    <div className="theme-card-color" style={{ background: t.palette.blue }} />
                    <div className="theme-card-color" style={{ background: t.palette.yellow }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Section */}
          <div className="settings-section">
            <div className="settings-section-title">Font</div>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <input
                className="settings-input"
                type="text"
                value={theme.font.family}
                onChange={(e) =>
                  setTheme({ ...theme, font: { ...theme.font, family: e.target.value } })
                }
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Size</span>
              <input
                className="settings-input"
                type="number"
                value={theme.font.size}
                onChange={(e) =>
                  setTheme({ ...theme, font: { ...theme.font, size: Number(e.target.value) } })
                }
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Ligatures</span>
              <input
                type="checkbox"
                checked={theme.font.ligatures}
                onChange={(e) =>
                  setTheme({ ...theme, font: { ...theme.font, ligatures: e.target.checked } })
                }
              />
            </div>
          </div>

          {/* Glass Section */}
          <div className="settings-section">
            <div className="settings-section-title">Glass Effects</div>
            <div className="settings-row">
              <span className="settings-label">Opacity</span>
              <input
                className="settings-slider"
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={theme.window.opacity}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    window: { ...theme.window, opacity: Number(e.target.value) },
                  })
                }
              />
              <span style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.7, width: 40, textAlign: 'right' }}>
                {Math.round(theme.window.opacity * 100)}%
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Blur</span>
              <input
                className="settings-slider"
                type="range"
                min="0"
                max="40"
                step="1"
                value={theme.glass.blurRadius}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    glass: { ...theme.glass, blurRadius: Number(e.target.value) },
                  })
                }
              />
              <span style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.7, width: 40, textAlign: 'right' }}>
                {theme.glass.blurRadius}px
              </span>
            </div>
          </div>

          {/* Cursor Section */}
          <div className="settings-section">
            <div className="settings-section-title">Cursor</div>
            <div className="settings-row">
              <span className="settings-label">Style</span>
              <select
                className="settings-select"
                value={theme.cursor.style}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    cursor: { ...theme.cursor, style: e.target.value as any },
                  })
                }
              >
                <option value="block">Block</option>
                <option value="bar">Bar</option>
                <option value="underline">Underline</option>
              </select>
            </div>
            <div className="settings-row">
              <span className="settings-label">Blink</span>
              <input
                type="checkbox"
                checked={theme.cursor.blinking}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    cursor: { ...theme.cursor, blinking: e.target.checked },
                  })
                }
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Cursor Color</span>
              <input
                className="settings-color"
                type="color"
                value={theme.cursor.cursor}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    cursor: { ...theme.cursor, cursor: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Colors Section */}
          <div className="settings-section">
            <div className="settings-section-title">Colors</div>
            <div className="settings-row">
              <span className="settings-label">Background</span>
              <input
                className="settings-color"
                type="color"
                value={theme.background}
                onChange={(e) => setTheme({ ...theme, background: e.target.value })}
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Foreground</span>
              <input
                className="settings-color"
                type="color"
                value={theme.foreground}
                onChange={(e) => setTheme({ ...theme, foreground: e.target.value })}
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Selection BG</span>
              <input
                className="settings-color"
                type="color"
                value={theme.selection.background}
                onChange={(e) =>
                  setTheme({
                    ...theme,
                    selection: { ...theme.selection, background: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
