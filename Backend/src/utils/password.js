
const crypto = require("crypto");

const ITERATIONS = 100000;       
const KEY_LENGTH = 64;             
const DIGEST = "sha512";        


exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return {
    salt,
    hash,
    iterations: ITERATIONS,
  };
};

exports.verifyPassword = (attempt, storedHash, storedSalt, iterations) => {
  const attemptHash = crypto
    .pbkdf2Sync(attempt, storedSalt, iterations, KEY_LENGTH, DIGEST)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(attemptHash, "hex")
  );
};