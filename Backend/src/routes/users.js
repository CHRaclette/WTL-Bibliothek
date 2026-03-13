const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin,usersController.getUsers);
router.get("/:id", requireAdmin,usersController.getUserById);
router.post("/", requireAdmin,usersController.createUser);
router.delete("/:id", requireAdmin,usersController.deleteUser);
router.patch("/:id", requireAdmin,usersController.patchUser);


module.exports = router;