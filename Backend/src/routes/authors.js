const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/author-controller");
const { requireLogin, requireAdmin } = require("../middleware/auth");

router.get("/", requireLogin,authorsController.getAuthors);
router.get("/:id", requireLogin,authorsController.getAuthorById);

router.post("/", requireAdmin, authorsController.createAuthor);
router.patch("/:id", requireAdmin, authorsController.patchAuthor);
router.delete("/:id", requireAdmin, authorsController.deleteAuthor);

module.exports = router;