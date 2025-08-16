const express = require("express");
const unitController = require("../controllers/unitController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/subject/:subjectId", unitController.getUnitsBySubject);
router.get("/:id", unitController.getUnitById);

// Protected routes
router.post("/", auth, unitController.createUnit);
router.patch("/:id", auth, unitController.updateUnit);
router.patch("/lesson/status", auth, unitController.updateLessonStatus);
router.delete("/:id", auth, unitController.deleteUnit);

module.exports = router;
