import React, { useState, useEffect } from 'react';
import '../../styles/premium/BookLibrary.css';

const BookLibrary = ({ isPremium = false }) => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Sample book data - in production, this would come from your backend
  const sampleBooks = [
    {
      id: 1,
      title: 'Atomic Habits',
      author: 'James Clear',
      category: 'productivity',
      readTime: 15,
      summary: 'Master the tiny changes that lead to remarkable results. Learn the four laws of behavior change and how to build good habits and break bad ones.',
      keyTakeaways: [
        'Small changes compound into remarkable results over time',
        'Focus on systems, not goals',
        'Make it obvious, attractive, easy, and satisfying',
        'Environment design is crucial for habit formation'
      ],
      coverColor: '#4f46e5'
    },
    {
      id: 2,
      title: 'Deep Work',
      author: 'Cal Newport',
      category: 'productivity',
      readTime: 12,
      summary: 'Rules for focused success in a distracted world. Learn how to cultivate deep work and eliminate shallow work to maximize your professional output.',
      keyTakeaways: [
        'Deep work is becoming increasingly rare and valuable',
        'Schedule every minute of your day',
        'Embrace boredom to strengthen focus',
        'Quit social media that doesn\'t serve your goals'
      ],
      coverColor: '#0891b2'
    },
    {
      id: 3,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      category: 'finance',
      readTime: 14,
      summary: 'Timeless lessons on wealth, greed, and happiness. Understand how psychology affects financial decisions and long-term wealth building.',
      keyTakeaways: [
        'Wealth is what you don\'t see',
        'Time is the most powerful force in investing',
        'Room for error is crucial in financial planning',
        'Define your version of enough'
      ],
      coverColor: '#059669'
    },
    {
      id: 4,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      category: 'psychology',
      readTime: 18,
      summary: 'Explore the two systems that drive the way we think. System 1 is fast and intuitive, System 2 is slow and deliberate.',
      keyTakeaways: [
        'We have two thinking systems: fast and slow',
        'Cognitive biases affect our decisions',
        'Loss aversion is more powerful than gain seeking',
        'What you see is all there is (WYSIATI)'
      ],
      coverColor: '#dc2626'
    },
    {
      id: 5,
      title: 'The Lean Startup',
      author: 'Eric Ries',
      category: 'business',
      readTime: 13,
      summary: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses through validated learning.',
      keyTakeaways: [
        'Build-Measure-Learn feedback loop',
        'Minimum Viable Product (MVP) approach',
        'Validated learning over vanity metrics',
        'Pivot or persevere decisions'
      ],
      coverColor: '#ea580c'
    },
    {
      id: 6,
      title: 'Influence',
      author: 'Robert Cialdini',
      category: 'psychology',
      readTime: 16,
      summary: 'The psychology of persuasion. Learn the six universal principles of influence and how they can be used ethically.',
      keyTakeaways: [
        'Six principles: Reciprocity, Commitment, Social Proof, Authority, Liking, Scarcity',
        'Understanding triggers of automatic compliance',
        'Ethical use of persuasion techniques',
        'Defense against manipulation'
      ],
      coverColor: '#7c3aed'
    }
  ];

  useEffect(() => {
    setBooks(sampleBooks);
  }, []);

  const categories = [
    { id: 'all', label: 'All Books', icon: '📚' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'psychology', label: 'Psychology', icon: '🧠' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'leadership', label: 'Leadership', icon: '👑' }
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookSelect = (book) => {
    if (!isPremium) {
      alert('This feature is available for Premium members only. Upgrade to access the Executive Library!');
      return;
    }
    setSelectedBook(book);
  };

  const closeBookModal = () => {
    setSelectedBook(null);
  };

  return (
    <div className="book-library">
      <div className="library-header">
        <div className="header-content">
          <h2>📚 Executive Library</h2>
          <p>Curated summaries of the world's most influential books</p>
          {!isPremium && (
            <div className="premium-badge-banner">
              <span className="lock-icon">🔒</span>
              <span>Premium Feature - Upgrade to unlock</span>
            </div>
          )}
        </div>

        <div className="library-controls">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${filterCategory === cat.id ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div
            key={book.id}
            className={`book-card ${!isPremium ? 'locked' : ''}`}
            onClick={() => handleBookSelect(book)}
            style={{ '--book-color': book.coverColor }}
          >
            {!isPremium && <div className="lock-overlay">🔒</div>}
            <div className="book-cover" style={{ background: book.coverColor }}>
              <div className="book-spine"></div>
            </div>
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <div className="book-meta">
                <span className="read-time">⏱️ {book.readTime} min</span>
                <span className="book-category">{book.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">📭</span>
          <p>No books found matching your search</p>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="book-modal-overlay" onClick={closeBookModal}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBookModal}>×</button>
            
            <div className="modal-header">
              <div className="modal-cover" style={{ background: selectedBook.coverColor }}>
                <div className="modal-spine"></div>
              </div>
              <div className="modal-title-section">
                <h2>{selectedBook.title}</h2>
                <p className="modal-author">by {selectedBook.author}</p>
                <div className="modal-meta">
                  <span className="meta-item">⏱️ {selectedBook.readTime} min read</span>
                  <span className="meta-item">📂 {selectedBook.category}</span>
                </div>
              </div>
            </div>

            <div className="modal-content">
              <section className="summary-section">
                <h3>📖 Summary</h3>
                <p>{selectedBook.summary}</p>
              </section>

              <section className="takeaways-section">
                <h3>💡 Key Takeaways</h3>
                <ul className="takeaways-list">
                  {selectedBook.keyTakeaways.map((takeaway, index) => (
                    <li key={index}>{takeaway}</li>
                  ))}
                </ul>
              </section>

              <div className="modal-actions">
                <button className="action-btn primary">
                  📚 Add to Reading List
                </button>
                <button className="action-btn secondary">
                  📝 Take Notes
                </button>
                <button className="action-btn secondary">
                  🔗 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLibrary;
