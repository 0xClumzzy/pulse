import { useEffect } from 'react';
import { useReconStore } from '../store/recon';
import { useTerminalStore } from '../store/terminal';
import type { ReconEntry } from '../types/terminal';

const TYPE_ICONS: Record<string, string> = {
  cve: '!!',
  port: ':',
  url: '@',
  hostname: '#',
  jwt: '$',
  base64: 'B',
  private_ip: '*',
  credential: '!',
};

const TYPE_COLORS: Record<string, string> = {
  cve: '#f38ba8',
  port: '#89b4fa',
  url: '#a6e3a1',
  hostname: '#f9e2af',
  jwt: '#cba6f7',
  base64: '#fab387',
  private_ip: '#89dceb',
  credential: '#f38ba8',
};

export function ReconSidebar() {
  const reconOpen = useReconStore((s) => s.reconOpen);
  const toggleRecon = useReconStore((s) => s.toggleRecon);
  const reconSummary = useReconStore((s) => s.reconSummary);
  const reconEntries = useReconStore((s) => s.reconEntries);
  const hostKeyAlerts = useReconStore((s) => s.hostKeyAlerts);
  const refreshRecon = useReconStore((s) => s.refreshRecon);
  const clearRecon = useReconStore((s) => s.clearRecon);
  const activePaneId = useTerminalStore((s) => s.activePaneId);

  useEffect(() => {
    if (reconOpen) {
      refreshRecon();
      const interval = setInterval(refreshRecon, 5000);
      return () => clearInterval(interval);
    }
  }, [reconOpen, refreshRecon]);

  if (!reconOpen) return null;

  // Show entries for current pane only
  const paneEntries = reconEntries
    .filter((e) => e.pane_id === activePaneId)
    .reverse();

  return (
    <div className="recon-sidebar">
      <div className="recon-header">
        <span className="recon-title">Recon</span>
        <div className="recon-actions">
          <button className="recon-action" onClick={clearRecon} title="Clear">CLR</button>
          <button className="recon-close" onClick={toggleRecon}>×</button>
        </div>
      </div>

      <div className="recon-stats">
        <div className="recon-stat">
          <div className="recon-stat-value">{reconSummary.credentials_found}</div>
          <div className="recon-stat-label">Creds</div>
        </div>
        <div className="recon-stat">
          <div className="recon-stat-value">{reconSummary.commands_executed}</div>
          <div className="recon-stat-label">Cmds</div>
        </div>
        <div className="recon-stat">
          <div className="recon-stat-value">{reconSummary.connections_opened}</div>
          <div className="recon-stat-label">Conns</div>
        </div>
        <div className="recon-stat">
          <div className="recon-stat-value">{reconSummary.total_sessions}</div>
          <div className="recon-stat-label">Sess</div>
        </div>
      </div>

      {/* Host key alerts */}
      {hostKeyAlerts.length > 0 && (
        <>
          <div className="cp-section-title" style={{ padding: '6px 0 4px', color: '#f38ba8' }}>Host Key Alerts</div>
          <div className="recon-entries" style={{ maxHeight: 200, marginBottom: 8 }}>
            {hostKeyAlerts.slice().reverse().map((alert, i) => (
              <div key={i} className="recon-entry" style={{ borderColor: alert.severity === 'CRITICAL' ? 'rgba(243,139,168,0.3)' : 'rgba(250,179,135,0.3)' }}>
                <div className="recon-entry-header">
                  <span className="recon-entry-icon" style={{ color: '#f38ba8' }}>!</span>
                  <span className="recon-entry-type" style={{ color: '#f38ba8' }}>{alert.hostname}</span>
                </div>
                <div className="recon-entry-context" style={{ fontSize: 10 }}>
                  <div style={{ color: '#f38ba8' }}>Old: {alert.old_fingerprint.slice(0, 48)}</div>
                  <div style={{ color: '#a6e3a1' }}>New: {alert.new_fingerprint.slice(0, 48)}</div>
                  <div style={{ color: '#6c7086' }}>{alert.key_type} | {alert.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="cp-section-title" style={{ padding: '6px 0 4px' }}>Pane Recon</div>
      <div className="recon-entries">
        {paneEntries.length === 0 && (
          <div className="recon-empty">No recon data yet for this pane.</div>
        )}
        {paneEntries.map((entry) => (
          <ReconEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function ReconEntryRow({ entry }: { entry: ReconEntry }) {
  const icon = TYPE_ICONS[entry.entry_type] || '?';
  const color = TYPE_COLORS[entry.entry_type] || '#6c7086';

  return (
    <div className="recon-entry">
      <div className="recon-entry-header">
        <span className="recon-entry-icon" style={{ color }}>{icon}</span>
        <span className="recon-entry-type" style={{ color }}>{entry.entry_type.toUpperCase()}</span>
        <span className="recon-entry-time">
          {new Date(entry.timestamp * 1000).toLocaleTimeString()}
        </span>
      </div>
      <div className="recon-entry-value">{entry.value}</div>
      {entry.context && (
        <div className="recon-entry-context">{entry.context}</div>
      )}
    </div>
  );
}
