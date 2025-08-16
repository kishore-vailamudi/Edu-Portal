const Progress = require("../models/Progress");
const QuizResult = require("../models/QuizResult");
const Unit = require("../models/Unit");
const Subject = require("../models/Subject");

// Get user progress
exports.getUserProgress = async (req, res) => {
  try {
    console.log("Getting progress for user:", req.user._id);

    // Find or create progress record for the user
    let progress = await Progress.findOne({ userId: req.user._id });

    if (!progress) {
      console.log("No progress found, initializing new progress");

      // Initialize progress with all available subjects and units
      const subjects = await Subject.find();
      console.log(`Found ${subjects.length} subjects`);

      const subjectsProgress = await Promise.all(
        subjects.map(async (subject) => {
          const units = await Unit.find({ subjectId: subject.id });
          console.log(`Found ${units.length} units for subject ${subject.id}`);

          const unitsProgress = units.map((unit) => ({
            unitId: unit.id,
            completed: false,
            lessonsCompleted: 0,
            totalLessons: unit.lessons ? unit.lessons.length : 0,
            quizScore: 0,
            lastAccessed: new Date(),
          }));

          return {
            subjectId: subject.id,
            unitsCompleted: 0,
            totalUnits: units.length,
            units: unitsProgress,
            lastAccessed: new Date(),
          };
        })
      );

      progress = new Progress({
        userId: req.user._id,
        subjects: subjectsProgress,
        totalQuizzesTaken: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      });

      await progress.save();
      console.log("New progress saved");
    } else {
      console.log("Found existing progress");

      // Ensure all subjects and units are included in the progress
      const subjects = await Subject.find();

      // Check if we need to update the progress with new subjects/units
      let needsUpdate = false;

      for (const subject of subjects) {
        // Check if subject exists in progress
        let subjectProgress = progress.subjects.find(
          (s) => s.subjectId === subject.id
        );

        if (!subjectProgress) {
          console.log(`Adding new subject ${subject.id} to progress`);
          needsUpdate = true;

          const units = await Unit.find({ subjectId: subject.id });

          const unitsProgress = units.map((unit) => ({
            unitId: unit.id,
            completed: false,
            lessonsCompleted: 0,
            totalLessons: unit.lessons ? unit.lessons.length : 0,
            quizScore: 0,
            lastAccessed: new Date(),
          }));

          progress.subjects.push({
            subjectId: subject.id,
            unitsCompleted: 0,
            totalUnits: units.length,
            units: unitsProgress,
            lastAccessed: new Date(),
          });
        } else {
          // Check if all units for this subject are included
          const units = await Unit.find({ subjectId: subject.id });

          for (const unit of units) {
            const unitProgress = subjectProgress.units.find(
              (u) => u.unitId === unit.id
            );

            if (!unitProgress) {
              console.log(
                `Adding new unit ${unit.id} to subject ${subject.id}`
              );
              needsUpdate = true;

              subjectProgress.units.push({
                unitId: unit.id,
                completed: false,
                lessonsCompleted: 0,
                totalLessons: unit.lessons ? unit.lessons.length : 0,
                quizScore: 0,
                lastAccessed: new Date(),
              });

              // Update totalUnits count
              subjectProgress.totalUnits = subjectProgress.units.length;
            }
          }
        }
      }

      if (needsUpdate) {
        console.log("Saving updated progress");
        await progress.save();
      }
    }

    res.status(200).json({ progress });
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update unit progress
exports.updateUnitProgress = async (req, res) => {
  try {
    const { subjectId, unitId, lessonsCompleted } = req.body;

    // Find progress record for the user
    let progress = await Progress.findOne({ userId: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

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

    // Update lessons completed
    progress.subjects[subjectIndex].units[unitIndex].lessonsCompleted =
      lessonsCompleted;

    // Check if all lessons are completed
    const unit = await Unit.findOne({ id: unitId });

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

    res.status(200).json({
      message: "Unit progress updated successfully",
      unitProgress: progress.subjects[subjectIndex].units[unitIndex],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update quiz score in progress
exports.updateQuizScore = async (req, res) => {
  try {
    const { quizId, unitId, score } = req.body;

    console.log(
      `Updating quiz score for quiz ${quizId}, unit ${unitId}, score ${score}`
    );

    // Find progress record for the user
    let progress = await Progress.findOne({ userId: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

    // Find the unit in all subjects
    let found = false;
    let subjectIndex = -1;
    let unitIndex = -1;

    for (let i = 0; i < progress.subjects.length; i++) {
      unitIndex = progress.subjects[i].units.findIndex(
        (u) => u.unitId === unitId
      );

      if (unitIndex !== -1) {
        subjectIndex = i;
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ message: "Unit not found in progress" });
    }

    // Get the unit to find the total number of lessons
    const unit = await Unit.findOne({ id: unitId });
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Update quiz score - ensure it's a number
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) {
      return res.status(400).json({ message: "Invalid score value" });
    }

    console.log(`Storing quiz score: ${numericScore}`);
    progress.subjects[subjectIndex].units[unitIndex].quizScore = numericScore;

    // Mark the unit as completed
    progress.subjects[subjectIndex].units[unitIndex].completed = true;

    // Mark all lessons as completed
    progress.subjects[subjectIndex].units[unitIndex].lessonsCompleted =
      unit.lessons.length;
    progress.subjects[subjectIndex].units[unitIndex].totalLessons =
      unit.lessons.length;

    // Update units completed in subject
    const completedUnits = progress.subjects[subjectIndex].units.filter(
      (u) => u.completed
    ).length;
    progress.subjects[subjectIndex].unitsCompleted = completedUnits;

    // Update last accessed
    progress.subjects[subjectIndex].units[unitIndex].lastAccessed = new Date();
    progress.subjects[subjectIndex].lastAccessed = new Date();

    // Update total quizzes taken and average score
    progress.totalQuizzesTaken += 1;

    // Calculate new average score
    const quizResults = await QuizResult.find({ userId: req.user._id });
    const totalScore = quizResults.reduce(
      (sum, result) => sum + result.score,
      0
    );
    progress.averageScore = totalScore / quizResults.length;

    progress.lastUpdated = new Date();

    await progress.save();

    console.log("Progress updated successfully after quiz completion");
    console.log(
      "Updated unit progress:",
      progress.subjects[subjectIndex].units[unitIndex]
    );

    res.status(200).json({
      message: "Quiz score updated successfully",
      progress,
    });
  } catch (error) {
    console.error("Error updating quiz score:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update time spent
exports.updateTimeSpent = async (req, res) => {
  try {
    const { timeSpent } = req.body; // time in minutes

    // Find progress record for the user
    let progress = await Progress.findOne({ userId: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

    // Update total time spent
    progress.totalTimeSpent += timeSpent;
    progress.lastUpdated = new Date();

    await progress.save();

    res.status(200).json({
      message: "Time spent updated successfully",
      totalTimeSpent: progress.totalTimeSpent,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
