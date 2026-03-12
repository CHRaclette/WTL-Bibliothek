const library = require("../services/library");
const { AppError, catchAsync } = require("../middleware/error");

const Authors = require("../db/authors");
const BookAuthors = require("../db/bookAuthors")

exports.getAuthors = catchAsync((req, res) => {
  let result = Authors.getAll(); 

  const { name } = req.query;
  if (name) {
    const lower = name.toLowerCase();
    result = result.filter(a => a.name.toLowerCase().includes(lower));
  }

  res.json(result);
});

exports.getAuthorById = catchAsync((req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." },
    });
  }

  const author = Authors.getById(id);

  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." },
    });
  }

  return res.json(author);
});

exports.createAuthor = catchAsync((req, res) => {
  const { name } = req.body ?? {};

  const fieldErrors = {};
  if (!name || name.trim() === "") {
    fieldErrors.name = "Name darf nicht leer sein.";
  }
  if (name.length >= 50) {
    fieldErrors.name = "Name ist zu lang.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  const id = Authors.create(name);

  return res.status(201).json({ id, name });
});

exports.deleteAuthor = catchAsync((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." }
    });
  }

  const author = Authors.getById(id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." }
    });
  }

  const references = BookAuthors.getAuthorsForBook(id);

  if (references.length > 0) {
    throw new AppError(
      "Author is referenced by existing books",
      409,
      "AUTHOR_REFERENCED",
      {
        fieldErrors: {
          id: `Autor kann nicht gelöscht werden, er wird in Büchern verwendet: ${references
            .map((b) => b.book_id)
            .join(", ")}`
        }
      }
    );
  }

  Authors.remove(id);

  return res.json({
    message: "Author deleted",
    author
  });
});

exports.patchAuthor = catchAsync((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." }
    });
  }

  const author = Authors.getById(id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." }
    });
  }

  const { name } = req.body ?? {};
  const fieldErrors = {};

  if (name !== undefined && name.trim() === "") {
    fieldErrors.name = "Name darf nicht leer sein.";
  }

  if (name !== undefined && name.length >= 50) {
    fieldErrors.name = "Name ist zu lang.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors
    });
  }

  if (name !== undefined) {
    Authors.update(id, name);
  }

  const updated = Authors.getById(id);

  return res.json(updated);
});


