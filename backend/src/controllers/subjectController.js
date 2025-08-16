const Subject = require("../models/Subject");

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({ id: req.params.id });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ subject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new subject (admin only)
exports.createSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id, name, description, iconType, color, units, imageUrl } =
      req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ id });
    console.log(id, name);
    if (existingSubject) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    // Process units as a number
    const unitsNumber = Number(units);
    if (isNaN(unitsNumber)) {
      return res.status(400).json({ message: "Units must be a valid number" });
    }

    // Create new subject
    const subject = new Subject({
      id,
      name,
      description,
      iconType,
      color,
      units: unitsNumber,
      imageUrl,
    });

    await subject.save();

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a subject (admin only)
exports.updateSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "name",
      "description",
      "iconType",
      "color",
      "units",
      "imageUrl",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const subject = await Subject.findOne({ id: req.params.id });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Process units as a number
    if (req.body.units !== undefined) {
      req.body.units = Number(req.body.units);
      if (isNaN(req.body.units)) {
        return res
          .status(400)
          .json({ message: "Units must be a valid number" });
      }
    }

    updates.forEach((update) => {
      subject[update] = req.body[update];
    });

    await subject.save();

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a subject (admin only)
exports.deleteSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = await Subject.findOneAndDelete({ id: req.params.id });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
