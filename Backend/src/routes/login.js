const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/auth");
const authController = require("../controllers/auth-controller");

router.post("/", authController.login);
router.delete("/", authController.logout);
router.get("/me", requireLogin, authController.me);

module.exports = router;