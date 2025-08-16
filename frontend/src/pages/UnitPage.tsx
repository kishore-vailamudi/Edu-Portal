import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Play, FileText, CheckCircle, Clock, BookOpen } from "lucide-react";
import { unitAPI, progressAPI, quizAPI } from "../services/api";
import LessonContent from "../components/LessonContent";
import { useAuth } from "../contexts/AuthContext";

// Map for icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  Play,
  FileText,
  CheckCircle,
  BookOpen,
};

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration: string;
  completed: boolean;
  content: string;
}

interface Unit {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  totalDuration: string;
  lessons: Lesson[];
}

interface UnitProgress {
  unitId: string;
  completed: boolean;
  lessonsCompleted: number;
  totalLessons: number;
  quizScore: number;
  lastAccessed: string;
}

interface SubjectProgress {
  subjectId: string;
  unitsCompleted: number;
  totalUnits: number;
  units: UnitProgress[];
  lastAccessed: string;
}

interface ProgressData {
  userId: string;
  subjects: SubjectProgress[];
  totalQuizzesTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  lastUpdated: string;
}

const UnitPage: React.FC = () => {
  // Use type assertion for useParams
  const { unitId } = useParams() as { unitId: string };
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [allLessonsCompleted, setAllLessonsCompleted] =
    useState<boolean>(false);
  const [lessonsCompletedCount, setLessonsCompletedCount] = useState<number>(0);
  const [quizExists, setQuizExists] = useState<boolean>(false);
  const [quizId, setQuizId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (location.state && location.state.fromQuiz) {
      console.log("User returned from quiz page, refreshing data");
      setRefreshKey((prevKey) => prevKey + 1);
    }
  }, [location]);

  useEffect(() => {
    const fetchUnit = async () => {
      if (!unitId) return;

      try {
        setIsLoading(true);

        // Fetch the unit data
        const unitResponse = await unitAPI.getUnitById(unitId);
        const unitData = unitResponse.data.unit as Unit;

        console.log("Fetched unit data:", unitData);

        // Check if a quiz exists for this unit
        try {
          // The quiz ID is typically based on the unit ID
          const expectedQuizId = `${unitId}-quiz`;
          const quizResponse = await quizAPI.getQuizById(expectedQuizId);

          if (quizResponse.data.quiz) {
            console.log("Quiz found for this unit:", quizResponse.data.quiz);
            setQuizExists(true);
            setQuizId(expectedQuizId);
          }
        } catch (quizErr) {
          console.log("No quiz found for this unit");
          setQuizExists(false);
        }

        // Fetch the user's progress data
        const progressResponse = await progressAPI.getUserProgress();
        const progressData = progressResponse.data.progress as ProgressData;

        console.log("Fetched progress data:", progressData);

        if (progressData) {
          // Find the subject and unit in the progress data
          const subjectProgress = progressData.subjects.find(
            (s) => s.subjectId === unitData.subjectId
          );

          if (subjectProgress) {
            const unitProgress = subjectProgress.units.find(
              (u) => u.unitId === unitData.id
            );

            if (unitProgress) {
              console.log("Found unit progress:", unitProgress);

              // Update the lesson completion status based on user progress
              const updatedLessons = unitData.lessons.map(
                (lesson: Lesson, index: number) => {
                  // Consider a lesson completed if its index is less than the number of completed lessons
                  const isCompleted = index < unitProgress.lessonsCompleted;
                  return {
                    ...lesson,
                    completed: isCompleted,
                  };
                }
              );

              unitData.lessons = updatedLessons;

              // Update the completion status
              setLessonsCompletedCount(unitProgress.lessonsCompleted);
              setAllLessonsCompleted(
                unitProgress.lessonsCompleted === unitData.lessons.length
              );

              console.log(
                `Lessons completed: ${unitProgress.lessonsCompleted}/${unitData.lessons.length}`
              );
              console.log(
                `All lessons completed: ${
                  unitProgress.lessonsCompleted === unitData.lessons.length
                }`
              );
            }
          }
        }

        setUnit(unitData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch unit");
        console.error("Error fetching unit:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnit();
  }, [unitId, isAuthenticated, refreshKey]);

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async () => {
    if (!unit || !selectedLesson) return;

    try {
      console.log("Marking lesson as complete:", selectedLesson.id);

      // Update lesson status
      const response = await unitAPI.updateLessonStatus({
        unitId: unit.id,
        lessonId: selectedLesson.id,
        completed: true,
      });

      console.log("Lesson status update response:", response.data);

      // Update unit in state with the user-specific completion status
      setUnit((prev) => {
        if (!prev) return null;

        const updatedLessons = prev.lessons.map((l) =>
          l.id === selectedLesson.id ? { ...l, completed: true } : l
        );

        // Count completed lessons
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        setLessonsCompletedCount(completedCount);

        // Check if all lessons are completed
        const allCompleted = completedCount === prev.lessons.length;
        setAllLessonsCompleted(allCompleted);

        console.log(
          `Updated lessons completed: ${completedCount}/${prev.lessons.length}`
        );
        console.log(`All lessons completed: ${allCompleted}`);

        return { ...prev, lessons: updatedLessons };
      });

      // Close the lesson content modal
      setSelectedLesson(null);
    } catch (err) {
      console.error("Error updating lesson status:", err);
    }
  };

  const handleCloseLessonContent = () => {
    setSelectedLesson(null);
  };

  const handleStartQuiz = () => {
    if (unit) {
      if (quizExists && quizId) {
        navigate(`/quiz/${quizId}`, { state: { fromUnit: true } });
      } else {
        // If no quiz exists, show a message or navigate to a default quiz
        console.log("No quiz found for this unit");
        navigate(`/quiz/sample-quiz`, { state: { fromUnit: true } });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error || "Unit not found"}</span>
      </div>
    );
  }

  const lessonsCompleted = unit.lessons.filter(
    (lesson) => lesson.completed
  ).length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">{unit.title}</h1>
        <p className="mt-2 text-gray-600">{unit.description}</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-gray-600">
              {unit.totalDuration} total
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="ml-2 text-gray-600">
              {lessonsCompleted}/{unit.lessons.length} completed
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Course Content
        </h2>
        <div className="space-y-4">
          {unit.lessons.map((lesson: Lesson) => {
            const Icon =
              iconMap[
                lesson.type === "video"
                  ? "Play"
                  : lesson.type === "reading"
                  ? "FileText"
                  : lesson.type === "exercise"
                  ? "BookOpen"
                  : "CheckCircle"
              ] || CheckCircle;
            return (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  lesson.completed ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon
                    className={`h-6 w-6 ${
                      lesson.completed ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {lesson.type} • {lesson.duration}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleLessonClick(lesson)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    lesson.completed
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {lesson.completed ? "Review" : "Start"}
                </button>
              </div>
            );
          })}
        </div>

        {allLessonsCompleted && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              {quizExists ? "Take Unit Quiz" : "Take Sample Quiz"}
            </button>
          </div>
        )}

        {!allLessonsCompleted && lessonsCompletedCount > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-700 text-center">
              Complete all lessons to unlock the unit quiz.
              <span className="font-medium">
                {" "}
                {lessonsCompletedCount}/{unit.lessons.length} completed
              </span>
            </p>
          </div>
        )}
      </div>

      {selectedLesson && (
        <LessonContent
          lesson={selectedLesson}
          onClose={handleCloseLessonContent}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  );
};

export default UnitPage;
