
const express = require('express');
const app = express();
const { notFound, errorHandler } = require('../src/middleware/error');
app.use(express.json());

app.post('/api/books', (req, res) => {
  const { title, year, isbn, authorIds } = req.body;

  const book = {
    id: Math.floor(Math.random() * 10000),
    title,
    year,
    isbn,
    authorIds,
  };

  res.status(201).json(book);
});

module.exports = app;