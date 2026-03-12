const db = require("../data/library");


exports.getAll = () => {
  return db.prepare("SELECT * FROM authors ORDER BY name ASC").all();
};


exports.getById = (id) => {
  return db.prepare("SELECT * FROM authors WHERE id = ?").get(id);
};


exports.create = (name) => {
  const result = db
    .prepare("INSERT INTO authors (name) VALUES (?)")
    .run(name);

  return result.lastInsertRowid;
};


exports.update = (id, name) => {
  return db
    .prepare("UPDATE authors SET name = ? WHERE id = ?")
    .run(name, id);
};

exports.remove = (id) => {
  return db.prepare("DELETE FROM authors WHERE id = ?").run(id);
};
