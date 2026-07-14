import { useState } from 'react';
import { useTerminalStore } from '../store/terminal';

export function HandlerPanel() {
  const handlerOpen = useTerminalStore((s) => s.handlerOpen);
  const toggleHandler = useTerminalStore((s) => s.toggleHandler);
  const handlers = useTerminalStore((s) => s.handlers);
  const startHandler = useTerminalStore((s) => s.startHandler);
  const stopHandler = useTerminalStore((s) => s.stopHandler);
  const removeHandler = useTerminalStore((s) => s.removeHandler);
  const [port, setPort] = useState('4444');

  if (!handlerOpen) return null;

  const handleStart = () => {
    const portNum = parseInt(port, 10);
    if (portNum > 0 && portNum < 65536) {
      startHandler(portNum);
    }
  };

  return (
    <div className="handler-panel">
      <div className="handler-header">
        <span className="handler-title">Reverse Shell Handlers</span>
        <button className="handler-close" onClick={toggleHandler}>×</button>
      </div>

      <div className="handler-new">
        <input
          className="handler-port-input"
          type="number"
          min="1"
          max="65535"
          placeholder="Port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleStart();
          }}
        />
        <button className="handler-start-btn" onClick={handleStart}>
          Start Listener
        </button>
      </div>

      <div className="handler-list">
        {handlers.length === 0 && (
          <div className="handler-empty">No active handlers. Start one above.</div>
        )}
        {handlers.map((handler) => (
          <div key={handler.id} className="handler-item">
            <div className="handler-item-header">
              <span className="handler-port">:{handler.port}</span>
              <span className={`handler-status ${handler.status}`}>
                {handler.status}
              </span>
            </div>
            <div className="handler-connections">
              {handler.connections.length === 0 ? (
                <span className="handler-no-conn">Waiting for connections...</span>
              ) : (
                handler.connections.map((conn) => (
                  <div key={conn.id} className="handler-conn">
                    <span className="handler-conn-addr">{conn.remote_addr}</span>
                    <span className="handler-conn-time">
                      {new Date(parseInt(conn.connected_at) * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="handler-actions">
              {handler.status === 'listening' ? (
                <button
                  className="handler-action-btn stop"
                  onClick={() => stopHandler(handler.id)}
                >
                  Stop
                </button>
              ) : (
                <button
                  className="handler-action-btn remove"
                  onClick={() => removeHandler(handler.id)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
