const request = require('supertest');
const express = require('express');

jest.mock('../../src/services/library', () => ({
  save: jest.fn(),
}));
const library = require('../../src/services/library');

const { createBook } = require('../../src/controllers/book-controller');
const { errorHandler } = require('../../src/middleware/error');

function setupTestApp(seedDb) {
  const app = express();
  app.use(express.json());
  app.locals.seed = seedDb;
  app.post('/api/books', createBook);
  app.use(errorHandler);
  return app;
}

describe('POST /api/books', () => {
  let app;
  let db;

  beforeEach(() => {
    db = {
      authors: [
        { id: 1, name: 'Author A' },
        { id: 2, name: 'Author B' }
      ],
      books: [
        { id: 1, title: 'Existing Book', year: 2000, isbn: '1111', authorIds: [1] }
      ]
    };

    app = setupTestApp(db);
    library.save.mockClear();
  });

  it('should create a new book when payload is valid', async () => {
    const payload = {
      title: "Julius der 3",
      year: 2008,
      isbn: "97840132350884",
      authorIds: [1, 2]
    };

    const res = await request(app)
      .post('/api/books')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 2,
      title: "Julius der 3",
      year: 2008,
      isbn: "97840132350884",
      authorIds: [1, 2]
    });

    expect(library.save).toHaveBeenCalledWith(db);
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        year: 2008,
        isbn: "97840132350884",
        authorIds: [1, 2]
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});