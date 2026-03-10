const express = require("express");
const router = express.Router();
const booksController = require("../controllers/book-controller");

router.get("/", booksController.getBooks);
router.get("/:id", booksController.getBookById);
router.post("/", booksController.createBook);
router.delete("/:id", booksController.deleteBook);
router.patch("/:id", booksController.patchBook)

module.exports = router;