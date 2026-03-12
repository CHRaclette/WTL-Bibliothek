const db = require("./library");
const crypto = require("crypto");

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  DELETE FROM book_authors;
  DELETE FROM books;
  DELETE FROM authors;
`);

const insertAuthor = db.prepare("INSERT INTO authors (id, name) VALUES (?, ?)");
const insertBook   = db.prepare("INSERT INTO books (id, title, year, isbn) VALUES (?, ?, ?, ?)");
const link         = db.prepare("INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)");


const a1 = crypto.randomUUID();
insertAuthor.run(a1, "J.R.R. Tolkien");

const a2 = crypto.randomUUID();
insertAuthor.run(a2, "George Orwell");


const b1 = crypto.randomUUID();
insertBook.run(b1, "Der Herr der Ringe", 1954, "978-3-86680-192-9");

const b2 = crypto.randomUUID();
insertBook.run(b2, "1984", 1949, "978-3-86680-000-0");

link.run(b1, a1);
link.run(b2, a2);