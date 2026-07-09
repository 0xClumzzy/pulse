import { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '../store/terminal';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  searchAddon: React.MutableRefObject<any | null>;
}

export function SearchBar({ searchAddon }: SearchBarProps) {
  const searchOpen = useTerminalStore((s) => s.searchOpen);
  const toggleSearch = useTerminalStore((s) => s.toggleSearch);
  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

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

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchAddon.current && e.target.value) {
                searchAddon.current.findNext(e.target.value);
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
