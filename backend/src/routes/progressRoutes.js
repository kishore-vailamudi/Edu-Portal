const express = require("express");
const progressController = require("../controllers/progressController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.get("/", auth, progressController.getUserProgress);
router.patch("/unit", auth, progressController.updateUnitProgress);
router.patch("/quiz", auth, progressController.updateQuizScore);
router.patch("/time", auth, progressController.updateTimeSpent);

module.exports = router;
