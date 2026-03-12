const db = require("./library");

// Optional, falls nicht global gesetzt:
db.exec(`PRAGMA foreign_keys = ON;`);

const authorCount = db.prepare("SELECT COUNT(*) AS c FROM authors").get().c;
const bookCount   = db.prepare("SELECT COUNT(*) AS c FROM books").get().c;

if (authorCount === 0 && bookCount === 0) {
  console.log("➡️  Tabellen leer – Seeder wird ausgeführt …");

  // Alles in einer Transaktion – schneller & atomar
  db.exec("BEGIN");
  try {
    // Tabellen leeren (sicherheitshalber)
    db.exec(`
      DELETE FROM book_authors;
      DELETE FROM books;
      DELETE FROM authors;
      -- Falls du AUTOINCREMENT nutzt und wieder bei 1 starten willst:
      DELETE FROM sqlite_sequence WHERE name IN ('authors','books','book_authors');
    `);

    // ========= 1) Autoren =========
    const authors = [
      "J.R.R. Tolkien",
      "George Orwell",
      "J.K. Rowling",
      "Frank Herbert",
      "F. Scott Fitzgerald",
      "Harper Lee",
      "Ernest Hemingway",
      "Mary Shelley",
      "H. P. Lovecraft",
      "Jules Verne",
      "Arthur C. Clarke",
      "Isaac Asimov",
      "Margaret Atwood",
      "Aldous Huxley",
      "Ray Bradbury",
      "C. S. Lewis",
      "Neil Gaiman",
      "Agatha Christie",
      "Jane Austen",
      "Mark Twain"
    ];

    const insertAuthor = db.prepare("INSERT INTO authors (name) VALUES (?)");
    const authorIdByName = new Map();
    for (const name of authors) {
      const id = insertAuthor.run(name).lastInsertRowid;
      authorIdByName.set(name, id);
    }

    // ========= 2) Bücher (mit Author-Namen) =========
    // Tipp: ISBN hier als String belassen; dein Formatierer in der UI macht die Trennstriche hübsch.
    const books = [
      {
        title: "Der Herr der Ringe",
        year: 1954,
        isbn: "9783866801929",
        authors: ["J.R.R. Tolkien"]
      },
      {
        title: "1984",
        year: 1949,
        isbn: "9783866800000",
        authors: ["George Orwell"]
      },
      {
        title: "Harry Potter und der Stein der Weisen",
        year: 1997,
        isbn: "9783551512344",
        authors: ["J.K. Rowling"]
      },
      {
        title: "Dune",
        year: 1965,
        isbn: "9780441013593",
        authors: ["Frank Herbert"]
      },
      {
        title: "Der große Gatsby",
        year: 1925,
        isbn: "9780743273565",
        authors: ["F. Scott Fitzgerald"]
      },
      {
        title: "Wer die Nachtigall stört",
        year: 1960,
        isbn: "9780060935467",
        authors: ["Harper Lee"]
      },
      {
        title: "Der alte Mann und das Meer",
        year: 1952,
        isbn: "9780684801223",
        authors: ["Ernest Hemingway"]
      },
      {
        title: "Frankenstein",
        year: 1818,
        isbn: "9780486282114",
        authors: ["Mary Shelley"]
      },
      {
        title: "Die Berge des Wahnsinns",
        year: 1936,
        isbn: "9783442720450",
        authors: ["H. P. Lovecraft"]
      },
      {
        title: "Reise zum Mittelpunkt der Erde",
        year: 1864,
        isbn: "9780141441979",
        authors: ["Jules Verne"]
      },
      {
        title: "2001: Odyssee im Weltraum",
        year: 1968,
        isbn: "9780451457998",
        authors: ["Arthur C. Clarke"]
      },
      {
        title: "Ich, der Robot",
        year: 1950,
        isbn: "9780553382563",
        authors: ["Isaac Asimov"]
      },
      {
        title: "Der Report der Magd",
        year: 1985,
        isbn: "9781784873189",
        authors: ["Margaret Atwood"]
      },
      {
        title: "Schöne neue Welt",
        year: 1932,
        isbn: "9780060850524",
        authors: ["Aldous Huxley"]
      },
      {
        title: "Fahrenheit 451",
        year: 1953,
        isbn: "9781451673319",
        authors: ["Ray Bradbury"]
      },
      {
        title: "Die Chroniken von Narnia: Der König von Narnia",
        year: 1950,
        isbn: "9780007323128",
        authors: ["C. S. Lewis"]
      },
      {
        title: "American Gods",
        year: 2001,
        isbn: "9780062572233",
        authors: ["Neil Gaiman"]
      },
      {
        title: "Mord im Orientexpress",
        year: 1934,
        isbn: "9780007119318",
        authors: ["Agatha Christie"]
      },
      {
        title: "Stolz und Vorurteil",
        year: 1813,
        isbn: "9780141439518",
        authors: ["Jane Austen"]
      },
      {
        title: "Die Abenteuer des Tom Sawyer",
        year: 1876,
        isbn: "9780141321103",
        authors: ["Mark Twain"]
      },
      // Beispiele mit MEHREREN Autoren:
      {
        title: "Gute Omen",
        year: 1990,
        isbn: "9780060853983",
        authors: ["Neil Gaiman", "Terry Pratchett"] // Achtung: Terry Pratchett ist noch nicht in authors[] – fügen wir unten hinzu
      },
      {
        title: "Die letzte Frage (Sammelband)",
        year: 1973,
        isbn: "9780553294385",
        authors: ["Isaac Asimov", "Arthur C. Clarke"] // fictive pairing als Beispiel
      }
    ];

    // Falls ein Buch einen Autor nennt, den es oben (authors[]) noch nicht gibt:
    const ensureAuthor = (name) => {
      if (!authorIdByName.has(name)) {
        const id = insertAuthor.run(name).lastInsertRowid;
        authorIdByName.set(name, id);
      }
      return authorIdByName.get(name);
    };

    const insertBook = db.prepare(`
      INSERT INTO books (title, year, isbn)
      VALUES (?, ?, ?)
    `);
    const link = db.prepare(`
      INSERT INTO book_authors (book_id, author_id)
      VALUES (?, ?)
    `);

    for (const b of books) {
      const bookId = insertBook.run(b.title, b.year, b.isbn).lastInsertRowid;

      for (const authorName of b.authors) {
        const authorId = ensureAuthor(authorName);
        link.run(bookId, authorId);
      }
    }

    db.exec("COMMIT");
    console.log("🎉 Seeder erfolgreich ausgeführt!");

  } catch (e) {
    db.exec("ROLLBACK");
    console.error("❌ Seeder fehlgeschlagen:", e.message);
  }

} else {
  console.log("ℹ️  Seeder übersprungen – DB enthält bereits Daten");
}
``