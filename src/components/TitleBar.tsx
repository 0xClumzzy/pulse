import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTerminalStore } from '../store/terminal';

export function TitleBar() {
  const toggleSettings = useTerminalStore((s) => s.toggleSettings);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div
        className="titlebar-title"
        data-tauri-drag-region={false}
        onClick={(e) => {
          e.stopPropagation();
          toggleSettings();
        }}
        style={{ cursor: 'pointer' }}
      >
        Pulse
      </div>
      <div className="titlebar-controls">
        <button
          className="titlebar-btn minimize"
          onClick={() => getCurrentWindow().minimize()}
        />
        <button
          className="titlebar-btn maximize"
          onClick={() => getCurrentWindow().toggleMaximize()}
        />
        <button
          className="titlebar-btn close"
          onClick={() => getCurrentWindow().close()}
        />
      </div>
    </div>
  );
}
