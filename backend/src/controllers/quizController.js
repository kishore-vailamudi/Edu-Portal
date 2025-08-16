const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const axios = require("axios");

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    console.log("Getting quiz by ID:", req.params.id);

    if (!req.params.id) {
      console.log("Quiz ID is missing");
      return res.status(400).json({ message: "Quiz ID is required" });
    }

    // Special handling for sample quiz
    if (req.params.id === "sample-quiz") {
      console.log("Specifically requesting sample quiz");

      // Check if sample quiz already exists
      let sampleQuiz = await Quiz.findOne({ id: "sample-quiz" });

      // If not, create it
      if (!sampleQuiz) {
        console.log("Sample quiz not found, creating it");
        sampleQuiz = new Quiz({
          id: "sample-quiz",
          unitId: "physics-unit1",
          title: "Sample Physics Quiz",
          description: "A sample quiz to test your knowledge",
          timeLimit: 15,
          questions: [
            {
              id: 1,
              question: "What is Newton's First Law of Motion?",
              options: [
                "An object in motion stays in motion unless acted upon by an external force",
                "Force equals mass times acceleration",
                "For every action, there is an equal and opposite reaction",
                "Energy cannot be created or destroyed",
              ],
              correctAnswer: 0,
              explanation: "Newton's First Law",
            },
            {
              id: 2,
              question: "What is the formula for force?",
              options: ["F = ma", "E = mc²", "F = G(m₁m₂)/r²", "a² + b² = c²"],
              correctAnswer: 0,
              explanation: "Force formula",
            },
            {
              id: 3,
              question: "What is the unit of force?",
              options: ["Newton", "Joule", "Watt", "Pascal"],
              correctAnswer: 0,
              explanation: "Force units",
            },
          ],
        });

        try {
          await sampleQuiz.save();
          console.log("Sample quiz created successfully");
        } catch (saveErr) {
          console.error("Error saving sample quiz:", saveErr);
          // Continue even if save fails - we'll return the sample quiz anyway
        }
      } else {
        console.log("Found existing sample quiz");
      }

      // Return the sample quiz
      const quizData = {
        id: sampleQuiz.id,
        unitId: sampleQuiz.unitId,
        title: sampleQuiz.title,
        description: sampleQuiz.description,
        timeLimit: sampleQuiz.timeLimit,
        questions: sampleQuiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      };

      return res.status(200).json({ quiz: quizData });
    }

    // Regular quiz lookup
    const quiz = await Quiz.findOne({ id: req.params.id });

    if (!quiz) {
      console.log("Quiz not found:", req.params.id);

      // Check if any quizzes exist
      const quizCount = await Quiz.countDocuments();
      console.log("Total quizzes in database:", quizCount);

      return res.status(404).json({
        message: "Quiz not found. You can try the sample quiz instead.",
        sampleQuizId: "sample-quiz",
      });
    }

    console.log("Quiz found:", quiz.title);

    // Don't send correct answers to the client
    const quizData = {
      id: quiz.id,
      unitId: quiz.unitId,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    };

    res.status(200).json({ quiz: quizData });
  } catch (error) {
    console.error("Error getting quiz:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    console.log("Quiz submission received:", req.body);
    const { quizId, answers, timeTaken, emotionData } = req.body;

    const quiz = await Quiz.findOne({ id: quizId });

    if (!quiz) {
      console.log("Quiz not found:", quizId);
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate score and identify weak areas
    let score = 0;
    const weakAreas = [];

    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);

      if (!question) {
        console.log("Question not found:", answer.questionId);
        return { ...answer, isCorrect: false };
      }

      // Convert both values to numbers to ensure proper comparison
      const correctAnswerNum = Number(question.correctAnswer);
      const selectedOptionNum = Number(answer.selectedOption);

      console.log(
        `Comparing answer for question ${answer.questionId}: correct=${correctAnswerNum}, selected=${selectedOptionNum}`
      );

      const isCorrect = correctAnswerNum === selectedOptionNum;

      if (isCorrect) {
        score++;
      } else {
        // Add to weak areas if not already included
        if (question.explanation && !weakAreas.includes(question.explanation)) {
          weakAreas.push(question.explanation);
        }
      }

      return {
        ...answer,
        isCorrect,
      };
    });

    // Calculate percentage score
    const percentageScore = (score / quiz.questions.length) * 100;
    console.log("Quiz score calculated:", percentageScore);

    // Create quiz result
    const quizResult = new QuizResult({
      userId: req.user._id,
      quizId,
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      timeTaken,
      answers: processedAnswers,
      weakAreas,
      completed: true,
    });

    await quizResult.save();
    console.log("Quiz result saved to database");

    // Try to send data to Flask AI service for analysis
    let recommendations = [];

    try {
      console.log("Sending data to Flask AI service");
      const aiResponse = await axios.post(
        process.env.FLASK_API_URL + "/api/analyze-quiz", // Make sure the URL is correct
        {
          quizResult: {
            userId: req.user._id.toString(),
            quizId,
            score: percentageScore,
            answers: processedAnswers,
            emotionData,
            weakAreas,
          },
        },
        { timeout: 10000 } // Increase timeout to 10 seconds
      );

      console.log("AI service response:", aiResponse.data);

      if (aiResponse.data && aiResponse.data.recommendations) {
        recommendations = aiResponse.data.recommendations;
        console.log(
          `Received ${recommendations.length} recommendations from AI service`
        );
      } else {
        console.warn("AI service returned no recommendations");
        recommendations = getDefaultRecommendations(weakAreas);
      }
    } catch (aiError) {
      // If AI service fails, log the error but continue
      console.error("AI service error:", aiError.message);
      recommendations = getDefaultRecommendations(weakAreas);
    }

    // Return quiz result with recommendations
    const result = {
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      timeTaken,
      weakAreas,
      recommendations,
      quizId,
      unitId: quiz.unitId,
      title: quiz.title,
    };

    console.log("Sending quiz result to client:", {
      message: "Quiz submitted successfully",
      ...result,
    });

    res.status(200).json({
      message: "Quiz submitted successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      message: "Server error processing quiz submission",
      error: error.message,
    });
  }
};

