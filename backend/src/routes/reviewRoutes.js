const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.get("/materials", auth, reviewController.getReviewMaterials);
router.get("/ai-recommendations", auth, reviewController.getAIRecommendations);
router.post("/materials", auth, reviewController.createReviewMaterial);
router.patch("/materials/:id", auth, reviewController.updateReviewMaterial);

module.exports = router;
