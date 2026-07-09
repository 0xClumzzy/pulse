import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTerminalStore } from '../store/terminal';

export function TitleBar() {
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);
  const cosmicText = useTerminalStore((s) => s.cosmicText);
  const toggleCosmicText = useTerminalStore((s) => s.toggleCosmicText);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-title" data-tauri-drag-region>
        Pulse
      </div>
      <div className="titlebar-controls">
        <button
          className={`titlebar-btn cosmic ${cosmicText ? 'active' : ''}`}
          title="Cosmic Text"
          onMouseDown={(e) => {
            e.stopPropagation();
            toggleCosmicText();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </button>
        <button
          className="titlebar-btn settings"
          title="Settings"
          onMouseDown={(e) => {
            e.stopPropagation();
            toggleSettings();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
        <button
          className="titlebar-btn minimize"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => getCurrentWindow().minimize()}
        />
        <button
          className="titlebar-btn maximize"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => getCurrentWindow().toggleMaximize()}
        />
        <button
          className="titlebar-btn close"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => getCurrentWindow().close()}
        />
      </div>
    </div>
  );
}
