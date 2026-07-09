import { useState, useRef, useCallback, useEffect, memo } from 'react';
import Terminal from './Terminal';
import { SearchAddon } from '@xterm/addon-search';

interface PaneData {
  id: string;
  ptyId?: string;
  direction?: 'horizontal' | 'vertical';
  children?: PaneData[];
  size?: number;
}

interface SplitPaneProps {
  pane: PaneData;
  isFocused: boolean;
  onFocus: (paneId: string) => void;
  searchAddon?: React.MutableRefObject<SearchAddon | null>;
}

export function SplitPane({ pane, isFocused, onFocus, searchAddon }: SplitPaneProps) {
  const [splitPosition, setSplitPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(pane.direction);
  directionRef.current = pane.direction;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = directionRef.current === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let position: number;

      if (directionRef.current === 'horizontal') {
        position = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        position = ((e.clientY - rect.top) / rect.height) * 100;
      }

      setSplitPosition(Math.max(20, Math.min(80, position)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!pane.children || pane.children.length < 2) {
    return (
      <div className={`pane ${isFocused ? 'focused' : ''}`} style={{ width: '100%', height: '100%' }}>
        <Terminal
          paneId={pane.id}
          isFocused={isFocused}
          onFocus={() => onFocus(pane.id)}
          searchAddon={searchAddon}
        />
      </div>
    );
  }

  const [first, second] = pane.children;
  const isHorizontal = pane.direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={`pane-container ${isHorizontal ? 'horizontal' : 'vertical'}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${splitPosition}%`,
          overflow: 'hidden',
        }}
      >
        <SplitPane
          pane={first}
          isFocused={isFocused && first.id === pane.id}
          onFocus={onFocus}
          searchAddon={searchAddon}
        />
      </div>
      <div
        className={`splitter ${isHorizontal ? 'horizontal' : 'vertical'}`}
        onMouseDown={handleMouseDown}
      />
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - splitPosition}%`,
          overflow: 'hidden',
        }}
      >
        <SplitPane
          pane={second}
          isFocused={isFocused && second.id === pane.id}
          onFocus={onFocus}
          searchAddon={searchAddon}
        />
      </div>
    </div>
  );
}

export default memo(SplitPane);
