import React, { useState, useEffect } from "react";
import { unitAPI, subjectAPI } from "../../services/api";
import { Plus, Trash, Edit, Save, X } from "lucide-react";

interface Subject {
  _id: string;
  id: string;
  name: string;
}

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration: string;
  content: string;
}

interface Unit {
  _id: string;
  id: string;
  subjectId: string;
  title: string;
  description: string;
  totalDuration: string;
  lessons: Lesson[];
}

const UnitManager: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    subjectId: "",
    title: "",
    description: "",
    totalDuration: "",
    lessons: [
      {
        id: 1,
        title: "",
        type: "video",
        duration: "",
        content: "",
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
  }, [selectedSubject]);

  // Fetch units for selected subject
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedSubject) return;

      try {
        setLoading(true);
        const response = await unitAPI.getUnitsBySubject(selectedSubject);
        setUnits(response.data.units);
        setError("");
      } catch (err: any) {
        console.error("Error fetching units:", err);
        setError(err.response?.data?.message || "Failed to fetch units");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [selectedSubject]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle lesson input changes
  const handleLessonChange = (
    lessonIndex: number,
    field: string,
    value: string
  ) => {
    const updatedLessons = [...formData.lessons];

    // Handle specific field types
    if (field === "id") {
      // Ensure id is a number
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        updatedLessons[lessonIndex] = {
          ...updatedLessons[lessonIndex],
          [field]: numValue,
        };
      }
    } else {
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        [field]: value,
      };
    }

    setFormData({
      ...formData,
      lessons: updatedLessons,
    });
  };

  // Add a new lesson
  const handleAddLesson = () => {
    // Calculate the new ID
    const newId =
      formData.lessons.length > 0
        ? Math.max(...formData.lessons.map((l) => l.id)) + 1
        : 1;

    // Ensure newId is a number
    const newLessonId = Number(newId);

    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        {
          id: newLessonId,
          title: "",
          type: "video",
          duration: "",
          content: "",
        },
      ],
    });
  };

  // Remove a lesson
  const handleRemoveLesson = (lessonIndex: number) => {
    const updatedLessons = formData.lessons.filter(
      (_, index) => index !== lessonIndex
    );
    setFormData({
      ...formData,
      lessons: updatedLessons,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subjectId: selectedSubject,
      title: "",
      description: "",
      totalDuration: "",
      lessons: [
        {
          id: 1,
          title: "",
          type: "video",
          duration: "",
          content: "",
        },
      ],
    });
    setEditingUnit(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.title ||
      !formData.subjectId ||
      formData.lessons.some((lesson) => !lesson.title || !lesson.content)
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Generate a unique ID based on the title
      const unitId = formData.title.toLowerCase().replace(/\s+/g, "-");

      // Ensure all lesson IDs are numbers
      const formattedLessons = formData.lessons.map((lesson) => ({
        ...lesson,
        id: Number(lesson.id),
      }));

      if (editingUnit) {
        // Update existing unit
        const response = await unitAPI.updateUnit(editingUnit.id, {
          title: formData.title,
          description: formData.description,
          totalDuration: formData.totalDuration,
          lessons: formattedLessons,
        });

        setUnits(
          units.map((unit) =>
            unit.id === editingUnit.id ? response.data.unit : unit
          )
        );

        setError("");
        resetForm();
      } else {
        // Create new unit
        const response = await unitAPI.createUnit({
          id: unitId,
          subjectId: formData.subjectId,
          title: formData.title,
          description: formData.description,
          totalDuration: formData.totalDuration,
          lessons: formattedLessons,
        });

        setUnits([...units, response.data.unit]);
        setError("");
        resetForm();
      }
    } catch (err: any) {
      console.error("Error saving unit:", err);
      setError(err.response?.data?.message || "Failed to save unit");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      subjectId: unit.subjectId,
      title: unit.title,
      description: unit.description,
      totalDuration: unit.totalDuration,
      lessons: unit.lessons || [],
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (unitId: string) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) {
      return;
    }

    try {
      setLoading(true);
      await unitAPI.deleteUnit(unitId);
      setUnits(units.filter((unit) => unit.id !== unitId));
      setError("");
    } catch (err: any) {
      console.error("Error deleting unit:", err);
      setError(err.response?.data?.message || "Failed to delete unit");
    } finally {
      setLoading(false);
    }
  };

  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setFormData({
      ...formData,
      subjectId: e.target.value,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Units</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUnit ? "Edit Unit" : "Add New Unit"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label
                  htmlFor="subjectId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="totalDuration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Duration
                </label>
                <input
                  type="text"
                  id="totalDuration"
                  name="totalDuration"
                  value={formData.totalDuration}
                  onChange={handleInputChange}
                  placeholder="e.g. 2 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Lessons</h4>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lesson
                </button>
              </div>

              {formData.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4 mb-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      Lesson {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={formData.lessons.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          handleLessonChange(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={lesson.type}
                        onChange={(e) =>
                          handleLessonChange(index, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="video">Video</option>
                        <option value="reading">Reading</option>
                        <option value="exercise">Exercise</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) =>
                          handleLessonChange(index, "duration", e.target.value)
                        }
                        placeholder="e.g. 15 mins"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content{" "}
                      {lesson.type === "video"
                        ? "(YouTube URL or direct video link)"
                        : lesson.type === "reading"
                        ? "(PDF URL or document link)"
                        : "(JSON or HTML content)"}
                    </label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) =>
                        handleLessonChange(index, "content", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    {lesson.type === "exercise" && (
                      <p className="text-xs text-gray-500 mt-1">
                        For exercises, use JSON format with questions and
                        options. Example: {"{"}"questions":[{"{"}
                        "text":"Question text","options":["Option 1","Option
                        2"],"correctAnswer":0{"}"}]{"}"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingUnit ? "Update Unit" : "Create Unit"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="selectedSubject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Subject
        </label>
        <select
          id="selectedSubject"
          value={selectedSubject}
          onChange={handleSubjectChange}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {loading && !showForm ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          {units.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No units found.{" "}
              {selectedSubject && "Try selecting a different subject or"} create
              a new unit.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {units.map((unit) => (
                <li key={unit.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {unit.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {unit.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {unit.lessons?.length || 0} lessons •{" "}
                        {unit.totalDuration}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitManager;
