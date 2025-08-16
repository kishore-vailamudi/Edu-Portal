const express = require("express");
const subjectController = require("../controllers/subjectController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", subjectController.getAllSubjects);
router.get("/:id", subjectController.getSubjectById);

// Protected routes (admin only)
router.post("/", auth, subjectController.createSubject);
router.patch("/:id", auth, subjectController.updateSubject);
router.delete("/:id", auth, subjectController.deleteSubject);

module.exports = router;
