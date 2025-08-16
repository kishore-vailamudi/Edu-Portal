const express = require("express");
const quizController = require("../controllers/quizController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.get("/all", auth, quizController.getAllQuizzes);
router.post("/submit", auth, quizController.submitQuiz);
router.get("/results/user", auth, quizController.getQuizResults);
router.post("/", auth, quizController.createQuiz);
router.patch("/:id", auth, quizController.updateQuiz);

// Public routes - keep this at the end to avoid conflicts with other routes
router.get("/:id", quizController.getQuizById);

module.exports = router;
