const library = require("../services/library");
const { AppError, catchAsync } = require("../middleware/error");
const Books = require("../db/books");
const Authors = require("../db/authors");
const BookAuthors = require("../db/bookAuthors");

exports.getBooks = catchAsync((req,res) => {
  const books = Books.getAll();

  const withAuthors = books.map(b => ({
    ...b,
    authors: BookAuthors.getAuthorsForBook(b.id)
  }));

  res.json(withAuthors);
});
exports.getBookById = catchAsync((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Buch-ID." },
    });
  }

  const book = Books.getById(id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", {
      fieldErrors: { id: "Dieses Buch existiert nicht." },
    });
  }

  const authors = BookAuthors.getAuthorsForBook(id);

  return res.json({ ...book, authors });
});


exports.createBook = catchAsync((req, res) => {
  const { title, year, isbn, authorIds } = req.body;

  const bookId = Books.create(title, Number(year), isbn);

  for (const aid of authorIds) {
    BookAuthors.add(bookId, Number(aid));
  }

  const authors = BookAuthors.getAuthorsForBook(bookId);

  return res.status(201).json({
    id: bookId,     
    title,
    year: Number(year),
    isbn,
    authors         
  });
});


exports.deleteBook = catchAsync((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR");
  }

  const book = Books.getById(id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");
  }

  BookAuthors.removeByBook(id);

  Books.remove(id);

  return res.json({
    message: "Book deleted",
    book
  });
});




exports.patchBook = catchAsync((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige ID." },
    });
  }

  const book = Books.getById(id);
  if (!book) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND", {
      fieldErrors: { id: "Dieses Buch existiert nicht." },
    });
  }

  const { title, year, isbn, authorIds } = req.body ?? {};
  const fieldErrors = {};


  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      fieldErrors.title = "Titel darf nicht leer sein.";
    } else if (title.trim().length >= 100) {
      fieldErrors.title = "Titel ist zu lang.";
    }
  }

  if (year !== undefined) {
    const y = Number(year);
    if (!Number.isInteger(y)) {
      fieldErrors.year = "Jahr muss eine Zahl sein.";
    } else if (y > new Date().getFullYear()) {
      fieldErrors.year = "Jahr darf nicht in der Zukunft liegen.";
    }
  }

  if (isbn !== undefined) {
    if (typeof isbn !== "string" || isbn.trim() === "") {
      fieldErrors.isbn = "ISBN darf nicht leer sein.";
    } else {
      const digits = isbn.replace(/\D/g, "");
      if (digits.length !== 13) {
        fieldErrors.isbn = "ISBN muss 13 Ziffern enthalten.";
      }
    }
  }

  if (authorIds !== undefined) {
    if (!Array.isArray(authorIds)) {
      fieldErrors.authorIds = "Autor-IDs müssen ein Array sein.";
    } else {
      const numericIds = authorIds.map((x) => Number(x));
      const allAuthors = Authors.getAll();
      const valid = allAuthors.map((a) => a.id);

      const missing = numericIds.filter((v) => !valid.includes(v));

      if (missing.length > 0) {
        fieldErrors.authorIds =
          `Ein oder mehrere ausgewählte Autoren existieren nicht: ${missing.join(", ")}`;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  Books.update(
    id,
    title !== undefined ? title.trim() : book.title,
    year !== undefined ? Number(year) : book.year,
    isbn !== undefined ? isbn : book.isbn
  );
  if (authorIds !== undefined) {
    BookAuthors.removeByBook(id);

    for (const aid of authorIds) {
      BookAuthors.add(id, Number(aid));
    }
  }

  const updated = Books.getById(id);
  const authors = BookAuthors.getAuthorsForBook(id);

  return res.json({ ...updated, authors });
});
