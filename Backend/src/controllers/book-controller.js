
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
  const id = req.params.id

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

  const id = Books.create(title, year, isbn, authorIds);

  const authors = authorIds.map(aid => Authors.getById(aid));

  res.status(201).json({
    id,
    title,
    year,
    isbn,
    authors
  });
});

exports.deleteBook = catchAsync((req, res) => {
  const id = req.params.id

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
  const id = req.params.id; 

  const existing = Books.getById(id);
  if (!existing) {
    throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");
  }

  const { title, year, isbn, authorIds } = req.body ?? {};
  const fieldErrors = {};

  
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      fieldErrors.title = "Titel darf nicht leer sein.";
    } else if (title.length >= 100) {
      fieldErrors.title = "Titel ist zu lang.";
    }
  }

  
  const currentYear = new Date().getFullYear();
  if (year !== undefined) {
    const y = Number(year);
    if (!Number.isInteger(y) || y > currentYear) {
      fieldErrors.year = `Jahr muss 4-stellig und ≤ ${currentYear} sein.`;
    }
  }

  // ISBN
  if (isbn !== undefined) {
    if (typeof isbn !== "string") {
      fieldErrors.isbn = "ISBN muss eine Zeichenkette sein.";
    } else {
      const digits = isbn.replace(/\D/g, "");
      if (digits.length !== 13) fieldErrors.isbn = "ISBN muss 13 Ziffern enthalten.";
    }
  }

 
  if (authorIds !== undefined) {
    if (!Array.isArray(authorIds) || authorIds.length === 0) {
      fieldErrors.authorIds = "Bitte mindestens einen Autor auswählen.";
    } else {
  
      const existingIds = Authors.getExistingIds
        ? Authors.getExistingIds(authorIds)
        : Authors.getAll().map(a => a.id);
      const set = new Set(existingIds);
      const missing = authorIds.filter(aid => !set.has(aid));
      if (missing.length > 0) {
        fieldErrors.authorIds = `Ein oder mehrere ausgewählte Autoren existieren nicht: ${missing.join(", ")}`;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", { fieldErrors });
  }

  Books.update(
    id,
    title !== undefined ? title : existing.title,
    year !== undefined ? Number(year) : existing.year,
    isbn !== undefined ? isbn : existing.isbn
  );


  if (authorIds !== undefined) {
    BookAuthors.removeByBook(id);
    for (const aid of authorIds) {
      BookAuthors.add(id, aid);
    }
  }
  const updated = Books.getById(id);
  return res.json(updated);
});
