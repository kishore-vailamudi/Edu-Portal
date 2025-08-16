const Unit = require("../models/Unit");

// Get all units for a subject
exports.getUnitsBySubject = async (req, res) => {
  try {
    console.log("Getting units for subject:", req.params.subjectId);
    const units = await Unit.find({ subjectId: req.params.subjectId });

    if (!units || units.length === 0) {
      console.log("No units found for subject:", req.params.subjectId);
      return res.status(200).json({ units: [] });
    }

    console.log("Found units:", units.length);
    res.status(200).json({ units });
  } catch (error) {
    console.error("Error getting units:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unit by ID
exports.getUnitById = async (req, res) => {
  try {
    console.log("Getting unit by ID:", req.params.id);
    const unit = await Unit.findOne({ id: req.params.id });

    if (!unit) {
      console.log("Unit not found:", req.params.id);
      return res.status(404).json({ message: "Unit not found" });
    }

    console.log("Found unit:", unit.title);
    res.status(200).json({ unit });
  } catch (error) {
    console.error("Error getting unit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new unit (admin only)
exports.createUnit = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id, subjectId, title, description, totalDuration, lessons } =
      req.body;

    // Check if unit already exists
    const existingUnit = await Unit.findOne({ id });
    if (existingUnit) {
      return res.status(400).json({ message: "Unit already exists" });
    }

    // Validate lessons
    if (lessons && lessons.length > 0) {
      // Ensure each lesson has the required fields and correct types
      const isValidLessons = lessons.every((lesson) => {
        // Check if id is a number
        if (typeof lesson.id !== "number") {
          console.error("Invalid lesson id type:", typeof lesson.id, lesson.id);
          return false;
        }

        // Check required fields
        if (
          !lesson.title ||
          !lesson.type ||
          !lesson.duration ||
          !lesson.content
        ) {
          console.error("Missing required lesson fields");
          return false;
        }

        return true;
      });

      if (!isValidLessons) {
        return res.status(400).json({ message: "Invalid lesson data" });
      }
    }

    // Create new unit
    const unit = new Unit({
      id,
      subjectId,
      title,
      description,
      totalDuration,
      lessons,
    });

    await unit.save();

    res.status(201).json({
      message: "Unit created successfully",
      unit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a unit (admin only)
exports.updateUnit = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["title", "description", "totalDuration", "lessons"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const unit = await Unit.findOne({ id: req.params.id });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Validate lessons if they are being updated
    if (req.body.lessons) {
      // Ensure each lesson has the required fields and correct types
      const isValidLessons = req.body.lessons.every((lesson) => {
        // Check if id is a number
        if (typeof lesson.id !== "number") {
          console.error("Invalid lesson id type:", typeof lesson.id, lesson.id);
          return false;
        }

        // Check required fields
        if (
          !lesson.title ||
          !lesson.type ||
          !lesson.duration ||
          !lesson.content
        ) {
          console.error("Missing required lesson fields");
          return false;
        }

        return true;
      });

      if (!isValidLessons) {
        return res.status(400).json({ message: "Invalid lesson data" });
      }
    }

    updates.forEach((update) => {
      unit[update] = req.body[update];
    });

    await unit.save();

    res.status(200).json({
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update lesson completion status
exports.updateLessonStatus = async (req, res) => {
  try {
    const { unitId, lessonId, completed } = req.body;
    const userId = req.user._id;

    // Get the unit to find the lesson
    const unit = await Unit.findOne({ id: unitId });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Find the lesson in the unit
    const lesson = unit.lessons.find(
      (lesson) => lesson.id === parseInt(lessonId)
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Find the user's progress record
    const Progress = require("../models/Progress");
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

    // Find the subject for this unit
    const subjectId = unit.subjectId;

    // Find the subject in the progress
    const subjectIndex = progress.subjects.findIndex(
      (s) => s.subjectId === subjectId
    );

    if (subjectIndex === -1) {
      return res.status(404).json({ message: "Subject not found in progress" });
    }

    // Find the unit in the subject
    const unitIndex = progress.subjects[subjectIndex].units.findIndex(
      (u) => u.unitId === unitId
    );

    if (unitIndex === -1) {
      return res.status(404).json({ message: "Unit not found in progress" });
    }

    // Calculate the number of completed lessons
    let lessonsCompleted = 0;

    // Create a temporary map to track completion status
    const lessonCompletionMap = {};

    // Initialize with current completion status from unit
    unit.lessons.forEach((l) => {
      lessonCompletionMap[l.id] =
        l.id === parseInt(lessonId) ? completed : l.completed;
    });

    // Count completed lessons
    lessonsCompleted =
      Object.values(lessonCompletionMap).filter(Boolean).length;

    // Update lessons completed in progress
    progress.subjects[subjectIndex].units[unitIndex].lessonsCompleted =
      lessonsCompleted;

    // Check if all lessons are completed
    if (lessonsCompleted === unit.lessons.length) {
      progress.subjects[subjectIndex].units[unitIndex].completed = true;

      // Update units completed in subject
      const completedUnits = progress.subjects[subjectIndex].units.filter(
        (u) => u.completed
      ).length;
      progress.subjects[subjectIndex].unitsCompleted = completedUnits;
    }

    // Update last accessed
    progress.subjects[subjectIndex].units[unitIndex].lastAccessed = new Date();
    progress.subjects[subjectIndex].lastAccessed = new Date();
    progress.lastUpdated = new Date();

    await progress.save();

    // Return the updated lesson with the user-specific completion status
    const updatedLesson = {
      ...lesson.toObject(),
      completed: completed,
    };

    res.status(200).json({
      message: "Lesson status updated successfully",
      lesson: updatedLesson,
      progress: progress.subjects[subjectIndex].units[unitIndex],
    });
  } catch (error) {
    console.error("Error updating lesson status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a unit (admin only)
exports.deleteUnit = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const unit = await Unit.findOneAndDelete({ id: req.params.id });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
