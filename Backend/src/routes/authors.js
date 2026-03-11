const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/author-controller");

router.get("/", authorsController.getAuthors);
router.get("/:id", authorsController.getAuthorById);
router.post("/", authorsController.createAuthor);
router.delete("/:id", authorsController.deleteAuthor);
router.patch("/:id", authorsController.patchAuthor);


module.exports = router;