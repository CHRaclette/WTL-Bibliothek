const db = require("../data/library");
const crypto = require("crypto");

exports.createSession = (userId, role) => {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const createdAt = Date.now();

  db.prepare(`
    INSERT INTO sessions (sessionId, userId, role, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, userId, role, createdAt);

  return sessionId;
};

exports.getSession = (sessionId) => {
  return db.prepare(`
    SELECT sessionId, userId, role, createdAt
    FROM sessions
    WHERE sessionId = ?
  `).get(sessionId);
};

exports.deleteSession = (sessionId) => {
  db.prepare(`DELETE FROM sessions WHERE sessionId = ?`).run(sessionId);
};

exports.getSessionByUser = (userId) => {
  return db.prepare(`
    SELECT sessionId, userId, role, createdAt
    FROM sessions
    WHERE userId = ?
    LIMIT 1
  `).get(userId);
};
