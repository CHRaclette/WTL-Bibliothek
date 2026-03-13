const express = require("express");
const router = express.Router();
const booksController = require("../controllers/book-controller");
const { requireLogin, requireAdmin } = require("../middleware/auth");


router.get("/", requireLogin,booksController.getBooks);
router.get("/:id", requireLogin,booksController.getBookById);

router.post("/", requireAdmin,booksController.createBook);
router.delete("/:id", requireAdmin,booksController.deleteBook);
router.patch("/:id", requireAdmin,booksController.patchBook)

module.exports = router;