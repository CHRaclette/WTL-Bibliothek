const request = require('supertest');
const express = require('express');
const Database = require("better-sqlite3");

jest.mock('../../src/data/library', () => new Database(':memory:'));
const db = require('../../src/data/library');
const { createBook } = require('../../src/controllers/book-controller');
const { errorHandler } = require('../../src/middleware/error');

function setupTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/books', createBook);

  app.use(errorHandler);
  return app;
}


beforeAll(() => {

  db.exec(`
    CREATE TABLE authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      isbn TEXT NOT NULL
    );

    CREATE TABLE book_authors (
      book_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      FOREIGN KEY(book_id) REFERENCES books(id),
      FOREIGN KEY(author_id) REFERENCES authors(id)
    );
  `);

  db.prepare("INSERT INTO authors (name) VALUES (?)").run("Author A");
  db.prepare("INSERT INTO authors (name) VALUES (?)").run("Author B");
});

describe("POST /api/books", () => {
  let app;

  beforeEach(() => {
    app = setupTestApp();

    db.exec("DELETE FROM book_authors;");
    db.exec("DELETE FROM books;");
  });

  it("creates a new book when payload is valid", async () => {
    const payload = {
      title: "My Book",
      year: 2020,
      isbn: "9783000000000",
      authorIds: [1, 2]
    };

    const res = await request(app)
      .post("/api/books")
      .send(payload);

    expect(res.status).toBe(201);

 
    expect(res.body.title).toBe("My Book");
    expect(res.body.year).toBe(2020);
    expect(res.body.authors.length).toBe(2);
  });

  it("returns 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({
        year: 2020,
        isbn: "9783000000000",
        authorIds: [1]
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});