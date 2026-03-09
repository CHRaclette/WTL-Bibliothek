const library = require("../services/library");
const { randomUUID } = require("crypto");

exports.getBooks = (req, res) => {
  const data = req.app.locals.seed;
  let books = data.books;

  const { title, authorName } = req.query;

  
  if (title) {
    const lower = title.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(lower)
    );
  }

  if (authorName) {
    const lower = authorName.toLowerCase();
    const matchingAuthorIds = data.authors
      .filter(a => a.name.toLowerCase().includes(lower))
      .map(a => a.id);

    books = books.filter(b =>
      b.authorIds.some(id => matchingAuthorIds.includes(id))
    );
  }

  const result = books.map(book => ({
    ...book,
    authors: data.authors.filter(a => book.authorIds.includes(a.id))
  }));

  res.json(result);
};


exports.getBookById = (req, res) => {
  const data = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const book = data.books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const authors = data.authors.filter(a => book.authorIds.includes(a.id));

  return res.json({ ...book, authors });
};



exports.createBook = (req, res) => {
  const db = req.app.locals.seed; 
  const { title, year, isbn, authorIds } = req.body;

  if (!title || !year || !isbn || !Array.isArray(authorIds)) {
    return res.status(400).json({
      error: "title, year, isbn and authorIds[] are required",
      received: req.body
    });
  }


  const invalid = authorIds.filter(id => !db.authors.find(a => a.id === id));
  if (invalid.length > 0) {
    return res.status(400).json({
      error: "Some authorIds do not exist",
      invalid
    });
  }

  const nextId = (db.books.at(-1)?.id ?? 0) + 1;

  const newBook = {
    id: nextId,
    title,
    year,
    isbn,
    authorIds
  };

  db.books.push(newBook);
  library.save(db);   

  return res.status(201).json(newBook);
};



exports.deleteBook = (req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const index = db.books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const deleted = db.books.splice(index, 1)[0];

  library.save(db);   

  return res.json({
    message: "Book deleted",
    book: deleted
  });
};


exports.patchBook = (req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id. Must be a number." });
  }

  const book = db.books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { title, year, isbn, authorIds } = req.body ?? {};

  if (title !== undefined && typeof title !== "string") {
    return res.status(400).json({ error: "title must be a string" });
  }
  if (year !== undefined && Number.isNaN(Number(year))) {
    return res.status(400).json({ error: "year must be a number" });
  }
  if (isbn !== undefined && typeof isbn !== "string") {
    return res.status(400).json({ error: "isbn must be a string" });
  }
  if (authorIds !== undefined) {
    if (!Array.isArray(authorIds)) {
      return res.status(400).json({ error: "authorIds must be an array of numbers" });
    }

    const invalid = authorIds.filter(aid => !db.authors.find(a => a.id === Number(aid)));
    if (invalid.length > 0) {
      return res.status(400).json({ error: "Invalid authorIds", invalid });
    }
  }

  if (title !== undefined) book.title = title;
  if (year !== undefined) book.year = Number(year);
  if (isbn !== undefined) book.isbn = isbn;
  if (authorIds !== undefined) book.authorIds = authorIds.map(Number);

  library.save(db);

  const authors = db.authors.filter(a => book.authorIds.includes(a.id));
  return res.json({ ...book, authors });
};