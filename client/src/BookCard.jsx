import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

function BookCard({ book }) {
  const navigate = useNavigate();
  if (!book) return null;

  const {
    id,
    title,
    author,
    description,
    coverImage,
    genre,
    availableCopies = 0,
    totalCopies = 1,
  } = book;

  const genreName = typeof genre === 'object' && genre !== null ? genre.name : (genre || 'General');
  const isAvailable = availableCopies > 0;

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    navigate(`/books/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/books/${id}`);
    }
  };

  return (
    <article
      className="book-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      style={{ cursor: 'pointer' }}
      aria-label={`${title} by ${author}`}
    >
      <div className="card-cover-container">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Cover of ${title}`}
            className="card-cover-image"
            loading="lazy"
          />
        ) : (
          <div className="card-cover-placeholder">
            <BookOpen size={40} className="card-cover-icon" />
            <span className="card-cover-genre">{genreName}</span>
          </div>
        )}
        <div
          className={`card-availability-badge ${
            isAvailable ? 'badge-in-stock' : 'badge-out-of-stock'
          }`}
        >
          {isAvailable ? `${availableCopies} Available` : 'Checked Out'}
        </div>
      </div>

      <div className="card-content">
        {genreName && <span className="card-genre-tag">{genreName}</span>}
        <h3 className="card-title" title={title}>
          {title}
        </h3>
        <p className="card-author">by {author}</p>
        <p className="card-description">{description || 'No description available.'}</p>

        <div className="card-footer">
          <div className="card-copies-info">
            Copies: <strong>{availableCopies}</strong> / {totalCopies}
          </div>
          <Link
            to={`/books/${id}`}
            className="card-detail-btn"
            aria-label={`View details for ${title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
