import { memo } from 'react';
import { useTerminalStore } from '../store/terminal';
import { HOST_COLORS, HOST_LABELS } from '../types/terminal';
import type { Tab, HostEnvironment } from '../types/terminal';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  hostTag?: { environment: HostEnvironment; color: string; label: string };
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const TabItem = memo(function TabItem({ tab, isActive, hostTag, onSelect, onClose }: TabItemProps) {
  return (
    <div
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.id)}
      style={hostTag && hostTag.environment !== 'unknown' ? {
        borderLeft: `3px solid ${HOST_COLORS[hostTag.environment]}`,
      } : undefined}
    >
      {hostTag && hostTag.environment !== 'unknown' && (
        <span
          className="tab-host-tag"
          style={{
            color: HOST_COLORS[hostTag.environment],
            borderColor: HOST_COLORS[hostTag.environment],
          }}
        >
          {HOST_LABELS[hostTag.environment]}
        </span>
      )}
      <span>{tab.title}</span>
      <span
        className="tab-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
      >
        ×
      </span>
    </div>
  );
});

export function TabBar() {
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const addTab = useTerminalStore((s) => s.addTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const setActiveTab = useTerminalStore((s) => s.setActiveTab);
  const hostTags = useTerminalStore((s) => s.hostTags);

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          hostTag={hostTags[tab.id]}
          onSelect={setActiveTab}
          onClose={closeTab}
        />
      ))}
      <div className="tab-add" onClick={addTab}>+</div>
    </div>
  );
}
