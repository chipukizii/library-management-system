import React, { useState, useEffect, useMemo, useCallback } from 'react';
import BookCard from './BookCard';
import { BookX, AlertCircle, RefreshCw } from 'lucide-react';

function BookGrid({
  books: propBooks,
  loading: propLoading,
  error: propError,
  genreId,
  search,
  sortBy = 'default',
  onResetFilters,
  onRetry,
}) {
  const [internalBooks, setInternalBooks] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const isControlled = propBooks !== undefined;

  const fetchBooksFallback = useCallback(async () => {
    if (isControlled) return;
    setInternalLoading(true);
    setInternalError(null);

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
      const params = new URLSearchParams();

      if (genreId !== undefined && genreId !== null && genreId !== '') {
        params.append('genreId', genreId);
      }

      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }

      params.append('limit', '100');

      const queryString = params.toString();
      const endpoint = `${baseUrl}/books${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.books) ? data.books : []));
      setInternalBooks(list);
    } catch (err) {
      console.error('Error fetching books in BookGrid:', err);
      setInternalError(err.message || 'An error occurred while fetching books.');
    } finally {
      setInternalLoading(false);
    }
  }, [isControlled, genreId, search]);

  useEffect(() => {
    if (!isControlled) {
      fetchBooksFallback();
    }
  }, [isControlled, fetchBooksFallback]);

  const rawBooks = isControlled ? propBooks : internalBooks;
  const loading = isControlled ? propLoading : internalLoading;
  const error = isControlled ? propError : internalError;

  const sortedBooks = useMemo(() => {
    if (!rawBooks || !Array.isArray(rawBooks)) return [];
    const list = [...rawBooks];

    if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'author') {
      list.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
    }

    return list;
  }, [rawBooks, sortBy]);

  // Loading state (shimmer skeleton cards)
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
    const handleRetry = onRetry || (!isControlled ? fetchBooksFallback : null);
    return (
      <div className="state-box" role="alert">
        <div className="state-icon-wrapper error">
          <AlertCircle size={32} />
        </div>
        <h3 className="state-title">Unable to Load Books</h3>
        <p className="state-message">{error}</p>
        {handleRetry && (
          <button type="button" className="state-action-btn" onClick={handleRetry}>
            <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Retry
          </button>
        )}
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

  // Loaded book grid with mapped BookCard components
  return (
    <div className="book-grid" role="feed" aria-label="Book catalog">
      {sortedBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
