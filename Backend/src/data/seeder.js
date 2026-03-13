// backend/data/seed.js
const db = require("./library");
const crypto = require("crypto");
const { hashPassword } = require("../utils/password");

db.exec("PRAGMA foreign_keys = ON;");

// Kleines Helper-Log bei SQL-Fehlern
function safeExec(sql) {
  try {
    db.exec(sql);
  } catch (e) {
    console.error("❌ SQL failed:\n" + sql);
    throw e;
  }
}

try {
  safeExec("BEGIN");

  // Tabellen leeren (korrekte Reihenfolge)
  safeExec(`
    DELETE FROM book_authors;
    DELETE FROM books;
    DELETE FROM authors;
    DELETE FROM users;
 
  `);

  // Prepared Statements
  const insertAuthor = db.prepare(`
    INSERT INTO authors (id, name)
    VALUES (?, ?)
  `);

  const insertBook = db.prepare(`
    INSERT INTO books (id, title, year, isbn)
    VALUES (?, ?, ?, ?)
  `);

  const link = db.prepare(`
    INSERT INTO book_authors (book_id, author_id)
    VALUES (?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, passwordHash, passwordSalt, passwordIterations, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Helper zum Anlegen von Users mit PBKDF2
  function seedUser(username, password, role) {
    const id = crypto.randomUUID();
    const { hash, salt, iterations } = hashPassword(password);
    insertUser.run(id, username, hash, salt, iterations, role);
    return id;
  }

  // ----- Users -----
  const adminId = seedUser("admin", "admin", "admin");
  const userId  = seedUser("user",  "user",  "user");

  // ----- Authors -----
  const a1 = crypto.randomUUID();
  insertAuthor.run(a1, "J.R.R. Tolkien");

  const a2 = crypto.randomUUID();
  insertAuthor.run(a2, "George Orwell");

  // (optional mehr Autoren)
  const a3 = crypto.randomUUID();
  insertAuthor.run(a3, "Jane Austen");

  const a4 = crypto.randomUUID();
  insertAuthor.run(a4, "Mary Shelley");

  // ----- Books -----
  const b1 = crypto.randomUUID();
  insertBook.run(b1, "Der Herr der Ringe", 1954, "978-3-86680-192-9");

  const b2 = crypto.randomUUID();
  insertBook.run(b2, "1984", 1949, "978-3-86680-000-0");

  // (optional mehr Bücher)
  const b3 = crypto.randomUUID();
  insertBook.run(b3, "Stolz und Vorurteil", 1813, "978-0-14-143951-8");

  const b4 = crypto.randomUUID();
  insertBook.run(b4, "Frankenstein", 1818, "978-0-486-28211-4");

  // ----- Links (Many-to-Many) -----
  link.run(b1, a1); // Tolkien -> HdR
  link.run(b2, a2); // Orwell  -> 1984
  link.run(b3, a3); // Austen  -> P&P
  link.run(b4, a4); // Shelley -> Frankenstein

  safeExec("COMMIT");

  console.log("✅ Seeder erfolgreich ausgeführt!");
  console.log("   Angelegte Nutzer:");
  console.log("   - admin / admin (role=admin)");
  console.log("   - user  / user  (role=user)");
} catch (e) {
  safeExec("ROLLBACK");
  console.error("❌ Seeder fehlgeschlagen:", e.message);
  process.exitCode = 1;
}
``