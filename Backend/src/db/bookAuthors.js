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

exports.getAuthorsForBook = (authorId) => {
  return db.prepare(`
    SELECT book_id
    FROM book_authors
    WHERE author_id = ?
  `).all(authorId);
};