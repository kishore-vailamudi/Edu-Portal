const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/profile", auth, userController.getProfile);
router.patch("/profile", auth, userController.updateProfile);

module.exports = router;
