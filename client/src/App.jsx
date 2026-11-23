import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import BookDetail from './BookDetail';
import { BookOpen } from 'lucide-react';

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-container">
          <Link to="/" className="brand-link" aria-label="Library Home">
            <div className="brand-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="brand-title">Athenaeum</h1>
              <span className="brand-subtitle">Library Management System</span>
            </div>
          </Link>
          <div className="header-badge">Patron Portal</div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
