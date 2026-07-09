import { useState } from 'react';
import { useTerminalStore } from '../store/terminal';
import { builtInThemes } from '../themes';
import type { Theme } from '../types/theme';

type SectionId = 'theme' | 'colors' | 'palette' | 'cursor' | 'font' | 'window' | 'glass' | 'tabbar' | 'pane' | 'animations' | 'keybindings';

interface CollapsibleSectionProps {
  id: SectionId;
  title: string;
  children: React.ReactNode;
  openSection: SectionId | null;
  setOpenSection: (id: SectionId | null) => void;
}

function CollapsibleSection({ id, title, children, openSection, setOpenSection }: CollapsibleSectionProps) {
  const isOpen = openSection === id;
  return (
    <div className={`settings-section ${isOpen ? 'open' : ''}`}>
      <button
        className="settings-section-header"
        onClick={() => setOpenSection(isOpen ? null : id)}
      >
        <span className="settings-section-title">{title}</span>
        <span className={`settings-section-chevron ${isOpen ? 'open' : ''}`}>›</span>
      </button>
      {isOpen && <div className="settings-section-content">{children}</div>}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <div className="settings-color-group">
        <input className="settings-color" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="settings-color-hex">{value}</span>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <div className="settings-slider-group">
        <input
          className="settings-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="settings-slider-value">{value}{unit || ''}</span>
      </div>
    </div>
  );
}

