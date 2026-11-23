import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

function BookCard({ book }) {
  if (!book) return null;

  const {
    id,
    title,
    author,
    description,
    coverImage,
    genre,
    availableCopies,
    totalCopies,
  } = book;

  const isAvailable = availableCopies > 0;

  return (
    <article className="book-card">
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
            <span className="card-cover-genre">{genre?.name || 'Catalog Item'}</span>
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
        {genre?.name && <span className="card-genre-tag">{genre.name}</span>}
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
