import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  Zap,
  BookMarked,
  User,
  ArrowUpRight,
  Layers,
  PieChart,
} from "lucide-react";
import { progressAPI, subjectAPI, unitAPI, quizAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import AIAssistant from "../components/AIAssistant";

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

interface Subject {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
}

// Progress bar component
const ProgressBar: React.FC<{ value: number; color: string }> = ({
  value,
  color,
}) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  );
};

// Stat card component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
}> = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        {trend && (
          <div className="flex items-center">
            <span
              className={`text-xs font-medium ${
                trend.value >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
            <ArrowUpRight
              className={`h-3 w-3 ml-1 ${
                trend.value >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

// Subject card component
const SubjectCard: React.FC<{
  subject: Subject;
  progress?: SubjectProgress;
}> = ({ subject, progress }) => {
  const progressPercent = progress
    ? Math.round(
        (progress.unitsCompleted / Math.max(1, progress.totalUnits)) * 100
      )
    : 0;

  return (
    <Link
      to={`/subject/${subject.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div
        className="h-32 bg-cover bg-center"
        style={{
          backgroundImage: subject.imageUrl
            ? `url(${subject.imageUrl})`
            : `linear-gradient(to right, rgb(${Math.floor(
                Math.random() * 100 + 100
              )}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
                Math.random() * 100 + 100
              )}), rgb(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
                Math.random() * 100 + 100
              )}, ${Math.floor(Math.random() * 100 + 100)}))`,
        }}
      ></div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {subject.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {subject.description || "Explore this subject to learn more"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <ProgressBar
              value={progressPercent}
              color={
                progressPercent >= 75
                  ? "bg-green-500"
                  : progressPercent >= 50
                  ? "bg-blue-500"
                  : progressPercent >= 25
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {progressPercent}%
          </span>
        </div>
      </div>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch progress data
        const progressResponse = await progressAPI.getUserProgress();
        const progressData = progressResponse.data.progress;
        setProgress(progressData);

        // Fetch subjects
        const subjectsResponse = await subjectAPI.getAllSubjects();
        setSubjects(subjectsResponse.data.subjects || []);

        // Fetch units for the first subject if available
        if (subjectsResponse.data.subjects.length > 0) {
          const firstSubject = subjectsResponse.data.subjects[0];
          const unitsResponse = await unitAPI.getUnitsBySubject(
            firstSubject.id
          );
          setUnits(unitsResponse.data.units || []);
        }

        // Generate recent activity from progress data
        if (progressData && progressData.subjects) {
          const activities = [];

          // Add unit progress activities
          for (const subject of progressData.subjects) {
            for (const unit of subject.units || []) {
              if (unit.lastAccessed) {
                activities.push({
                  title: `Worked on ${subject.subjectId} - Unit ${unit.unitId}`,
                  time: new Date(unit.lastAccessed).toLocaleDateString(),
                  type: unit.completed ? "completion" : "start",
                  unitId: unit.unitId,
                  subjectId: subject.subjectId,
                });
              }
            }
          }

          // Sort by date (most recent first) and take top 5
          activities.sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setRecentActivity(activities.slice(0, 5));
        }

        // Generate recommendations based on progress
        if (progressData && progressData.subjects && subjects.length > 0) {
          const recs = [];

          // Find incomplete units
          for (const subject of progressData.subjects) {
            const subjectName = subjects.find(
              (s) => s.id === subject.subjectId
            )?.name;

            if (!subjectName) continue;

            for (const unit of subject.units || []) {
              if (!unit.completed) {
                recs.push({
                  title: `Continue ${subjectName} - Unit ${unit.unitId}`,
                  description:
                    "You've started this unit but haven't completed it yet.",
                  type: "continue",
                  unitId: unit.unitId,
                  subjectId: subject.subjectId,
                });
              } else if (unit.quizScore < 70) {
                recs.push({
                  title: `Review ${subjectName} - Unit ${unit.unitId}`,
                  description: `Your quiz score was ${unit.quizScore}%. Try again to improve.`,
                  type: "review",
                  unitId: unit.unitId,
                  subjectId: subject.subjectId,
                });
              }
            }
          }

          // Sort by type (continue first, then review)
          recs.sort((a, b) => {
            if (a.type === "continue" && b.type !== "continue") return -1;
            if (a.type !== "continue" && b.type === "continue") return 1;
            return 0;
          });

          setRecommendations(recs.slice(0, 3));
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Format time spent in hours and minutes
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!progress || !progress.subjects || progress.subjects.length === 0) {
      return 0;
    }

    let totalUnits = 0;
    let completedUnits = 0;

    for (const subject of progress.subjects) {
      totalUnits += subject.totalUnits;
      completedUnits += subject.unitsCompleted;
    }

    return totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl shadow-md p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="mt-1 text-indigo-100 max-w-2xl">
              {calculateCompletion() < 10
                ? "You're just getting started! Let's begin your learning journey."
                : calculateCompletion() < 50
                ? "You're making good progress. Keep up the great work!"
                : calculateCompletion() < 80
                ? "You're doing fantastic! You're well on your way to mastery."
                : "Impressive progress! You're almost at complete mastery."}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/subjects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
            >
              Explore Subjects
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completion Rate"
          value={`${calculateCompletion()}%`}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-green-100 text-green-600"
          trend={{ value: 5, label: "this week" }}
        />
        <StatCard
          title="Quizzes Taken"
          value={progress?.totalQuizzesTaken || 0}
          icon={<BookMarked className="h-6 w-6 text-white" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Average Score"
          value={`${Math.round(progress?.averageScore || 0)}%`}
          icon={<Award className="h-6 w-6 text-white" />}
          color="bg-purple-100 text-purple-600"
          trend={
            progress?.averageScore
              ? { value: 3, label: "improvement" }
              : undefined
          }
        />
        <StatCard
          title="Time Spent"
          value={formatTimeSpent(progress?.totalTimeSpent || 0)}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Progress section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Learning Progress
              </h2>
              <Link
                to="/progress"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {progress && progress.subjects && progress.subjects.length > 0 ? (
              <div className="space-y-6">
                {/* Overall progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Overall Completion
                    </h3>
                    <span className="text-sm font-medium text-gray-700">
                      {calculateCompletion()}%
                    </span>
                  </div>
                  <ProgressBar
                    value={calculateCompletion()}
                    color={
                      calculateCompletion() >= 75
                        ? "bg-green-500"
                        : calculateCompletion() >= 50
                        ? "bg-blue-500"
                        : calculateCompletion() >= 25
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  />
                </div>

                {/* Top subjects progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Subject Progress
                  </h3>
                  <div className="space-y-4">
                    {progress.subjects.slice(0, 3).map((subject) => {
                      const subjectName =
                        subjects.find((s) => s.id === subject.subjectId)
                          ?.name || subject.subjectId;

                      const progressPercent = Math.round(
                        (subject.unitsCompleted /
                          Math.max(1, subject.totalUnits)) *
                          100
                      );

                      return (
                        <div key={subject.subjectId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800">
                              {subjectName}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {subject.unitsCompleted}/{subject.totalUnits}{" "}
                              units
                            </span>
                          </div>
                          <ProgressBar
                            value={progressPercent}
                            color={
                              progressPercent >= 75
                                ? "bg-green-500"
                                : progressPercent >= 50
                                ? "bg-blue-500"
                                : progressPercent >= 25
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent quiz scores */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Recent Quiz Scores
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {progress.subjects
                      .flatMap((subject) =>
                        subject.units
                          .filter((unit) => unit.quizScore > 0)
                          .slice(0, 2)
                          .map((unit) => ({
                            subjectId: subject.subjectId,
                            subjectName:
                              subjects.find((s) => s.id === subject.subjectId)
                                ?.name || subject.subjectId,
                            unitId: unit.unitId,
                            score: unit.quizScore,
                          }))
                      )
                      .slice(0, 4)
                      .map((quiz, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">
                                {quiz.subjectName}
                              </h4>
                              <p className="text-xs text-gray-600">
                                Unit {quiz.unitId}
                              </p>
                            </div>
                            <div
                              className={`text-sm font-bold rounded-full h-10 w-10 flex items-center justify-center ${
                                quiz.score >= 80
                                  ? "bg-green-100 text-green-800"
                                  : quiz.score >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {quiz.score}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  No progress data available yet.
                </p>
                <Link
                  to="/subjects"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Learning
                </Link>
              </div>
            )}
          </div>

          {/* Popular Subjects section - moved to left column */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
              Popular Subjects
            </h2>

            <div className="space-y-3">
              {subjects.slice(0, 3).map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-md bg-cover bg-center"
                    style={{
                      backgroundImage: subject.imageUrl
                        ? `url(${subject.imageUrl})`
                        : `linear-gradient(to right, rgb(${Math.floor(
                            Math.random() * 100 + 100
                          )}, ${Math.floor(
                            Math.random() * 100 + 100
                          )}, ${Math.floor(
                            Math.random() * 100 + 100
                          )}), rgb(${Math.floor(
                            Math.random() * 100 + 100
                          )}, ${Math.floor(
                            Math.random() * 100 + 100
                          )}, ${Math.floor(Math.random() * 100 + 100)}))`,
                    }}
                  ></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {subject.description ||
                        "Explore this subject to learn more"}
                    </p>
                  </div>
                </Link>
              ))}

              {subjects.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No subjects available yet.
                  </p>
                </div>
              )}

              {subjects.length > 0 && (
                <div className="text-center mt-4">
                  <Link
                    to="/subjects"
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    View All Subjects
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-8">
          {/* Recommendations section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended for You
            </h2>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <Link
                    key={index}
                    to={`/unit/${rec.unitId}`}
                    className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {rec.type === "continue" ? (
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        ) : rec.type === "review" ? (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Target className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {rec.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Target className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Complete more lessons to get personalized recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent activity section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              Recent Activity
            </h2>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <Link
                    key={index}
                    to={`/unit/${activity.unitId}`}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === "start" ? (
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      ) : activity.type === "completion" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No recent activity found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default Dashboard;
