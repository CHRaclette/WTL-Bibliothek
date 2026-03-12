const db = require("../data/library");
const crypto = require("crypto");


exports.getAll = () => {
  const books = db.prepare(`
    SELECT id, title, year, isbn
    FROM books
    ORDER BY title ASC
  `).all();


  const getAuthors = db.prepare(`
    SELECT a.id, a.name
    FROM authors a
    JOIN book_authors ba ON ba.author_id = a.id
    WHERE ba.book_id = ?
  `);

  return books.map(b => ({
    ...b,
    authors: getAuthors.all(b.id)
  }));
};


exports.getById = (id) => {
  const book = db.prepare(`
    SELECT id, title, year, isbn
    FROM books
    WHERE id = ?
  `).get(id);

  if (!book) return null;

  const authors = db.prepare(`
    SELECT a.id, a.name
    FROM authors a
    JOIN book_authors ba ON ba.author_id = a.id
    WHERE ba.book_id = ?
  `).all(id);

  return { ...book, authors };
};


exports.create = (title, year, isbn, authorIds) => {
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO books (id, title, year, isbn)
    VALUES (?, ?, ?, ?)
  `).run(id, title, year, isbn);

  const link = db.prepare(`
    INSERT INTO book_authors (book_id, author_id)
    VALUES (?, ?)
  `);

  for (const aid of authorIds) {
    link.run(id, aid);
  }

  return id;
};


exports.update = (id, title, year, isbn) => {
  db.prepare(`
    UPDATE books
    SET title = ?, year = ?, isbn = ?
    WHERE id = ?
  `).run(title, year, isbn,id);
};


exports.removeByBook = (bookId) => {
  db.prepare(`
    DELETE FROM book_authors
    WHERE book_id = ?
  `).run(bookId);
};


exports.add = (bookId, authorId) => {
  db.prepare(`
    INSERT INTO book_authors (book_id, author_id)
    VALUES (?, ?)
  `).run(bookId, authorId);
};


exports.remove = (id) => {
  return db.prepare("DELETE FROM books WHERE id = ?").run(id);
};