// Helper function to generate default recommendations
function getDefaultRecommendations(weakAreas) {
  const defaultRecs = [
    {
      type: "review",
      title: "Review the topics you struggled with",
      reason: "You had difficulty with some concepts",
    },
    {
      type: "practice",
      title: "Practice more questions on these topics",
      reason: "Additional practice will help reinforce your understanding",
    },
  ];

  // Add specific recommendations for weak areas
  if (weakAreas && weakAreas.length > 0) {
    weakAreas.forEach((area) => {
      defaultRecs.push({
        type: "focus",
        title: `Focus on understanding ${area}`,
        reason: "You had difficulty with this specific topic",
      });
    });
  }

  return defaultRecs;
}

// Create a new quiz (admin only)
exports.createQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id, unitId, title, description, timeLimit, questions } = req.body;

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ id });
    if (existingQuiz) {
      return res.status(400).json({ message: "Quiz already exists" });
    }

    // Create new quiz
    const quiz = new Quiz({
      id,
      unitId,
      title,
      description,
      timeLimit,
      questions,
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get quiz results for a user
exports.getQuizResults = async (req, res) => {
  try {
    const quizResults = await QuizResult.find({ userId: req.user._id });

    res.status(200).json({ quizResults });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all quizzes (admin only)
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log("Getting all quizzes");

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const quizzes = await Quiz.find();
    console.log(`Found ${quizzes.length} quizzes`);

    // Return quizzes without correctAnswer field for security
    const sanitizedQuizzes = quizzes.map((quiz) => {
      const sanitizedQuestions = quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        // Don't include correctAnswer in the response
      }));

      return {
        _id: quiz._id,
        id: quiz.id,
        unitId: quiz.unitId,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions, // Include full questions for admin
        createdAt: quiz.createdAt,
      };
    });

    res.status(200).json({ quizzes: sanitizedQuizzes });
  } catch (error) {
    console.error("Error getting all quizzes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a quiz (admin only)
exports.updateQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, timeLimit, questions } = req.body;

    console.log(`Updating quiz ${req.params.id} with:`, {
      title,
      description,
      timeLimit,
      questionCount: questions?.length || 0,
    });

    // Process questions to ensure correctAnswer is a number
    const processedQuestions = questions.map((q) => ({
      ...q,
      correctAnswer: Number(q.correctAnswer),
    }));

    console.log("Processed questions with numeric correctAnswers");

    // Find the quiz
    const quiz = await Quiz.findOne({ id: req.params.id });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Update the quiz
    quiz.title = title;
    quiz.description = description;
    quiz.timeLimit = timeLimit;
    quiz.questions = processedQuestions;

    await quiz.save();
    console.log("Quiz updated successfully");

    res.status(200).json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
