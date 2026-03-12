const db = require("../data/library");


exports.add = (bookId, authorId) => {
  db.prepare(`
    INSERT INTO book_authors (book_id, author_id)
    VALUES (?, ?)
  `).run(bookId, authorId);
};


exports.removeByBook = (bookId) => {
  db.prepare(`
    DELETE FROM book_authors
    WHERE book_id = ?
  `).run(bookId);
};

exports.getAuthorsForBook = (bookId) => {
  return db.prepare(`
    SELECT a.id, a.name
    FROM authors a
    JOIN book_authors ba ON ba.author_id = a.id
    WHERE ba.book_id = ?
  `).all(bookId);
};
