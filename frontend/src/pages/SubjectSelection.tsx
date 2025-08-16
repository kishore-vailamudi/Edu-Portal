import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Beaker, Calculator, Globe } from "lucide-react";
import { subjectAPI } from "../services/api";

// Map for icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  BookOpen,
  Beaker,
  Calculator,
  Globe,
};

interface Subject {
  id: string;
  name: string;
  iconType: string;
  description: string;
  units: number;
  color: string;
  imageUrl?: string;
}

const SubjectSelection: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectAPI.getAllSubjects();
        setSubjects(response.data.subjects);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch subjects");
        console.error("Error fetching subjects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(
    (subject: Subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Available Subjects</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search subjects..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No subjects found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject: Subject) => {
            const Icon = iconMap[subject.iconType] || BookOpen;
            return (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {subject.imageUrl ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={subject.imageUrl}
                      alt={subject.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = `h-40 ${subject.color} flex items-center justify-center`;
                          const iconElement = document.createElement("div");
                          iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-16 w-16 text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
                          parent.appendChild(iconElement);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`h-40 ${subject.color} flex items-center justify-center`}
                  >
                    <Icon className="h-16 w-16 text-white" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {subject.units} Units
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{subject.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-500">
                        Available Now
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors duration-200">
                      Start Learning
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectSelection;
