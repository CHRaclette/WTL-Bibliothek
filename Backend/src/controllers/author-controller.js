const data = require("../data/library.json");

exports.getAuthors = (req, res) => {
  res.json(req.app.locals.seed.authors);
};


exports.getAuthorById = (req, res) => {
  const seed = req.app.locals.seed;        
  const id = Number(req.params.id);     
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id. Must be a number." });
  }
  const author = seed.authors.find(a => a.id === id);

  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  return res.json(author);
};
