const library = require("../services/library");

exports.getAuthors = (req, res) => {
  const db = req.app.locals.seed;
  let authors = db.authors;

  const { name } = req.query;
  if (name) {
    const lower = name.toLowerCase();
    authors = authors.filter(a => a.name.toLowerCase().includes(lower));
  }

  res.json(authors);
};

exports.getAuthorById = (req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id. Must be a number." });
  }

  const author = db.authors.find(a => a.id === id);
  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  return res.json(author);
};

exports.createAuthor = (req, res) => {
  const db = req.app.locals.seed;
  const { name } = req.body ?? {};

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required and must be a string" });
  }

  const nextId = (db.authors.at(-1)?.id ?? 0) + 1;

  const newAuthor = { id: nextId, name };
  db.authors.push(newAuthor);
  library.save(db);

  return res.status(201).json(newAuthor);
};

exports.deleteAuthor = (req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id. Must be a number." });
  }

  const index = db.authors.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Author not found" });
  }

  const referencedBy = db.books.filter(b => b.authorIds.includes(id)).map(b => b.id);
  if (referencedBy.length > 0) {
    return res.status(409).json({
      error: "Author is referenced by existing books",
      books: referencedBy
    });
  }

  const deleted = db.authors.splice(index, 1)[0];
  library.save(db);

  return res.json({ message: "Author deleted", author: deleted });
};


exports.patchAuthor = (req, res) => {
  const db = req.app.locals.seed;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id. Must be a number." });
  }

  const author = db.authors.find(a => a.id === id);
  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  const { name } = req.body ?? {};

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ error: "name must be a string" });
  }

  if (name !== undefined) author.name = name;

  library.save(db);
  return res.json(author);
};