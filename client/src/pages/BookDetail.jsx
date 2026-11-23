import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, Bookmark, Calendar, Barcode } from 'lucide-react';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedNotice, setBorrowedNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/books/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Book #${id} was not found in the catalog.`);
          }
          throw new Error(`Failed to load book: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (isMounted) {
          setBook(data);
        }
      } catch (err) {
        console.error('Error fetching book detail:', err);
        if (isMounted) {
          setError(err.message || 'An error occurred while loading book details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBorrow = () => {
    if (!book || book.availableCopies <= 0) return;
    setBook((prev) => ({
      ...prev,
      availableCopies: prev.availableCopies - 1,
    }));
    setBorrowedNotice(true);
  };

  if (loading) {
    return (
      <div className="detail-page-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Back to Catalog
        </Link>
        <div className="detail-card">
          <div className="detail-layout">
            <div className="detail-cover-pane">
              <div
                style={{
                  width: '200px',
                  height: '280px',
                  backgroundColor: '#334155',
                  borderRadius: '8px',
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="detail-info-pane">
              <div className="skeleton-line short" style={{ marginBottom: '1rem' }} />
              <div className="skeleton-line title" style={{ marginBottom: '1rem' }} />
              <div className="skeleton-line medium" style={{ marginBottom: '2rem' }} />
              <div className="skeleton-line" style={{ marginBottom: '0.5rem' }} />
              <div className="skeleton-line" style={{ marginBottom: '0.5rem' }} />
              <div className="skeleton-line" style={{ marginBottom: '0.5rem' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="detail-page-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Back to Catalog
        </Link>
        <div className="state-box">
          <div className="state-icon-wrapper error">
            <AlertTriangle size={36} />
          </div>
          <h3 className="state-title">Book Not Found</h3>
          <p className="state-message">
            {error || "We couldn't locate the requested book in our database."}
          </p>
          <Link to="/" className="state-action-btn">
            Return to Catalog Home
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    author,
    isbn,
    description,
    coverImage,
    genre,
    availableCopies,
    totalCopies,
    createdAt,
  } = book;

  const isAvailable = availableCopies > 0;
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="detail-page-container">
      <Link to="/" className="back-link" aria-label="Return to catalog home">
        <ArrowLeft size={18} />
        Back to Catalog
      </Link>

      {borrowedNotice && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle size={20} color="#059669" />
          <span>
            <strong>Success!</strong> You have borrowed <em>{title}</em>. Please collect your copy from the patron circulation desk.
          </span>
        </div>
      )}

      <article className="detail-card">
        <div className="detail-layout">
          {/* Cover Art Column */}
          <div className="detail-cover-pane">
            {coverImage ? (
              <img src={coverImage} alt={`Cover of ${title}`} />
            ) : (
              <div className="detail-art-book">
                <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase' }}>
                  {genre?.name || 'Library Collection'}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      lineHeight: '1.2',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#93c5fd' }}>{author}</p>
                </div>
                <BookOpen size={28} style={{ opacity: 0.7 }} />
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="detail-info-pane">
            {genre?.name && <span className="detail-genre-badge">{genre.name}</span>}

            <h1 className="detail-title">{title}</h1>
            <p className="detail-author">by {author}</p>

            {/* Quick Stats Grid */}
            <div className="detail-stats-grid">
              <div className="stat-item">
                <span className="stat-label">Availability</span>
                <span
                  className="stat-value"
                  style={{ color: isAvailable ? '#059669' : '#dc2626' }}
                >
                  {isAvailable ? `${availableCopies} Available` : 'Checked Out'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Copies</span>
                <span className="stat-value">{totalCopies}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ISBN</span>
                <span className="stat-value" style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>
                  {isbn}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cataloged On</span>
                <span className="stat-value" style={{ fontSize: '0.88rem' }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Book Description */}
            <h2 className="detail-section-title">Synopsis & Summary</h2>
            <p className="detail-description">
              {description || 'No detailed synopsis provided for this title.'}
            </p>

            {/* Patron Actions */}
            <div className="detail-actions">
              <button
                type="button"
                className="btn-borrow"
                disabled={!isAvailable}
                onClick={handleBorrow}
              >
                <Bookmark size={18} />
                {isAvailable ? 'Borrow This Book' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BookDetail;
