import { useTerminalStore } from '../store/terminal';
import { HOST_COLORS, HOST_LABELS } from '../types/terminal';

export function TabBar() {
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const addTab = useTerminalStore((s) => s.addTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const setActiveTab = useTerminalStore((s) => s.setActiveTab);
  const hostTags = useTerminalStore((s) => s.hostTags);

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const tag = hostTags[tab.id];
        return (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={tag && tag.environment !== 'unknown' ? {
              borderLeft: `3px solid ${HOST_COLORS[tag.environment]}`,
            } : undefined}
          >
            {tag && tag.environment !== 'unknown' && (
              <span
                className="tab-host-tag"
                style={{
                  color: HOST_COLORS[tag.environment],
                  borderColor: HOST_COLORS[tag.environment],
                }}
              >
                {HOST_LABELS[tag.environment]}
              </span>
            )}
            <span>{tab.title}</span>
            <span
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </span>
          </div>
        );
      })}
      <div className="tab-add" onClick={addTab}>+</div>
    </div>
  );
}
