import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";
import { unitAPI } from "../services/api";

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

const SubjectUnits: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUnits = async () => {
      if (!subjectId) return;

      try {
        console.log("Fetching units for subject:", subjectId);
        const response = await unitAPI.getUnitsBySubject(subjectId);
        console.log("Units response:", response.data);
        setUnits(response.data.units);
      } catch (err: any) {
        console.error("Error fetching units:", err);
        setError(err.response?.data?.message || "Failed to fetch units");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, [subjectId]);

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

  if (units.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No units found for this subject
        </h2>
        <p className="text-gray-500">
          There are no units available for this subject yet.
        </p>
        <Link
          to="/subjects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Units for {subjectId}
        </h1>
        <Link
          to="/subjects"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Back to Subjects
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Link
            key={unit.id}
            to={`/unit/${unit.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="ml-3 text-xl font-semibold text-gray-900">
                  {unit.title}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">{unit.description}</p>
              <div className="flex items-center text-gray-500">
                <Clock className="h-5 w-5 mr-1" />
                <span>{unit.totalDuration}</span>
                <span className="mx-2">•</span>
                <span>{unit.lessons.length} lessons</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectUnits;
