import React, { useState, useEffect } from "react";
import { quizAPI, unitAPI, subjectAPI } from "../../services/api";

interface Subject {
  _id: string;
  id: string;
  name: string;
}

interface Unit {
  _id: string;
  id: string;
  subjectId: string;
  title: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  _id: string;
  id: string;
  unitId: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

const QuizManager: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    unitId: "",
    title: "",
    description: "",
    timeLimit: 15,
    questions: [
      {
        id: 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ],
  });

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectAPI.getAllSubjects();
        setSubjects(response.data.subjects);

        if (response.data.subjects.length > 0 && !selectedSubject) {
          setSelectedSubject(response.data.subjects[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching subjects:", err);
        setError(err.response?.data?.message || "Failed to fetch subjects");
      }
    };

    fetchSubjects();
  }, []);

  // Fetch units for selected subject
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedSubject) return;

      try {
        const response = await unitAPI.getUnitsBySubject(selectedSubject);
        setUnits(response.data.units);

        if (response.data.units.length > 0) {
          setSelectedUnit(response.data.units[0].id);
        } else {
          setSelectedUnit("");
        }
      } catch (err: any) {
        console.error("Error fetching units:", err);
        setError(err.response?.data?.message || "Failed to fetch units");
      }
    };

    fetchUnits();
  }, [selectedSubject]);

  // Fetch quizzes for selected unit
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedUnit) {
        setQuizzes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching quizzes for unit: ${selectedUnit}`);

        const response = await quizAPI.getAllQuizzes();
        console.log("All quizzes response:", response.data);

        if (!response.data.quizzes || !Array.isArray(response.data.quizzes)) {
          console.error("Invalid response format:", response.data);
          setError("Invalid response format from server");
          setQuizzes([]);
          return;
        }

        // Filter quizzes for the selected unit
        const unitQuizzes = response.data.quizzes.filter(
          (quiz: Quiz) => quiz.unitId === selectedUnit
        );

        console.log(
          `Found ${unitQuizzes.length} quizzes for unit ${selectedUnit}`
        );
        setQuizzes(unitQuizzes);
        setError("");

        // If no quiz exists for this unit, pre-fill the form with unit data
        if (unitQuizzes.length === 0 && !showForm) {
          // Find the unit in the units array
          const unit = units.find((u) => u.id === selectedUnit);
          if (unit) {
            setFormData({
              ...formData,
              unitId: selectedUnit,
              title: `${unit.title} Quiz`,
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching quizzes:", err);
        setError(err.response?.data?.message || "Failed to fetch quizzes");
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedUnit]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle timeLimit as a number
    if (name === "timeLimit") {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 15,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle question input changes
  const handleQuestionChange = (
    questionIndex: number,
    field: string,
    value: string | number
  ) => {
    const updatedQuestions = [...formData.questions];

    // Ensure correctAnswer is stored as a number
    if (field === "correctAnswer") {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: Number(value),
      };
      console.log(
        `Setting correctAnswer for question ${questionIndex} to ${Number(
          value
        )} (type: ${typeof Number(value)})`
      );
    } else {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
    }

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  // Handle option input changes
  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  // Add a new question
  const handleAddQuestion = () => {
    const newId =
      formData.questions.length > 0
        ? Math.max(...formData.questions.map((q) => q.id)) + 1
        : 1;

    // Ensure correctAnswer is a number
    const newQuestion = {
      id: newId,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0, // Explicitly set as a number
      explanation: "",
    };

    console.log(
      "Adding new question with correctAnswer type:",
      typeof newQuestion.correctAnswer
    );

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  // Remove a question
  const handleRemoveQuestion = (questionIndex: number) => {
    if (formData.questions.length <= 1) {
      setError("Quiz must have at least one question");
      return;
    }

    const updatedQuestions = formData.questions.filter(
      (_, index) => index !== questionIndex
    );

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  // Reset form
  const resetForm = () => {
    // Initialize with a single empty question with correctAnswer as a number
    const initialQuestion = {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0, // Explicitly set as a number
      explanation: "",
    };

    setFormData({
      unitId: selectedUnit || "",
      title: "",
      description: "",
      timeLimit: 15,
      questions: [initialQuestion],
    });
    setEditingQuiz(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      // Generate a unique ID based on the unit ID
      const quizId = `${formData.unitId}-quiz`;

      // Ensure all correctAnswer values are numbers
      const processedQuestions = formData.questions.map((question) => ({
        ...question,
        correctAnswer: Number(question.correctAnswer),
      }));

      console.log(
        "Processed questions with numeric correctAnswers:",
        processedQuestions
      );

      if (editingQuiz) {
        // Update existing quiz
        const response = await quizAPI.updateQuiz(editingQuiz.id, {
          title: formData.title,
          description: formData.description,
          timeLimit: formData.timeLimit,
          questions: processedQuestions,
        });

        setQuizzes(
          quizzes.map((quiz) =>
            quiz.id === editingQuiz.id ? response.data.quiz : quiz
          )
        );

        setError("");
        resetForm();
      } else {
        // Create new quiz
        const response = await quizAPI.createQuiz({
          id: quizId,
          unitId: formData.unitId,
          title: formData.title,
          description: formData.description,
          timeLimit: formData.timeLimit,
          questions: processedQuestions,
        });

        setQuizzes([...quizzes, response.data.quiz]);
        setError("");
        resetForm();
      }
    } catch (err: any) {
      console.error("Error saving quiz:", err);
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.unitId) {
      errors.push("Please select a unit");
    }

    if (!formData.title) {
      errors.push("Title is required");
    }

    if (formData.questions.length === 0) {
      errors.push("At least one question is required");
    }

    // Validate each question
    formData.questions.forEach((question, index) => {
      if (!question.question) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      // Check if all options have values
      const emptyOptions = question.options.filter((opt) => !opt.trim());
      if (emptyOptions.length > 0) {
        errors.push(`Question ${index + 1}: All options must have values`);
      }

      // Check if correctAnswer is a valid number
      if (
        typeof question.correctAnswer !== "number" ||
        isNaN(Number(question.correctAnswer))
      ) {
        errors.push(`Question ${index + 1}: Correct answer must be a number`);
      }

      // Check if correctAnswer is valid
      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        errors.push(
          `Question ${index + 1}: Please select a valid correct answer`
        );
      }
    });

    return errors;
  };

  // Handle edit
  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      unitId: quiz.unitId,
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit,
      questions: quiz.questions,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      setLoading(true);
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
      setError("");
    } catch (err: any) {
      console.error("Error deleting quiz:", err);
      setError(err.response?.data?.message || "Failed to delete quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
    setFormData({
      ...formData,
      unitId: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz Manager</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Add Quiz"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline whitespace-pre-line">{error}</span>
        </div>
      )}

      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-1/2">
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-gray-700"
          >
            Unit
          </label>
          <select
            id="unit"
            name="unit"
            value={selectedUnit}
            onChange={handleUnitChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingQuiz ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="timeLimit"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Question
                  </button>
                </div>

                {formData.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-md p-4 mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium">
                        Question {questionIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`question-${questionIndex}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Question Text
                        </label>
                        <input
                          type="text"
                          id={`question-${questionIndex}`}
                          value={question.question}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              "question",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center mb-2"
                          >
                            <input
                              type="radio"
                              id={`correct-${questionIndex}-${optionIndex}`}
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() =>
                                handleQuestionChange(
                                  questionIndex,
                                  "correctAnswer",
                                  optionIndex
                                )
                              }
                              className="mr-2"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label
                          htmlFor={`explanation-${questionIndex}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Explanation (shown after answering)
                        </label>
                        <textarea
                          id={`explanation-${questionIndex}`}
                          value={question.explanation}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              "explanation",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {loading ? "Saving..." : "Save Quiz"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List */}
      {loading && !showForm ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {!selectedUnit ? (
            <div className="p-6 text-center text-gray-500">
              Please select a unit to view its quizzes.
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No quizzes found for this unit. Add your first quiz to get
              started.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Questions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time Limit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quiz.title}
                      </div>
                      <div className="text-sm text-gray-500">ID: {quiz.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {quiz.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.questions.length} questions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.timeLimit} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(quiz)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizManager;
