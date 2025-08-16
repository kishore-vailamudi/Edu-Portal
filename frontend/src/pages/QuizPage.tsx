import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { quizAPI, progressAPI } from "../services/api";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Quiz {
  id: string;
  unitId: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

interface Answer {
  questionId: number;
  selectedOption: number;
  responseTime: number;
  retries: number;
  emotionData?: any;
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams() as { quizId: string };
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | React.ReactNode>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;

      try {
        console.log("Fetching quiz:", quizId);

        // Check if we're already trying to fetch the sample quiz
        if (quizId === "sample-quiz") {
          try {
            const response = await quizAPI.getQuizById(quizId);
            setQuiz(response.data.quiz);
            setTimeLeft(response.data.quiz.timeLimit * 60); // Convert minutes to seconds
          } catch (sampleErr) {
            console.error("Error fetching sample quiz:", sampleErr);
            setError(
              "Failed to fetch the sample quiz. Please try again later."
            );
          }
        } else {
          // Try to fetch the requested quiz
          try {
            const response = await quizAPI.getQuizById(quizId);
            setQuiz(response.data.quiz);
            setTimeLeft(response.data.quiz.timeLimit * 60); // Convert minutes to seconds
          } catch (err: any) {
            console.error("Error fetching quiz:", err);

            // If the quiz is not found, try to fetch the sample quiz as a fallback
            if (err.response?.status === 404) {
              try {
                console.log("Attempting to fetch sample quiz as fallback");
                const sampleResponse = await quizAPI.getQuizById("sample-quiz");

                // Show a message but still display the sample quiz
                setError(
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                    <p>
                      The requested quiz was not found. Showing a sample quiz
                      instead.
                    </p>
                    <button
                      onClick={() => setError("")}
                      className="mt-2 text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      Dismiss
                    </button>
                  </div>
                );

                setQuiz(sampleResponse.data.quiz);
                setTimeLeft(sampleResponse.data.quiz.timeLimit * 60);
              } catch (sampleErr) {
                console.error("Error fetching sample quiz:", sampleErr);
                setError(
                  <div>
                    <p>The requested quiz was not found.</p>
                    <p className="mt-2">You can try the sample quiz instead:</p>
                    <button
                      onClick={() => navigate("/quiz/sample-quiz")}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Try Sample Quiz
                    </button>
                  </div>
                );
              }
            } else {
              // For other errors, show a generic error message
              setError(
                err.response?.data?.message ||
                  "Failed to fetch quiz. Please try again later."
              );
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId, navigate]);

  // Set up timer when quiz is loaded
  useEffect(() => {
    if (!quiz || timeLeft === 0) return;

    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - clear interval and submit quiz
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          // Auto-submit the quiz when time runs out
          if (!isSubmitting && !showResults) {
            handleSubmitQuiz();
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, timeLeft, isSubmitting, showResults]);

  const handleOptionSelect = (optionIndex: number) => {
    if (!quiz) return;

    // Record the start time if this is the first interaction
    if (answers.length === 0 && !startTime) {
      setStartTime(Date.now());
    }

    // Calculate response time
    const responseTime = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    // Check if this question has already been answered
    const existingAnswerIndex = answers.findIndex(
      (a) => a.questionId === quiz.questions[currentQuestion].id
    );

    let newAnswers = [...answers];

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      newAnswers[existingAnswerIndex] = {
        ...newAnswers[existingAnswerIndex],
        selectedOption: Number(optionIndex),
        retries: newAnswers[existingAnswerIndex].retries + 1,
      };
    } else {
      // Add new answer
      newAnswers.push({
        questionId: quiz.questions[currentQuestion].id,
        selectedOption: Number(optionIndex),
        responseTime,
        retries: 0,
      });
    }

    console.log(
      `Selected option ${optionIndex} for question ${quiz.questions[currentQuestion].id}`
    );

    // Update answers state
    setAnswers(newAnswers);

    // Add a small delay before moving to the next question for better UX
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else if (newAnswers.length === quiz.questions.length) {
        // If all questions are answered and this is the last question, ask for confirmation
        // Use the updated newAnswers array directly instead of relying on the state which might not be updated yet
        if (window.confirm("Are you sure you want to submit the quiz?")) {
          // Pass the newAnswers directly to ensure the last answer is included
          handleSubmitQuizWithAnswers(newAnswers);
        }
      }
    }, 500);
  };

  // New function to handle quiz submission with specific answers
  const handleSubmitQuizWithAnswers = async (submissionAnswers: Answer[]) => {
    if (!quiz) return;

    setIsSubmitting(true);

    try {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Calculate total time taken
      const timeTaken = quiz.timeLimit * 60 - timeLeft;

      // Log detailed information about the answers being submitted
      console.log(
        "Submitting answers:",
        submissionAnswers.map((a) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          type: typeof a.selectedOption,
        }))
      );

      // Prepare submission data
      const submissionData = {
        quizId: quiz.id,
        answers: submissionAnswers,
        timeTaken,
        emotionData: {}, // This would be populated if emotion tracking is implemented
      };

      console.log("Submitting quiz:", submissionData);

      // Submit the quiz
      const response = await quizAPI.submitQuiz(submissionData);

      console.log("Quiz submission response:", response.data);

      // Set the result and show the result screen
      setQuizResult(response.data);
      setShowResults(true);

      // Update progress if needed
      try {
        // Ensure the score is a number
        const score = parseFloat(response.data.score);

        console.log("Updating quiz score with:", {
          quizId: quiz.id,
          unitId: quiz.unitId,
          score: score,
        });

        await progressAPI.updateQuizScore({
          quizId: quiz.id,
          unitId: quiz.unitId,
          score: score,
        });

        console.log("Progress updated successfully");

        // Fetch updated progress to verify changes
        try {
          const progressResponse = await progressAPI.getUserProgress();
          console.log("Updated progress:", progressResponse.data.progress);
        } catch (progressErr) {
          console.error("Error fetching updated progress:", progressErr);
        }
      } catch (err) {
        console.error("Error updating progress:", err);
        // Don't fail the whole submission if progress update fails
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <p className="font-medium">Failed to submit quiz</p>
          <p className="text-sm mt-1">
            {err.response?.data?.message || "An unexpected error occurred"}
          </p>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Original handleSubmitQuiz function now just calls the new function with the current answers state
  const handleSubmitQuiz = async () => {
    handleSubmitQuizWithAnswers(answers);
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Add a button to return to the unit page after viewing results
  const handleReturnToUnit = () => {
    if (quiz && quiz.unitId) {
      // Navigate back to the unit page with state indicating we're coming from the quiz
      navigate(`/unit/${quiz.unitId}`, { state: { fromQuiz: true } });
    } else {
      // If for some reason we don't have the unitId, just go to the subjects page
      navigate("/subjects");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error || "Quiz not found"}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          {error}
        </div>
      ) : !quiz ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-700">Quiz not found</h2>
          <p className="mt-2 text-gray-600">
            The requested quiz could not be found.
          </p>
          <button
            onClick={() => navigate("/subjects")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Subjects
          </button>
        </div>
      ) : showResults ? (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz Results
          </h2>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Your Score:</span>
              <span className="text-xl font-bold text-indigo-600">
                {quizResult.score.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  quizResult.score >= 70
                    ? "bg-green-500"
                    : quizResult.score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${quizResult.score}%` }}
              ></div>
            </div>
          </div>

          {quizResult.recommendations &&
            quizResult.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Recommendations:
                </h3>
                <ul className="space-y-3">
                  {quizResult.recommendations.map((rec: any, index: number) => (
                    <li key={index} className="bg-indigo-50 p-3 rounded-md">
                      <p className="font-medium text-indigo-800">
                        {rec.title || rec.content}
                      </p>
                      {rec.reason && (
                        <p className="text-sm text-indigo-600 mt-1">
                          {rec.reason}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {quizResult.weakAreas && quizResult.weakAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Areas to Improve:
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {quizResult.weakAreas.map((area: string, index: number) => (
                  <li key={index} className="text-gray-600">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleReturnToUnit}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Unit
            </button>
            <button
              onClick={() =>
                navigate("/review", {
                  state: {
                    quizId: quiz.id,
                    quizResult: {
                      score: quizResult.score,
                      timeTaken: quizResult.timeTaken,
                      totalQuestions: quiz.questions.length,
                      incorrectQuestions: quizResult.incorrectAnswers || 0,
                    },
                  },
                })
              }
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Go to Review Section
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleReturnToUnit}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              Return to Unit
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  {formatTime(timeLeft)} remaining
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-600 rounded-full"
                style={{
                  width: `${
                    ((currentQuestion + 1) / quiz.questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h2>
              <p className="text-lg text-gray-700">
                {quiz.questions[currentQuestion].question}
              </p>
              <div className="space-y-4">
                {quiz.questions[currentQuestion].options.map(
                  (option: string, index: number) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => handleOptionSelect(index)}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>{" "}
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Question navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentQuestion === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>

            {/* Question indicators */}
            <div className="flex items-center space-x-1">
              {quiz.questions.map((_, index) => {
                // Check if this question has been answered
                const isAnswered = answers.some(
                  (a) => a.questionId === quiz.questions[index].id
                );

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center ${
                      currentQuestion === index
                        ? "bg-indigo-600 text-white"
                        : isAnswered
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
