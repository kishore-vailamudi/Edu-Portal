const express = require("express");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");

const router = express.Router();

// Handle base64 image uploads
router.post("/profile-image", auth, async (req, res) => {
  try {
    console.log("Profile image upload request received");
    const { imageData, filename } = req.body;

    if (!imageData || !filename) {
      console.error("Missing image data or filename");
      return res
        .status(400)
        .json({ message: "Image data and filename are required" });
    }

    // Extract the base64 data (remove the data:image/jpeg;base64, part)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create a unique filename
    const uniqueFilename = `${Date.now()}_${filename.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(__dirname, "../../public/uploads");
    console.log("Upload directory:", uploadDir);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating upload directory");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file
    const filePath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);
    console.log("File written to:", filePath);

    // Return the path to the file
    const fileUrl = `/uploads/${uniqueFilename}`;
    console.log("File URL:", fileUrl);

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
