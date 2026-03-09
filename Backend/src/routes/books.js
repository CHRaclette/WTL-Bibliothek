const express = require("express");
const router = express.Router();
const booksController = require("../controllers/book-controller");

router.get("/", booksController.getBooks);
router.get("/:id", booksController.getBookById);

module.exports = router;