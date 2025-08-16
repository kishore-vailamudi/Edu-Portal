const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "reading", "exercise"],
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const UnitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  subjectId: {
    type: String,
    required: true,
    ref: "Subject",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  totalDuration: {
    type: String,
    required: true,
  },
  lessons: [LessonSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Unit", UnitSchema);
