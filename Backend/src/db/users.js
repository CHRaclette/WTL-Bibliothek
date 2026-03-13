const db = require("../data/library");
const crypto = require("crypto");
const { hashPassword } = require("../utils/password");


exports.getAll = () => {
    return db.prepare("SELECT id, username, role FROM users").all();
    };

exports.getById = (id) => {
    return db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(id);
};



exports.createUser = (username, password, role) => {
  const id = crypto.randomUUID();

  const { hash, salt, iterations } = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, username, passwordHash, passwordSalt, passwordIterations, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, username, hash, salt, iterations, role);

  return id;
};

exports.update = (id, username, role) => {
    return db
        .prepare("UPDATE users SET username = ?, role = ? WHERE id = ?")
        .run(username, role, id);
};

exports.remove = (id) => {
    return db.prepare("DELETE FROM users WHERE id = ?").run(id);
};


exports.getByUsername = (username) => {
  return db.prepare(`
    SELECT
      id,
      username,
      role,
      passwordHash,
      passwordSalt,
      passwordIterations
    FROM users
    WHERE username = ?
  `).get(username);
};

