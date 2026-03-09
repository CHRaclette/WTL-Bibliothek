const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/author-controller");

router.get("/", authorsController.getAuthors);
router.get("/:id", authorsController.getAuthorById);

module.exports = router;