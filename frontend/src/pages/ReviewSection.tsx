import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Video,
  FileText,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { reviewAPI, quizAPI } from "../services/api";

// Map for icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  document: FileText,
  video: Video,
  exercise: BookOpen,
  reading: FileText,
};

interface ReviewMaterial {
  _id: string;
  title: string;
  type: string;
  difficulty: string;
  time: string;
  content: string;
  unitId: string;
  topics: string[];
}

interface Recommendation {
  id: number;
  title: string;
  type: string;
  duration: string;
  unitId: string;
  unitTitle: string;
  reason: string;
}

interface QuizResult {
  score: number;
  timeTaken: number;
  totalQuestions: number;
  incorrectQuestions: number;
  weakAreas?: string[];
}

interface LocationState {
  quizResult?: QuizResult;
  quizId?: string;
}

const ReviewSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const quizId = state?.quizId;

  const [reviewMaterials, setReviewMaterials] = useState<ReviewMaterial[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(
    state?.quizResult || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch review materials
        const materialsResponse = await reviewAPI.getReviewMaterials();
        setReviewMaterials(materialsResponse.data.reviewMaterials);

        // If we have a quizId, fetch recommendations based on that quiz
        if (quizId) {
          try {
            const recommendationsResponse =
              await reviewAPI.getRecommendationsBasedOnQuiz(quizId);
            setRecommendations(recommendationsResponse.data.recommendations);

            // If we don't already have quiz results, set them from the response
            if (!quizResult) {
              setQuizResult({
                score: recommendationsResponse.data.score,
                totalQuestions: recommendationsResponse.data.totalQuestions,
                incorrectQuestions:
                  recommendationsResponse.data.incorrectQuestions,
                timeTaken: 0, // We don't have this from the API
              });
            }
          } catch (recErr) {
            console.error("Error fetching quiz-based recommendations:", recErr);
          }
        } else {
          // If no quizId, try to get the most recent quiz result
          try {
            const quizResultsResponse = await quizAPI.getQuizResults();
            if (
              quizResultsResponse.data.results &&
              quizResultsResponse.data.results.length > 0
            ) {
              const latestResult = quizResultsResponse.data.results[0];

              // Set the quiz result
              setQuizResult({
                score: latestResult.score,
                totalQuestions: latestResult.totalQuestions || 0,
                incorrectQuestions: latestResult.incorrectAnswers || 0,
                timeTaken: latestResult.timeTaken || 0,
              });

              // Get recommendations based on this quiz
              if (latestResult.quizId) {
                const recommendationsResponse =
                  await reviewAPI.getRecommendationsBasedOnQuiz(
                    latestResult.quizId
                  );
                setRecommendations(
                  recommendationsResponse.data.recommendations
                );
              }
            }
          } catch (resultErr) {
            console.error("Error fetching quiz results:", resultErr);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch review materials"
        );
        console.error("Error fetching review data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quizId, quizResult]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Review Materials</h1>
        </div>
        <p className="mt-2 text-gray-600">
          Personalized study materials based on your quiz performance
        </p>

        {quizResult && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-indigo-900">
              Quiz Results
            </h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-xl font-bold text-indigo-600">
                  {quizResult.score.toFixed(1)}%
                </p>
              </div>
              {quizResult.timeTaken > 0 && (
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Time Taken</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {Math.floor(quizResult.timeTaken / 60)}m{" "}
                    {quizResult.timeTaken % 60}s
                  </p>
                </div>
              )}
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-xl font-bold text-indigo-600">
                  {quizResult.totalQuestions}
                </p>
              </div>
              {quizResult.incorrectQuestions > 0 && (
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Incorrect Answers</p>
                  <p className="text-xl font-bold text-red-500">
                    {quizResult.incorrectQuestions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">
              Recommended Review Materials
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Based on your quiz performance, we recommend reviewing these
              lessons:
            </p>
            <ul className="mt-2 space-y-2">
              {recommendations.map((rec: Recommendation, index: number) => (
                <li
                  key={index}
                  className="text-sm text-yellow-700 bg-white p-3 rounded-md shadow-sm"
                >
                  <div className="flex items-center">
                    {iconMap[rec.type] && (
                      <div className="mr-2">
                        {React.createElement(iconMap[rec.type], {
                          className: "h-4 w-4 text-yellow-600",
                        })}
                      </div>
                    )}
                    <span className="font-medium">{rec.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-yellow-600">
                    {rec.type} • {rec.duration} • {rec.unitTitle}
                  </p>
                  <p className="mt-1 text-xs italic">{rec.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviewMaterials.map((material: ReviewMaterial) => {
          const Icon = iconMap[material.type] || FileText;
          return (
            <div
              key={material._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {material.type} • {material.time}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Difficulty: {material.difficulty}
                </span>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Start Review
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSection;