export function Settings() {
  const settingsOpen = useTerminalStore((s) => s.settingsOpen);
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const theme = useTerminalStore((s) => s.theme);
  const setTheme = useTerminalStore((s) => s.setTheme);
  const [openSection, setOpenSection] = useState<SectionId | null>('theme');

  const update = (partial: Partial<Theme>) => setTheme({ ...theme, ...partial });

  if (!settingsOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={toggleSettings} />
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={toggleSettings}>×</button>
        </div>
        <div className="settings-content">

          {/* Theme Presets */}
          <CollapsibleSection id="theme" title="Theme Presets" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="theme-grid">
              {Object.entries(builtInThemes).map(([id, t]) => (
                <div
                  key={id}
                  className={`theme-card ${theme.metadata.name === t.metadata.name ? 'active' : ''}`}
                  style={{ background: t.background }}
                  onClick={() => setTheme(t)}
                >
                  <div className="theme-card-name" style={{ color: t.foreground }}>{t.metadata.name}</div>
                  <div className="theme-card-preview">
                    <div className="theme-card-color" style={{ background: t.palette.red }} />
                    <div className="theme-card-color" style={{ background: t.palette.green }} />
                    <div className="theme-card-color" style={{ background: t.palette.blue }} />
                    <div className="theme-card-color" style={{ background: t.palette.yellow }} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Colors */}
          <CollapsibleSection id="colors" title="Colors" openSection={openSection} setOpenSection={setOpenSection}>
            <ColorRow label="Background" value={theme.background} onChange={(v) => update({ background: v })} />
            <ColorRow label="Foreground" value={theme.foreground} onChange={(v) => update({ foreground: v })} />
            <ColorRow label="Selection BG" value={theme.selection.background} onChange={(v) => update({ selection: { ...theme.selection, background: v } })} />
            <ColorRow label="Selection FG" value={theme.selection.foreground} onChange={(v) => update({ selection: { ...theme.selection, foreground: v } })} />
          </CollapsibleSection>

          {/* Palette */}
          <CollapsibleSection id="palette" title="Palette Colors" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="settings-palette-grid">
              <ColorRow label="Black" value={theme.palette.black} onChange={(v) => update({ palette: { ...theme.palette, black: v } })} />
              <ColorRow label="Red" value={theme.palette.red} onChange={(v) => update({ palette: { ...theme.palette, red: v } })} />
              <ColorRow label="Green" value={theme.palette.green} onChange={(v) => update({ palette: { ...theme.palette, green: v } })} />
              <ColorRow label="Yellow" value={theme.palette.yellow} onChange={(v) => update({ palette: { ...theme.palette, yellow: v } })} />
              <ColorRow label="Blue" value={theme.palette.blue} onChange={(v) => update({ palette: { ...theme.palette, blue: v } })} />
              <ColorRow label="Magenta" value={theme.palette.magenta} onChange={(v) => update({ palette: { ...theme.palette, magenta: v } })} />
              <ColorRow label="Cyan" value={theme.palette.cyan} onChange={(v) => update({ palette: { ...theme.palette, cyan: v } })} />
              <ColorRow label="White" value={theme.palette.white} onChange={(v) => update({ palette: { ...theme.palette, white: v } })} />
              <ColorRow label="Bright Black" value={theme.palette.brightBlack} onChange={(v) => update({ palette: { ...theme.palette, brightBlack: v } })} />
              <ColorRow label="Bright Red" value={theme.palette.brightRed} onChange={(v) => update({ palette: { ...theme.palette, brightRed: v } })} />
              <ColorRow label="Bright Green" value={theme.palette.brightGreen} onChange={(v) => update({ palette: { ...theme.palette, brightGreen: v } })} />
              <ColorRow label="Bright Yellow" value={theme.palette.brightYellow} onChange={(v) => update({ palette: { ...theme.palette, brightYellow: v } })} />
              <ColorRow label="Bright Blue" value={theme.palette.brightBlue} onChange={(v) => update({ palette: { ...theme.palette, brightBlue: v } })} />
              <ColorRow label="Bright Magenta" value={theme.palette.brightMagenta} onChange={(v) => update({ palette: { ...theme.palette, brightMagenta: v } })} />
              <ColorRow label="Bright Cyan" value={theme.palette.brightCyan} onChange={(v) => update({ palette: { ...theme.palette, brightCyan: v } })} />
              <ColorRow label="Bright White" value={theme.palette.brightWhite} onChange={(v) => update({ palette: { ...theme.palette, brightWhite: v } })} />
              <ColorRow label="Peach" value={theme.palette.peach || theme.palette.yellow} onChange={(v) => update({ palette: { ...theme.palette, peach: v } })} />
              <ColorRow label="Teal" value={theme.palette.teal || theme.palette.cyan} onChange={(v) => update({ palette: { ...theme.palette, teal: v } })} />
              <ColorRow label="Mauve" value={theme.palette.mauve || theme.palette.magenta} onChange={(v) => update({ palette: { ...theme.palette, mauve: v } })} />
              <ColorRow label="Pink" value={theme.palette.pink || theme.palette.magenta} onChange={(v) => update({ palette: { ...theme.palette, pink: v } })} />
            </div>
          </CollapsibleSection>

          {/* Cursor */}
          <CollapsibleSection id="cursor" title="Cursor" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="settings-row">
              <span className="settings-label">Style</span>
              <select
                className="settings-select"
                value={theme.cursor.style}
                onChange={(e) => update({ cursor: { ...theme.cursor, style: e.target.value as any } })}
              >
                <option value="block">Block</option>
                <option value="bar">Bar</option>
                <option value="underline">Underline</option>
              </select>
            </div>
            <div className="settings-row">
              <span className="settings-label">Blink</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={theme.cursor.blinking}
                  onChange={(e) => update({ cursor: { ...theme.cursor, blinking: e.target.checked } })}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <SliderRow
              label="Blink Interval"
              value={theme.cursor.blinkInterval}
              min={100}
              max={2000}
              step={100}
              onChange={(v) => update({ cursor: { ...theme.cursor, blinkInterval: v } })}
              unit="ms"
            />
            <SliderRow
              label="Cursor Opacity"
              value={theme.cursor.opacity}
              min={0.1}
              max={1}
              step={0.1}
              onChange={(v) => update({ cursor: { ...theme.cursor, opacity: v } })}
            />
            <ColorRow label="Cursor Color" value={theme.cursor.cursor} onChange={(v) => update({ cursor: { ...theme.cursor, cursor: v } })} />
            <ColorRow label="Text Color" value={theme.cursor.text} onChange={(v) => update({ cursor: { ...theme.cursor, text: v } })} />
          </CollapsibleSection>

          {/* Font */}
          <CollapsibleSection id="font" title="Font" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <input
                className="settings-input wide"
                type="text"
                value={theme.font.family}
                onChange={(e) => update({ font: { ...theme.font, family: e.target.value } })}
              />
            </div>
            <div className="settings-row">
              <span className="settings-label">Fallback</span>
              <input
                className="settings-input wide"
                type="text"
                value={theme.font.fallback}
                onChange={(e) => update({ font: { ...theme.font, fallback: e.target.value } })}
              />
            </div>
            <SliderRow
              label="Size"
              value={theme.font.size}
              min={8}
              max={72}
              step={1}
              onChange={(v) => update({ font: { ...theme.font, size: v } })}
              unit="px"
            />
            <div className="settings-row">
              <span className="settings-label">Weight</span>
              <select
                className="settings-select"
                value={theme.font.weight}
                onChange={(e) => update({ font: { ...theme.font, weight: e.target.value } })}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">Thin (100)</option>
                <option value="200">Extra Light (200)</option>
                <option value="300">Light (300)</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
            <div className="settings-row">
              <span className="settings-label">Style</span>
              <select
                className="settings-select"
                value={theme.font.style}
                onChange={(e) => update({ font: { ...theme.font, style: e.target.value } })}
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>
            <div className="settings-row">
              <span className="settings-label">Ligatures</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={theme.font.ligatures}
                  onChange={(e) => update({ font: { ...theme.font, ligatures: e.target.checked } })}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </CollapsibleSection>

          {/* Window */}
          <CollapsibleSection id="window" title="Window" openSection={openSection} setOpenSection={setOpenSection}>
            <SliderRow
              label="Opacity"
              value={theme.window.opacity}
              min={0.3}
              max={1}
              step={0.05}
              onChange={(v) => update({ window: { ...theme.window, opacity: v } })}
              unit="%"
            />
            <SliderRow
              label="Border Radius"
              value={theme.window.borderRadius}
              min={0}
              max={32}
              step={1}
              onChange={(v) => update({ window: { ...theme.window, borderRadius: v } })}
              unit="px"
            />
            <div className="settings-row">
              <span className="settings-label">Border Width</span>
              <input
                className="settings-input"
                type="number"
                min={0}
                max={4}
                value={theme.window.borderWidth}
                onChange={(e) => update({ window: { ...theme.window, borderWidth: Number(e.target.value) } })}
              />
            </div>
            <ColorRow label="Border Color" value={theme.window.borderColor} onChange={(v) => update({ window: { ...theme.window, borderColor: v } })} />
            <div className="settings-row">
              <span className="settings-label">Shadow</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={theme.window.shadow}
                  onChange={(e) => update({ window: { ...theme.window, shadow: e.target.checked } })}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <SliderRow
              label="Shadow Blur"
              value={theme.window.shadowBlur}
              min={0}
              max={100}
              step={1}
              onChange={(v) => update({ window: { ...theme.window, shadowBlur: v } })}
              unit="px"
            />
            <SliderRow
              label="Shadow Opacity"
              value={theme.window.shadowOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update({ window: { ...theme.window, shadowOpacity: v } })}
            />
            <SliderRow
              label="Padding X"
              value={theme.window.paddingX}
              min={0}
              max={32}
              step={1}
              onChange={(v) => update({ window: { ...theme.window, paddingX: v } })}
              unit="px"
            />
            <SliderRow
              label="Padding Y"
              value={theme.window.paddingY}
              min={0}
              max={32}
              step={1}
              onChange={(v) => update({ window: { ...theme.window, paddingY: v } })}
              unit="px"
            />
          </CollapsibleSection>

          {/* Glass */}
          <CollapsibleSection id="glass" title="Glass Effects" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="settings-row">
              <span className="settings-label">Enabled</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={theme.glass.enabled}
                  onChange={(e) => update({ glass: { ...theme.glass, enabled: e.target.checked } })}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <SliderRow
              label="Blur Radius"
              value={theme.glass.blurRadius}
              min={0}
              max={60}
              step={1}
              onChange={(v) => update({ glass: { ...theme.glass, blurRadius: v } })}
              unit="px"
            />
            <SliderRow
              label="Noise Opacity"
              value={theme.glass.noiseOpacity}
              min={0}
              max={0.1}
              step={0.005}
              onChange={(v) => update({ glass: { ...theme.glass, noiseOpacity: v } })}
            />
            <SliderRow
              label="Saturation"
              value={theme.glass.saturation}
              min={0}
              max={300}
              step={10}
              onChange={(v) => update({ glass: { ...theme.glass, saturation: v } })}
              unit="%"
            />
          </CollapsibleSection>

          {/* Tab Bar */}
          <CollapsibleSection id="tabbar" title="Tab Bar" openSection={openSection} setOpenSection={setOpenSection}>
            <SliderRow
              label="Height"
              value={theme.tabBar.height}
              min={24}
              max={64}
              step={1}
              onChange={(v) => update({ tabBar: { ...theme.tabBar, height: v } })}
              unit="px"
            />
            <ColorRow label="Background" value={theme.tabBar.background} onChange={(v) => update({ tabBar: { ...theme.tabBar, background: v } })} />
            <SliderRow
              label="Border Height"
              value={theme.tabBar.borderHeight}
              min={0}
              max={4}
              step={1}
              onChange={(v) => update({ tabBar: { ...theme.tabBar, borderHeight: v } })}
              unit="px"
            />
            <ColorRow label="Border Color" value={theme.tabBar.borderColor} onChange={(v) => update({ tabBar: { ...theme.tabBar, borderColor: v } })} />
            <SliderRow
              label="Tab Padding"
              value={theme.tabBar.tabPaddingX}
              min={4}
              max={32}
              step={1}
              onChange={(v) => update({ tabBar: { ...theme.tabBar, tabPaddingX: v } })}
              unit="px"
            />
          </CollapsibleSection>

          {/* Pane */}
          <CollapsibleSection id="pane" title="Panes" openSection={openSection} setOpenSection={setOpenSection}>
            <SliderRow
              label="Border Width"
              value={theme.pane.borderWidth}
              min={0}
              max={4}
              step={1}
              onChange={(v) => update({ pane: { ...theme.pane, borderWidth: v } })}
              unit="px"
            />
            <ColorRow label="Border Color" value={theme.pane.borderColor} onChange={(v) => update({ pane: { ...theme.pane, borderColor: v } })} />
            <ColorRow label="Active Border" value={theme.pane.activeBorderColor} onChange={(v) => update({ pane: { ...theme.pane, activeBorderColor: v } })} />
            <SliderRow
              label="Splitter Size"
              value={theme.pane.splitterSize}
              min={2}
              max={12}
              step={1}
              onChange={(v) => update({ pane: { ...theme.pane, splitterSize: v } })}
              unit="px"
            />
          </CollapsibleSection>

          {/* Animations */}
          <CollapsibleSection id="animations" title="Animations" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="settings-row">
              <span className="settings-label">Enabled</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={theme.animations.enabled}
                  onChange={(e) => update({ animations: { ...theme.animations, enabled: e.target.checked } })}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <SliderRow
              label="Duration"
              value={theme.animations.duration}
              min={50}
              max={1000}
              step={50}
              onChange={(v) => update({ animations: { ...theme.animations, duration: v } })}
              unit="ms"
            />
            <div className="settings-row">
              <span className="settings-label">Easing</span>
              <select
                className="settings-select"
                value={theme.animations.easing}
                onChange={(e) => update({ animations: { ...theme.animations, easing: e.target.value } })}
              >
                <option value="ease">Ease</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-out">Ease Out</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="linear">Linear</option>
                <option value="cubic-bezier(0.16, 1, 0.3, 1)">Expo Out</option>
                <option value="cubic-bezier(0.85, 0, 0.15, 1)">Circ In Out</option>
              </select>
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </>
  );
}
