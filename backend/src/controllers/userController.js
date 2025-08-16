const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { username, email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log("User already exists:", existingUser.username);
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      name,
    });

    await user.save();
    console.log("User created successfully:", user.username);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User logged in successfully:", username);
    console.log("User photoURL:", user.photoURL);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    console.log("Getting user profile for:", req.user.username);
    console.log("User photoURL in database:", req.user.photoURL);

    res.status(200).json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        photoURL: req.user.photoURL,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "photoURL"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    console.log("Updating user profile with:", req.body);

    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    console.log("User profile updated successfully");

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        photoURL: req.user.photoURL,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
