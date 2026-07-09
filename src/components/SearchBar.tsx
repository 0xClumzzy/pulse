import { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '../store/terminal';
import { SearchAddon } from '@xterm/addon-search';

interface SearchBarProps {
  searchAddon: React.MutableRefObject<SearchAddon | null>;
}

export function SearchBar({ searchAddon }: SearchBarProps) {
  const searchOpen = useTerminalStore((s) => s.searchOpen);
  const toggleSearch = useTerminalStore((s) => s.toggleSearch);
  const activePaneId = useTerminalStore((s) => s.activePaneId);
  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || !searchAddon.current) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const addon = searchAddon.current;
    addon.clearDecorations();

    const disposable = addon.onDidChangeResults((e: { resultIndex: number; resultCount: number }) => {
      setCurrentMatch(e.resultCount > 0 ? e.resultIndex + 1 : 0);
      setMatchCount(e.resultCount);
    });

    return () => {
      disposable.dispose();
    };
  }, [searchOpen, searchAddon.current, activePaneId]);

  const handleSearch = (direction: 'next' | 'prev') => {
    if (!searchAddon.current || !query) return;

    if (direction === 'next') {
      searchAddon.current.findNext(query);
    } else {
      searchAddon.current.findPrevious(query);
    }
  };

  const handleClose = () => {
    if (searchAddon.current) {
      searchAddon.current.clearDecorations();
    }
    setQuery('');
    setMatchCount(0);
    setCurrentMatch(0);
    toggleSearch();
  };

  if (!searchOpen) return null;

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (searchAddon.current) {
            if (e.target.value) {
              searchAddon.current.findNext(e.target.value);
            } else {
              searchAddon.current.clearDecorations();
              setMatchCount(0);
              setCurrentMatch(0);
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.shiftKey ? 'prev' : 'next');
          } else if (e.key === 'Escape') {
            handleClose();
          }
        }}
      />
      <span className="search-count">
        {query ? `${currentMatch}/${matchCount}` : 'No results'}
      </span>
      <button
        className="search-btn"
        onClick={() => handleSearch('prev')}
        title="Previous (Shift+Enter)"
      >
        ↑
      </button>
      <button
        className="search-btn"
        onClick={() => handleSearch('next')}
        title="Next (Enter)"
      >
        ↓
      </button>
      <button
        className="search-btn"
        onClick={handleClose}
        title="Close (Escape)"
      >
        ×
      </button>
    </div>
  );
}
