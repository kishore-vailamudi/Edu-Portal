const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconType: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subject", SubjectSchema);
