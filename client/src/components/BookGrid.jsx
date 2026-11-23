import React, { useState, useEffect, useMemo, useCallback } from 'react';
import BookCard from './BookCard';
import { BookX, AlertCircle, RefreshCw } from 'lucide-react';

function BookGrid({ genreId, search, sortBy = 'default', onResetFilters }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const params = new URLSearchParams();

      if (genreId !== undefined && genreId !== null && genreId !== '') {
        params.append('genreId', genreId);
      }

      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }

      // Patron catalog browsing: fetch generous limit to accommodate catalog view
      params.append('limit', '100');

      const queryString = params.toString();
      const endpoint = `${baseUrl}/books${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message || 'An error occurred while fetching books.');
    } finally {
      setLoading(false);
    }
  }, [genreId, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Sort stretch task: Sort books by title or author
  const sortedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    const list = [...books];

    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      list.sort((a, b) => a.author.localeCompare(b.author));
    }

    return list;
  }, [books, sortBy]);

  // Skeleton loading UI (Stretch Task)
  if (loading) {
    return (
      <div className="book-grid" aria-label="Loading catalog books" aria-busy="true">
        {[...Array(6)].map((_, index) => (
          <div key={`skeleton-${index}`} className="skeleton-card">
            <div className="skeleton-cover" />
            <div className="skeleton-body">
              <div className="skeleton-line short" />
              <div className="skeleton-line title" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <div className="skeleton-line short" />
                <div className="skeleton-line btn" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="state-box">
        <div className="state-icon-wrapper error">
          <AlertCircle size={32} />
        </div>
        <h3 className="state-title">Unable to Load Books</h3>
        <p className="state-message">{error}</p>
        <button type="button" className="state-action-btn" onClick={fetchBooks}>
          <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (sortedBooks.length === 0) {
    return (
      <div className="state-box">
        <div className="state-icon-wrapper empty">
          <BookX size={36} />
        </div>
        <h3 className="state-title">No Books Found</h3>
        <p className="state-message">
          {search || genreId
            ? 'No books match your current search and filter criteria. Try searching with different terms or selecting another genre.'
            : 'The library catalog is currently empty. Check back soon for new arrivals.'}
        </p>
        {(search || genreId) && onResetFilters && (
          <button type="button" className="state-action-btn" onClick={onResetFilters}>
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  // Loaded book grid with mapped BookCard using book.id as key
  return (
    <div className="book-grid" role="feed" aria-label="Book catalog">
      {sortedBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
