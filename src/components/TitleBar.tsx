import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTerminalStore } from '../store/terminal';

export function TitleBar() {
  const theme = useTerminalStore((s) => s.theme);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-title">Pulse</div>
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
