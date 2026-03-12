const db = require("./library");


const authorCount = db.prepare("SELECT COUNT(*) AS c FROM authors").get().c;
const bookCount   = db.prepare("SELECT COUNT(*) AS c FROM books").get().c;


if (authorCount === 0 && bookCount === 0) {

  console.log("➡️  Tabellen leer – Seeder wird ausgeführt …");

  db.exec(`
    DELETE FROM book_authors;
    DELETE FROM books;
    DELETE FROM authors;
  `);

  const insertAuthor = db.prepare(
    "INSERT INTO authors (name) VALUES (?)"
  );

  const a1 = insertAuthor.run("J.R.R. Tolkien").lastInsertRowid;
  const a2 = insertAuthor.run("George Orwell").lastInsertRowid;
  const a3 = insertAuthor.run("J.K. Rowling").lastInsertRowid;

  const insertBook = db.prepare(`
    INSERT INTO books (title, year, isbn)
    VALUES (?, ?, ?)
  `);

  const b1 = insertBook.run("Der Herr der Ringe", 1954, "978-3-86680-192-9").lastInsertRowid;
  const b2 = insertBook.run("1984", 1949, "978-3-86680-000-0").lastInsertRowid;
  const b3 = insertBook.run("Harry Potter und der Stein der Weisen", 1997, "978-3-55151-123-4").lastInsertRowid;

  const link = db.prepare(`
    INSERT INTO book_authors (book_id, author_id)
    VALUES (?, ?)
  `);

  link.run(b1, a1);
  link.run(b2, a2);
  link.run(b3, a3);

  console.log("🎉 Seeder erfolgreich ausgeführt!");

} else {
  console.log("ℹ️  Seeder übersprungen – DB enthält bereits Daten");
}