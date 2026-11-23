import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({
  onSearch,
  onChange,
  value: controlledValue,
  placeholder = 'Search by title or author...',
}) {
  const [searchTerm, setSearchTerm] = useState(controlledValue ?? '');

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchTerm(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
      if (onChange) {
        onChange(searchTerm);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, onSearch, onChange]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) onSearch('');
    if (onChange) onChange('');
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
        onChange={handleChange}
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
