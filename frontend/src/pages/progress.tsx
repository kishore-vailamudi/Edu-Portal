import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, Award, BookOpen, BarChart2 } from "lucide-react";
import { progressAPI } from "../services/api";

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

const Progress: React.FC = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await progressAPI.getUserProgress();
        setProgress(response.data.progress);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch progress data"
        );
        console.error("Error fetching progress:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">
          {error || "Progress data not found"}
        </span>
      </div>
    );
  }

  // Calculate overall progress percentage
  const totalUnits = progress.subjects
    .filter((subject) => subject && subject.totalUnits)
    .reduce((sum, subject) => sum + (subject.totalUnits || 0), 0);

  const completedUnits = progress.subjects
    .filter((subject) => subject && subject.unitsCompleted)
    .reduce((sum, subject) => sum + (subject.unitsCompleted || 0), 0);

  const overallProgress =
    totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Learning Progress
        </h1>
        <p className="mt-2 text-gray-600">
          Track your achievements and progress across all subjects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
              <p className="text-2xl font-bold text-blue-600">
                {progress.subjects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Completed Units
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {completedUnits} / {totalUnits}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Average Score
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {progress.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Time Spent
              </h3>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.floor(progress.totalTimeSpent / 60)}h{" "}
                {progress.totalTimeSpent % 60}m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Overall Progress
          </h2>
          <span className="text-lg font-bold text-indigo-600">
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-indigo-600 h-4 rounded-full"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subject Progress
        </h2>
        <div className="space-y-6">
          {progress.subjects
            .filter((subject) => subject && subject.subjectId)
            .map((subject: SubjectProgress, index: number) => {
              const subjectProgress =
                subject.totalUnits > 0
                  ? (subject.unitsCompleted / subject.totalUnits) * 100
                  : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Subject {subject.subjectId || "Unknown"}
                    </h3>
                    <span className="text-sm font-medium text-indigo-600">
                      {subjectProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${subjectProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {subject.unitsCompleted || 0} / {subject.totalUnits || 0}{" "}
                      units completed
                    </span>
                    <span>
                      Last accessed:{" "}
                      {subject.lastAccessed
                        ? new Date(subject.lastAccessed).toLocaleDateString()
                        : "Never accessed"}
                    </span>
                  </div>
                </div>
              );
            })}

          {progress.subjects.filter((subject) => subject && subject.subjectId)
            .length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No subjects found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {progress.subjects
            .flatMap((subject) => subject.units || [])
            .filter((unit) => unit && unit.unitId)
            .sort(
              (a, b) =>
                new Date(b.lastAccessed || 0).getTime() -
                new Date(a.lastAccessed || 0).getTime()
            )
            .slice(0, 5)
            .map((unit: UnitProgress, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <BarChart2 className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Unit {unit.unitId || "Unknown"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {unit.lessonsCompleted || 0} / {unit.totalLessons || 0}{" "}
                      lessons completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-indigo-600">
                    {unit.quizScore
                      ? `${unit.quizScore.toFixed(1)}%`
                      : "No quiz taken"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {unit.lastAccessed
                      ? new Date(unit.lastAccessed).toLocaleDateString()
                      : "Never accessed"}
                  </p>
                </div>
              </div>
            ))}

          {progress.subjects
            .flatMap((subject) => subject.units || [])
            .filter((unit) => unit && unit.unitId).length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
