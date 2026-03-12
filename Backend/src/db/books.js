const db = require("../data/library");


exports.getAll = () => {
  return db.prepare(`
    SELECT 
      b.id,
      b.title,
      b.year,
      b.isbn
    FROM books b
    ORDER BY b.title ASC
  `).all();
};


exports.getById = (id) => {
  return db
    .prepare(
      `SELECT 
        b.id,
        b.title,
        b.year,
        b.isbn,
        GROUP_CONCAT(a.name, ', ') AS authors
      FROM books b
      LEFT JOIN book_authors ba ON ba.book_id = b.id
      LEFT JOIN authors a ON a.id = ba.author_id
      WHERE b.id = ?
      GROUP BY b.id`
    )
    .get(id);
};

exports.create = (title, year, isbn) => {
  const result = db
    .prepare(
      "INSERT INTO books (title, year, isbn) VALUES (?, ?, ?)"
    )
    .run(title, year, isbn);

  return result.lastInsertRowid;
};


exports.update = (id, title, year, isbn) => {
  return db
    .prepare(
      "UPDATE books SET title = ?, year = ?, isbn = ? WHERE id = ?"
    )
    .run(title, year, isbn, id);
};

exports.remove = (id) => {
  return db.prepare("DELETE FROM books WHERE id = ?").run(id);
};