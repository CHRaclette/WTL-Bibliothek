const library = require("../services/library");
const { AppError, catchAsync } = require("../middleware/error");

exports.getAuthors = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  let authors = db.authors;

  const { name } = req.query;
  if (name) {
    const lower = name.toLowerCase();
    authors = authors.filter((a) => a.name.toLowerCase().includes(lower));
  }

  res.json(authors);
});

exports.getAuthorById = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." },
    });
  }

  const author = db.authors.find((a) => a.id === id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." },
    });
  }

  return res.json(author);
});

exports.createAuthor = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const { name } = req.body ?? {};

  const fieldErrors = {};

  if (!name || name.trim() === "") {
    fieldErrors.name = "Name darf nicht leer sein.";
  }

  if (name >= 50) {
    fieldErrors.name = "Name ist zu lang";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  const nextId = (db.authors.at(-1)?.id ?? 0) + 1;

  const newAuthor = { id: nextId, name };
  db.authors.push(newAuthor);
  library.save(db);

  return res.status(201).json(newAuthor);
});

exports.deleteAuthor = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." },
    });
  }

  const index = db.authors.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." },
    });
  }

  const referencedBy = db.books
    .filter((b) => b.authorIds.includes(id))
    .map((b) => b.id);

  if (referencedBy.length > 0) {
    throw new AppError(
      "Author is referenced by existing books",
      409,
      "AUTHOR_REFERENCED",
      {
        fieldErrors: {
          id: `Autor kann nicht gelöscht werden, da er von Büchern referenziert wird: ${referencedBy.join(", ")}`,
        },
      }
    );
  }

  const deleted = db.authors.splice(index, 1)[0];
  library.save(db);

  return res.json({ message: "Author deleted", author: deleted });
});

exports.patchAuthor = catchAsync((req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid id", 400, "VALIDATION_ERROR", {
      fieldErrors: { id: "Ungültige Autoren-ID." },
    });
  }

  const author = db.authors.find((a) => a.id === id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND", {
      fieldErrors: { id: "Dieser Autor existiert nicht." },
    });
  }

  const { name } = req.body ?? {};
  const fieldErrors = {};

  if (name !== undefined && name.trim() === "") {
    fieldErrors.name = "Name darf nicht leer sein.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", {
      fieldErrors,
    });
  }

  if (name !== undefined) author.name = name;

  library.save(db);
  return res.json(author);
});