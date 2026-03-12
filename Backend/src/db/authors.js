const db = require("../data/library");
const crypto = require("crypto");

exports.getAll = () => {
  return db.prepare("SELECT * FROM authors ORDER BY name ASC").all();
};


exports.getById = (id) => {
  return db.prepare("SELECT * FROM authors WHERE id = ?").get(id);
};

exports.createAuthor = (name) => {
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO authors (id, name) VALUES (?, ?)").run(id, name);
  return id;
};

exports.update = (id, name) => {
  return db
    .prepare("UPDATE authors SET name = ? WHERE id = ?")
    .run(name, id);
};

exports.remove = (id) => {
  return db.prepare("DELETE FROM authors WHERE id = ?").run(id);
};
