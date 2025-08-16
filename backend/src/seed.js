const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Load environment variables
console.log("Loading environment variables...");
require("dotenv").config({ path: "../.env" });
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Import models
const User = require("./models/User");
const Subject = require("./models/Subject");
const Unit = require("./models/Unit");
const Quiz = require("./models/Quiz");
const ReviewMaterial = require("./models/ReviewMaterial");

// Connect to MongoDB
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Unit.deleteMany({});
    await Quiz.deleteMany({});
    await ReviewMaterial.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    });
    await admin.save();

    // Create test user
    const userPassword = await bcrypt.hash("user123", 10);
    const user = new User({
      username: "testuser",
      email: "user@example.com",
      password: userPassword,
      name: "Test User",
      role: "student",
    });
    await user.save();

    console.log("Created users");

    // Create subjects
    const subjects = [
      {
        id: "physics",
        name: "Physics",
        description: "Explore the fundamental laws that govern the universe",
        iconType: "Beaker",
        color: "bg-blue-500",
        units: 3,
      },
      {
        id: "mathematics",
        name: "Mathematics",
        description: "Master mathematical concepts and problem-solving",
        iconType: "Calculator",
        color: "bg-purple-500",
        units: 3,
      },
      {
        id: "chemistry",
        name: "Chemistry",
        description: "Understand the composition and properties of matter",
        iconType: "BookOpen",
        color: "bg-green-500",
        units: 2,
      },
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log("Created subjects");

    // Create units for Physics
    const physicsUnits = [
      {
        id: "physics-unit1",
        subjectId: "physics",
        title: "Mechanics: Forces and Motion",
        description: "Study of forces and their effect on motion",
        totalDuration: "2 hours",
        lessons: [
          {
            id: 1,
            title: "Introduction to Forces",
            type: "video",
            duration: "15 mins",
            content: "Video content about forces",
            completed: false,
          },
          {
            id: 2,
            title: "Newton's Laws of Motion",
            type: "reading",
            duration: "20 mins",
            content: "Reading material about Newton's laws",
            completed: false,
          },
          {
            id: 3,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on forces and motion",
            completed: false,
          },
        ],
      },
      {
        id: "physics-unit2",
        subjectId: "physics",
        title: "Energy and Work",
        description: "Understanding energy, work, and power",
        totalDuration: "1.5 hours",
        lessons: [
          {
            id: 1,
            title: "Types of Energy",
            type: "video",
            duration: "20 mins",
            content: "Video about different types of energy",
            completed: false,
          },
          {
            id: 2,
            title: "Work and Power",
            type: "reading",
            duration: "25 mins",
            content: "Reading material about work and power",
            completed: false,
          },
        ],
      },
      {
        id: "physics-unit3",
        subjectId: "physics",
        title: "Waves and Oscillations",
        description: "Study of wave phenomena and oscillatory motion",
        totalDuration: "2.5 hours",
        lessons: [
          {
            id: 1,
            title: "Simple Harmonic Motion",
            type: "video",
            duration: "25 mins",
            content: "Video about simple harmonic motion",
            completed: false,
          },
          {
            id: 2,
            title: "Wave Properties",
            type: "reading",
            duration: "20 mins",
            content: "Reading material about wave properties",
            completed: false,
          },
          {
            id: 3,
            title: "Sound Waves",
            type: "video",
            duration: "15 mins",
            content: "Video about sound waves",
            completed: false,
          },
          {
            id: 4,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on waves",
            completed: false,
          },
        ],
      },
    ];

    await Unit.insertMany(physicsUnits);
    console.log("Created physics units");

    // Create units for Mathematics
    const mathUnits = [
      {
        id: "math-unit1",
        subjectId: "mathematics",
        title: "Algebra Fundamentals",
        description: "Basic algebraic concepts and operations",
        totalDuration: "2 hours",
        lessons: [
          {
            id: 1,
            title: "Variables and Expressions",
            type: "video",
            duration: "20 mins",
            content: "Video about variables and expressions",
            completed: false,
          },
          {
            id: 2,
            title: "Solving Equations",
            type: "reading",
            duration: "25 mins",
            content: "Reading material about solving equations",
            completed: false,
          },
          {
            id: 3,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on algebra",
            completed: false,
          },
        ],
      },
      {
        id: "math-unit2",
        subjectId: "mathematics",
        title: "Geometry",
        description: "Study of shapes, sizes, and properties of space",
        totalDuration: "2.5 hours",
        lessons: [
          {
            id: 1,
            title: "Angles and Lines",
            type: "video",
            duration: "20 mins",
            content: "Video about angles and lines",
            completed: false,
          },
          {
            id: 2,
            title: "Triangles and Polygons",
            type: "reading",
            duration: "25 mins",
            content: "Reading material about triangles and polygons",
            completed: false,
          },
          {
            id: 3,
            title: "Circles",
            type: "video",
            duration: "15 mins",
            content: "Video about circles",
            completed: false,
          },
          {
            id: 4,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on geometry",
            completed: false,
          },
        ],
      },
      {
        id: "math-unit3",
        subjectId: "mathematics",
        title: "Calculus",
        description: "Study of continuous change and its applications",
        totalDuration: "3 hours",
        lessons: [
          {
            id: 1,
            title: "Limits and Continuity",
            type: "video",
            duration: "25 mins",
            content: "Video about limits and continuity",
            completed: false,
          },
          {
            id: 2,
            title: "Derivatives",
            type: "reading",
            duration: "30 mins",
            content: "Reading material about derivatives",
            completed: false,
          },
          {
            id: 3,
            title: "Integration",
            type: "video",
            duration: "25 mins",
            content: "Video about integration",
            completed: false,
          },
          {
            id: 4,
            title: "Practice Problems",
            type: "exercise",
            duration: "40 mins",
            content: "Practice problems on calculus",
            completed: false,
          },
        ],
      },
    ];

    await Unit.insertMany(mathUnits);
    console.log("Created math units");

    // Create units for Chemistry
    const chemistryUnits = [
      {
        id: "chemistry-unit1",
        subjectId: "chemistry",
        title: "Atomic Structure",
        description: "Understanding the structure of atoms",
        totalDuration: "2 hours",
        lessons: [
          {
            id: 1,
            title: "Atomic Models",
            type: "video",
            duration: "20 mins",
            content: "Video about atomic models",
            completed: false,
          },
          {
            id: 2,
            title: "Electron Configuration",
            type: "reading",
            duration: "25 mins",
            content: "Reading material about electron configuration",
            completed: false,
          },
          {
            id: 3,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on atomic structure",
            completed: false,
          },
        ],
      },
      {
        id: "chemistry-unit2",
        subjectId: "chemistry",
        title: "Chemical Bonding",
        description: "Study of chemical bonds and molecular structure",
        totalDuration: "2.5 hours",
        lessons: [
          {
            id: 1,
            title: "Ionic Bonding",
            type: "video",
            duration: "20 mins",
            content: "Video about ionic bonding",
            completed: false,
          },
          {
            id: 2,
            title: "Covalent Bonding",
            type: "reading",
            duration: "25 mins",
            content: "Reading material about covalent bonding",
            completed: false,
          },
          {
            id: 3,
            title: "Molecular Geometry",
            type: "video",
            duration: "20 mins",
            content: "Video about molecular geometry",
            completed: false,
          },
          {
            id: 4,
            title: "Practice Problems",
            type: "exercise",
            duration: "30 mins",
            content: "Practice problems on chemical bonding",
            completed: false,
          },
        ],
      },
    ];

    await Unit.insertMany(chemistryUnits);
    console.log("Created chemistry units");

    // Create quizzes
    const quizzes = [
      {
        id: "physics-unit1-quiz",
        unitId: "physics-unit1",
        title: "Forces and Motion Quiz",
        description: "Test your knowledge of forces and motion",
        timeLimit: 15,
        questions: [
          {
            id: 1,
            question: "What is Newton's First Law of Motion?",
            options: [
              "An object in motion stays in motion unless acted upon by an external force",
              "Force equals mass times acceleration",
              "For every action, there is an equal and opposite reaction",
              "None of the above",
            ],
            correctAnswer: 0,
            explanation: "Newton's First Law",
          },
          {
            id: 2,
            question: "What is the SI unit of force?",
            options: ["Watt", "Joule", "Newton", "Pascal"],
            correctAnswer: 2,
            explanation: "Units of Force",
          },
          {
            id: 3,
            question: "Which of the following is a vector quantity?",
            options: ["Mass", "Time", "Temperature", "Velocity"],
            correctAnswer: 3,
            explanation: "Vector Quantities",
          },
        ],
      },
      {
        id: "math-unit1-quiz",
        unitId: "math-unit1",
        title: "Algebra Fundamentals Quiz",
        description: "Test your knowledge of basic algebra",
        timeLimit: 20,
        questions: [
          {
            id: 1,
            question: "Solve for x: 2x + 5 = 15",
            options: ["x = 5", "x = 10", "x = 7.5", "x = 3"],
            correctAnswer: 0,
            explanation: "Linear Equations",
          },
          {
            id: 2,
            question: "Which of the following is a quadratic equation?",
            options: ["y = 2x + 3", "y = x² + 2x + 1", "y = 3/x", "y = √x"],
            correctAnswer: 1,
            explanation: "Quadratic Equations",
          },
          {
            id: 3,
            question: "Simplify: (3x² + 2x) - (x² - 3x + 5)",
            options: [
              "2x² + 5x - 5",
              "4x² - x - 5",
              "2x² + 5x + 5",
              "4x² - x + 5",
            ],
            correctAnswer: 0,
            explanation: "Algebraic Expressions",
          },
        ],
      },
    ];

    await Quiz.insertMany(quizzes);
    console.log("Created quizzes");

    // Create review materials
    const reviewMaterials = [
      {
        title: "Newton's Laws Explained",
        type: "video",
        difficulty: "Easy",
        time: "15 mins",
        content: "Video explaining Newton's laws in simple terms",
        unitId: "physics-unit1",
        topics: [
          "Newton's First Law",
          "Newton's Second Law",
          "Newton's Third Law",
        ],
      },
      {
        title: "Forces and Motion Review Guide",
        type: "document",
        difficulty: "Medium",
        time: "20 mins",
        content: "Comprehensive review guide for forces and motion",
        unitId: "physics-unit1",
        topics: ["Forces", "Motion", "Newton's Laws"],
      },
      {
        title: "Practice Problems Set",
        type: "exercise",
        difficulty: "Hard",
        time: "30 mins",
        content: "Advanced practice problems on forces and motion",
        unitId: "physics-unit1",
        topics: ["Forces", "Motion", "Problem Solving"],
      },
      {
        title: "Algebra Fundamentals Review",
        type: "document",
        difficulty: "Medium",
        time: "25 mins",
        content: "Comprehensive review of algebra fundamentals",
        unitId: "math-unit1",
        topics: [
          "Linear Equations",
          "Algebraic Expressions",
          "Quadratic Equations",
        ],
      },
      {
        title: "Solving Equations Step by Step",
        type: "video",
        difficulty: "Easy",
        time: "15 mins",
        content: "Video tutorial on solving equations step by step",
        unitId: "math-unit1",
        topics: ["Linear Equations", "Problem Solving"],
      },
    ];

    await ReviewMaterial.insertMany(reviewMaterials);
    console.log("Created review materials");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
