import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from './SearchBar';
import BookGrid from './BookGrid';
import { ArrowUpDown, Filter } from 'lucide-react';

function HomePage() {
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Genres state
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Books state managed at page level
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState(null);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

  // Fetch genres
  useEffect(() => {
    let isMounted = true;
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${baseUrl}/genres`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            const list = Array.isArray(data)
              ? data
              : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.genres) ? data.genres : []));
            setGenres(list);
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
  }, [baseUrl]);

  // Fetch books based on selectedGenreId and searchQuery
  const fetchBooks = useCallback(async () => {
    let isMounted = true;
    setBooksLoading(true);
    setBooksError(null);

    try {
      const params = new URLSearchParams();
      if (selectedGenreId !== undefined && selectedGenreId !== null && selectedGenreId !== '') {
        params.append('genreId', selectedGenreId);
      }
      if (searchQuery && searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }
      params.append('limit', '100');

      const queryString = params.toString();
      const endpoint = `${baseUrl}/books${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to load books: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.books) ? data.books : []));

      if (isMounted) {
        setBooks(list);
      }
    } catch (err) {
      console.error('Error fetching catalog books:', err);
      if (isMounted) {
        setBooksError(err.message || 'An error occurred while fetching books.');
      }
    } finally {
      if (isMounted) {
        setBooksLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [baseUrl, selectedGenreId, searchQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleResetFilters = () => {
    setSelectedGenreId('');
    setSearchQuery('');
    setSortBy('default');
  };

  const sortedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    const list = [...books];
    if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'author') {
      list.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
    }
    return list;
  }, [books, sortBy]);

  return (
    <div className="home-page">
      {/* Hero Welcome Banner */}
      <section className="hero-banner">
        <h2 className="hero-title">Explore the Library Catalog</h2>
        <p className="hero-text">
          Browse our extensive collection of classic and contemporary literature, biographies, and science fiction. Discover your next favorite read today.
        </p>
      </section>

      {/* Controls: Search, Sort & Genre Filter */}
      <section className="controls-panel" aria-label="Catalog Filters">
        <div className="search-and-sort">
          <SearchBar onSearch={setSearchQuery} />

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

        {/* Genre Filter with All option */}
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

      {/* Active Filter Notice */}
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

      {/* Book Grid */}
      <BookGrid
        books={sortedBooks}
        loading={booksLoading}
        error={booksError}
        genreId={selectedGenreId}
        search={searchQuery}
        sortBy={sortBy}
        onResetFilters={handleResetFilters}
        onRetry={fetchBooks}
      />
    </div>
  );
}

export default HomePage;
