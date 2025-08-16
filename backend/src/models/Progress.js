const mongoose = require("mongoose");

const UnitProgressSchema = new mongoose.Schema({
  unitId: {
    type: String,
    ref: "Unit",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    required: true,
  },
  quizScore: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

const SubjectProgressSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    ref: "Subject",
    required: true,
  },
  unitsCompleted: {
    type: Number,
    default: 0,
  },
  totalUnits: {
    type: Number,
    required: true,
  },
  units: [UnitProgressSchema],
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subjects: [SubjectProgressSchema],
  totalQuizzesTaken: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Progress", ProgressSchema);
