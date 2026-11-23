import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';
import { ArrowUpDown, Filter, Sparkles } from 'lucide-react';

function HomePage() {
  // Shared filter state
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // Stretch: 'default' | 'title' | 'author'

  // Genres state
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Fetch genres for the genre filter
  useEffect(() => {
    let isMounted = true;
    const fetchGenres = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/genres`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setGenres(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      } finally {
        if (isMounted) setGenresLoading(false);
      }
    };

    fetchGenres();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetFilters = () => {
    setSelectedGenreId('');
    setSearchQuery('');
    setSortBy('default');
  };

  return (
    <div className="home-page">
      {/* Hero Welcome */}
      <section className="hero-banner">
        <h2 className="hero-title">Explore the Library Catalog</h2>
        <p className="hero-text">
          Browse our extensive collection of classic and contemporary literature, biographies, and science fiction. Discover your next favorite read today.
        </p>
      </section>

      {/* Controls: Search, Sort & Genre Filter holding shared filter state */}
      <section className="controls-panel" aria-label="Catalog Filters">
        <div className="search-and-sort">
          {/* Debounced live search bar */}
          <SearchBar onSearch={setSearchQuery} />

          {/* Stretch Task: Sort Control (by title or author) */}
          <div className="sort-control-wrapper">
            <ArrowUpDown size={16} className="text-muted" />
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort catalog books"
            >
              <option value="default">Default Order</option>
              <option value="title">Title (A - Z)</option>
              <option value="author">Author (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Working Genre Filter */}
        <div className="genre-filter-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="#64748b" />
            <span className="genre-filter-title">Filter by Genre</span>
          </div>

          <div className="genre-pills" role="radiogroup" aria-label="Genre Filter Options">
            <button
              type="button"
              className={`genre-pill ${selectedGenreId === '' ? 'active' : ''}`}
              onClick={() => setSelectedGenreId('')}
              role="radio"
              aria-checked={selectedGenreId === ''}
            >
              All Genres
            </button>

            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`genre-pill ${
                  String(selectedGenreId) === String(genre.id) ? 'active' : ''
                }`}
                onClick={() => setSelectedGenreId(String(genre.id))}
                role="radio"
                aria-checked={String(selectedGenreId) === String(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active filters notice */}
      {(selectedGenreId || searchQuery) && (
        <div className="filter-summary-bar">
          <span className="results-count">
            Filtering by: {searchQuery && <strong>"{searchQuery}"</strong>}
            {searchQuery && selectedGenreId && ' in '}
            {selectedGenreId && (
              <strong>
                {genres.find((g) => String(g.id) === String(selectedGenreId))?.name || 'Selected Genre'}
              </strong>
            )}
          </span>
          <button type="button" className="reset-filters-btn" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* Book Grid rendering responsive grid of BookCards */}
      <BookGrid
        genreId={selectedGenreId}
        search={searchQuery}
        sortBy={sortBy}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}

export default HomePage;
