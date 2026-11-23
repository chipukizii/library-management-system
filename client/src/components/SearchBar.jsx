import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ onSearch, placeholder = 'Search by title or author...' }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-icon-left">
        <Search size={18} />
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search catalog"
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
