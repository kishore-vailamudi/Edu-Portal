const ReviewMaterial = require("../models/ReviewMaterial");
const QuizResult = require("../models/QuizResult");
const axios = require("axios");

// Get review materials for a user based on quiz results
exports.getReviewMaterials = async (req, res) => {
  try {
    // Get the latest quiz result for the user
    const latestQuizResult = await QuizResult.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!latestQuizResult) {
      // Return default review materials instead of 404
      const defaultMaterials = [
        {
          _id: "default1",
          title: "Introduction to Learning Concepts",
          description: "Basic overview of key learning concepts and strategies",
          type: "article",
          content: "https://example.com/intro-learning",
          topics: ["learning", "introduction"],
          difficulty: "beginner",
          time: 15,
        },
        {
          _id: "default2",
          title: "Study Techniques for Better Retention",
          description:
            "Effective study methods to improve information retention",
          type: "video",
          content: "https://example.com/study-techniques",
          topics: ["study", "memory"],
          difficulty: "intermediate",
          time: 20,
        },
      ];
      return res.status(200).json({ reviewMaterials: defaultMaterials });
    }

    // Get review materials based on weak areas
    let reviewMaterials = [];

    if (latestQuizResult.weakAreas && latestQuizResult.weakAreas.length > 0) {
      // Find review materials that match the weak areas
      reviewMaterials = await ReviewMaterial.find({
        topics: { $in: latestQuizResult.weakAreas },
      });
    }

    // If no specific materials found, get general materials for the unit
    if (reviewMaterials.length === 0) {
      reviewMaterials = await ReviewMaterial.find({
        unitId: latestQuizResult.quizId.split("-")[0], // Assuming quizId format is 'unitId-quizNumber'
      }).limit(3);
    }

    res.status(200).json({ reviewMaterials });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get personalized AI recommendations
exports.getAIRecommendations = async (req, res) => {
  try {
    // Get the latest quiz result for the user
    const latestQuizResult = await QuizResult.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!latestQuizResult) {
      return res.status(404).json({ message: "No quiz results found" });
    }

    // Send data to Flask AI service for analysis
    try {
      const aiResponse = await axios.post(
        process.env.FLASK_API_URL + "/get-recommendations",
        {
          quizResult: {
            userId: req.user._id.toString(),
            quizId: latestQuizResult.quizId,
            score: latestQuizResult.score,
            answers: latestQuizResult.answers,
            weakAreas: latestQuizResult.weakAreas,
          },
        }
      );

      res.status(200).json({
        recommendations: aiResponse.data.recommendations,
      });
    } catch (aiError) {
      console.error("AI service error:", aiError.message);
      res.status(500).json({ message: "Error getting AI recommendations" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new review material (admin only)
exports.createReviewMaterial = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, type, difficulty, time, content, unitId, topics } = req.body;

    // Create new review material
    const reviewMaterial = new ReviewMaterial({
      title,
      type,
      difficulty,
      time,
      content,
      unitId,
      topics,
    });

    await reviewMaterial.save();

    res.status(201).json({
      message: "Review material created successfully",
      reviewMaterial,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a review material (admin only)
exports.updateReviewMaterial = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "type",
      "difficulty",
      "time",
      "content",
      "topics",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const reviewMaterial = await ReviewMaterial.findById(req.params.id);

    if (!reviewMaterial) {
      return res.status(404).json({ message: "Review material not found" });
    }

    updates.forEach((update) => {
      reviewMaterial[update] = req.body[update];
    });

    await reviewMaterial.save();

    res.status(200).json({
      message: "Review material updated successfully",
      reviewMaterial,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
