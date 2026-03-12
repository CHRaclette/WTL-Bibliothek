const db = require("./library");

db.exec(`

CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,  
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  isbn TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS book_authors (
  book_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE CASCADE
);
`);