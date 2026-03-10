const library = require("../services/library");
const { AppError, catchAsync } = require("../middleware/error");

exports.getBooks = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  let books = db.books;

  const { title, authorName } = req.query;

  if (title) {
    const lower = title.toLowerCase();
    books = books.filter((b) => b.title.toLowerCase().includes(lower));
  }

  if (authorName) {
    const lower = authorName.toLowerCase();
    const matchingAuthorIds = db.authors
      .filter((a) => a.name.toLowerCase().includes(lower))
      .map((a) => a.id);

    books = books.filter((b) =>
      b.authorIds.some((id) => matchingAuthorIds.includes(id))
    );
  }

  const result = books.map((book) => {
    const authors = db.authors.filter((a) => book.authorIds.includes(a.id));
    return {
      id: book.id,
      title: book.title,
      year: book.year,
      isbn: book.isbn,
      authorIds: book.authorIds,
      authors,
    };
  });

  res.json(result);
});

exports.getBookById = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Buch-ID." },
    });
  }

  const book = db.books.find((b) => b.id === id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", {
      fieldErrors: { id: "Dieses Buch existiert nicht." },
    });
  }

  const authors = db.authors.filter((a) => book.authorIds.includes(a.id));
  return res.json({ ...book, authors });
});

exports.createBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const { title, year, isbn, authorIds } = req.body;

  const fieldErrors = {};

  if (!title || title.trim() === "") {
    fieldErrors.title = "Titel darf nicht leer sein.";
  }

  if (!year || Number.isNaN(Number(year))) {
    fieldErrors.year = "Jahr muss eine gültige Zahl sein.";
  } else if (Number(year) > new Date().getFullYear()) {
    fieldErrors.year = "Jahr darf nicht in der Zukunft liegen.";
  }

  if (!isbn || isbn.trim() === "") {
    fieldErrors.isbn = "ISBN darf nicht leer sein.";
  } else if (!/^[0-9-]+$/.test(isbn)) {
    fieldErrors.isbn = "ISBN hat ein ungültiges Format.";
  }

  if (!Array.isArray(authorIds)) {
    fieldErrors.authorIds = "Autor-Auswahl fehlt.";
  } else {
    const invalid = authorIds.filter(
      (id) => !db.authors.find((a) => a.id === id)
    );
    if (invalid.length > 0) {
      fieldErrors.authorIds =
        "Ein oder mehrere ausgewählte Autoren existieren nicht.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  const nextId = (db.books.at(-1)?.id ?? 0) + 1;

  const newBook = {
    id: nextId,
    title,
    year: Number(year),
    isbn,
    authorIds: authorIds.map(Number),
  };

  db.books.push(newBook);
  library.save(db);

  res.status(201).json(newBook);
});

exports.deleteBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Buch-ID." },
    });
  }

  const index = db.books.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", {
      fieldErrors: { id: "Das Buch existiert nicht." },
    });
  }

  const deleted = db.books.splice(index, 1)[0];
  library.save(db);

  return res.json({
    message: "Book deleted",
    book: deleted,
  });
});

exports.patchBook = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige ID." },
    });
  }

  const book = db.books.find((b) => b.id === id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", {
      fieldErrors: { id: "Dieses Buch existiert nicht." },
    });
  }

  const { title, year, isbn, authorIds } = req.body ?? {};
  const fieldErrors = {};

  if (title !== undefined && title.trim() === "") {
    fieldErrors.title = "Titel darf nicht leer sein.";
  }

  if (year !== undefined) {
    if (Number.isNaN(Number(year))) {
      fieldErrors.year = "Jahr muss eine Zahl sein.";
    } else if (Number(year) > new Date().getFullYear()) {
      fieldErrors.year = "Jahr darf nicht in der Zukunft liegen.";
    }
  }

  if (isbn !== undefined && isbn.trim() === "") {
    fieldErrors.isbn = "ISBN darf nicht leer sein.";
  }

  if (isbn !== undefined && !/^[0-9-]+$/.test(isbn)) {
    fieldErrors.isbn = "Ungültiges ISBN-Format.";
  }

  if (authorIds !== undefined) {
    if (!Array.isArray(authorIds)) {
      fieldErrors.authorIds = "Autor-IDs müssen ein Array sein.";
    } else {
      const invalid = authorIds.filter(
        (aid) => !db.authors.find((a) => a.id === Number(aid))
      );
      if (invalid.length > 0) {
        fieldErrors.authorIds =
          "Ein oder mehrere ausgewählte Autoren existieren nicht.";
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  if (title !== undefined) book.title = title;
  if (year !== undefined) book.year = Number(year);
  if (isbn !== undefined) book.isbn = isbn;
  if (authorIds !== undefined)
    book.authorIds = authorIds.map((n) => Number(n));

  library.save(db);

  const authors = db.authors.filter((a) => book.authorIds.includes(a.id));
  return res.json({ ...book, authors });
});