const library = require("../services/library");
const { AppError, catchAsync } = require("../middleware/error");


exports.getBooks = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  let books = db.books;

  const { title, authorName } = req.query;

  if (title) {
    const lower = title.toLowerCase();
    books = books.filter(b => b.title.toLowerCase().includes(lower));
  }

  if (authorName) {
    const lower = authorName.toLowerCase();
    const matchingAuthorIds = db.authors
      .filter(a => a.name.toLowerCase().includes(lower))
      .map(a => a.id);

    books = books.filter(b =>
      b.authorIds.some(id => matchingAuthorIds.includes(id))
    );
  }

  
const result = books.map(book => {
  const authors = db.authors.filter(a => book.authorIds.includes(a.id));
  return {
    id: book.id,
    title: book.title,
    year: book.year,
    isbn: book.isbn,
    authorIds: book.authorIds,
    authors
  };
});


  res.json(result);
});

exports.getBookById = catchAsync((req, res, next) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { id: req.params.id });
  }

  const book = db.books.find(b => b.id === id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", { id });
  }

  const authors = db.authors.filter(a => book.authorIds.includes(a.id));
  return res.json({ ...book, authors });
});

exports.createBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const { title, year, isbn, authorIds } = req.body;

  if (!title || !year || !isbn || !Array.isArray(authorIds)) {
    throw new AppError(
      "title, year, isbn and authorIds[] are required",
      400,
      "VALIDATION_ERROR",
      { body: req.body }
    );
  }

  const invalid = authorIds.filter(id => !db.authors.find(a => a.id === id));
  if (invalid.length > 0) {
    throw new AppError(
      "Some authorIds do not exist",
      400,
      "INVALID_AUTHOR_IDS",
      { invalid }
    );
  }

  const nextId = (db.books.at(-1)?.id ?? 0) + 1;

  const newBook = {
    id: nextId,
    title,
    year: Number(year),
    isbn,
    authorIds: authorIds.map(Number)
  };

  db.books.push(newBook);
  library.save(db);

  res.status(201).json(newBook);
});


exports.deleteBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { id: req.params.id });
  }

  const index = db.books.findIndex(b => b.id === id);
  if (index === -1) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", { id });
  }

  const deleted = db.books.splice(index, 1)[0];
  library.save(db);

  return res.json({
    message: "Book deleted",
    book: deleted
  });
});


exports.patchBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { id: req.params.id });
  }

  const book = db.books.find(b => b.id === id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", { id });
  }

  const { title, year, isbn, authorIds } = req.body ?? {};

  if (title !== undefined && typeof title !== "string") {
    throw new AppError("title must be a string", 400, "VALIDATION_ERROR");
  }

  if (year !== undefined && Number.isNaN(Number(year))) {
    throw new AppError("year must be a number", 400, "VALIDATION_ERROR");
  }

  if (isbn !== undefined && typeof isbn !== "string") {
    throw new AppError("isbn must be a string", 400, "VALIDATION_ERROR");
  }

  if (authorIds !== undefined) {
    if (!Array.isArray(authorIds)) {
      throw new AppError("authorIds must be an array of numbers", 400, "VALIDATION_ERROR");
    }

    const invalid = authorIds.filter(aid => !db.authors.find(a => a.id === Number(aid)));
    if (invalid.length > 0) {
      throw new AppError("Invalid authorIds", 400, "INVALID_AUTHOR_IDS", { invalid });
    }
  }

  if (title !== undefined) book.title = title;
  if (year !== undefined) book.year = Number(year);
  if (isbn !== undefined) book.isbn = isbn;
  if (authorIds !== undefined) book.authorIds = authorIds.map(Number);

  library.save(db);

  const authors = db.authors.filter(a => book.authorIds.includes(a.id));
  return res.json({ ...book, authors });
});