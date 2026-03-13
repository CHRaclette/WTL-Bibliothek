const { AppError, catchAsync } = require("../middleware/error");
const Authors = require("../db/authors");
const BookAuthors = require("../db/bookAuthors");


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
  const id = req.params.id; 

  const author = Authors.getById(id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND");
  }

  return res.json(author);
});


exports.createAuthor = catchAsync((req, res) => {
  const { name } = req.body ?? {};

  const fieldErrors = {};
  if (!name || name.trim() === "") {
    fieldErrors.name = "Name darf nicht leer sein.";
  } else if (name.length >= 50) {
    fieldErrors.name = "Name ist zu lang.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", { fieldErrors });
  }

  const id = Authors.createAuthor(name.trim());
  return res.status(201).json({ id, name: name.trim() });
});

exports.deleteAuthor = catchAsync((req, res) => {
  const id = req.params.id; 

  const author = Authors.getById(id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND");
  }


  const references = BookAuthors.getBooksForAuthor(id);

  if (references.length > 0) {
    throw new AppError(
      "Author is referenced by existing books",
      409,
      "AUTHOR_REFERENCED",
      {
        fieldErrors: {
          id: `Autor wird in Büchern verwendet: ${references
            .map(r => r.book_id)
            .join(", ")}`,
        },
      }
    );
  }

  Authors.remove(id);

  return res.json({
    message: "Author deleted",
    author,
  });
});

exports.patchAuthor = catchAsync((req, res) => {
  const id = req.params.id; 

  const author = Authors.getById(id);
  if (!author) {
    throw new AppError("Author not found", 404, "AUTHOR_NOT_FOUND");
  }

  const { name } = req.body ?? {};
  const fieldErrors = {};

  if (name !== undefined) {
    if (name.trim() === "") {
      fieldErrors.name = "Name darf nicht leer sein.";
    } else if (name.length >= 50) {
      fieldErrors.name = "Name ist zu lang.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validierungsfehler", 400, "VALIDATION_ERROR", { fieldErrors });
  }

  if (name !== undefined) {
    Authors.update(id, name.trim());
  }

  const updated = Authors.getById(id);
  return res.json(updated);
});