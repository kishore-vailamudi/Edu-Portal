const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const QuizSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  unitId: {
    type: String,
    required: true,
    ref: "Unit",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  timeLimit: {
    type: Number, // in minutes
    default: 15,
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", QuizSchema);
