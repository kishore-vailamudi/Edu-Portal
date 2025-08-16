import React, { useState, useEffect } from "react";
import { subjectAPI } from "../../services/api";
import { Plus, Trash, Edit, Save, X, Image, BookOpen } from "lucide-react";

interface Subject {
  _id: string;
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  iconType: string;
  color: string;
  units: number;
}

const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    iconType: "BookOpen",
    color: "bg-indigo-500",
    units: 0,
  });

  // Available colors
  const colorOptions = [
    { value: "bg-indigo-500", label: "Indigo" },
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-red-500", label: "Red" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-teal-500", label: "Teal" },
  ];

  // Available icons
  const iconOptions = [
    { value: "BookOpen", label: "Book" },
    { value: "Beaker", label: "Science" },
    { value: "Calculator", label: "Math" },
    { value: "Globe", label: "Geography" },
    { value: "History", label: "History" },
    { value: "Languages", label: "Languages" },
    { value: "Music", label: "Music" },
    { value: "Palette", label: "Art" },
  ];

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await subjectAPI.getAllSubjects();
        setSubjects(response.data.subjects);
        setError("");
      } catch (err: any) {
        console.error("Error fetching subjects:", err);
        setError(err.response?.data?.message || "Failed to fetch subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle units as a number
    if (name === "units") {
      // Ensure it's a valid number
      const numValue = value === "" ? 0 : parseInt(value);
      if (!isNaN(numValue)) {
        setFormData({
          ...formData,
          [name]: numValue,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      iconType: "BookOpen",
      color: "bg-indigo-500",
      units: 0,
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.description) {
      setError("Name and description are required");
      return;
    }

    // Ensure units is a valid number
    const units = typeof formData.units === "number" ? formData.units : 0;

    try {
      setLoading(true);

      if (editingSubject) {
        // Update existing subject
        const response = await subjectAPI.updateSubject(editingSubject.id, {
          name: formData.name,
          description: formData.description,
          iconType: formData.iconType,
          color: formData.color,
          units: units,
          imageUrl: formData.imageUrl,
        });

        setSubjects(
          subjects.map((subject) =>
            subject.id === editingSubject.id ? response.data.subject : subject
          )
        );

        setError("");
        resetForm();
      } else {
        // Create new subject
        const subjectId = formData.name.toLowerCase().replace(/\s+/g, "-");

        const response = await subjectAPI.createSubject({
          id: subjectId,
          name: formData.name,
          description: formData.description,
          iconType: formData.iconType,
          color: formData.color,
          units: units,
          imageUrl: formData.imageUrl,
        });

        setSubjects([...subjects, response.data.subject]);
        setError("");
        resetForm();
      }
    } catch (err: any) {
      console.error("Error saving subject:", err);
      setError(err.response?.data?.message || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      imageUrl: subject.imageUrl || "",
      iconType: subject.iconType || "BookOpen",
      color: subject.color || "bg-indigo-500",
      units: subject.units || 0,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (subjectId: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    try {
      setLoading(true);
      await subjectAPI.deleteSubject(subjectId);
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      setError("");
    } catch (err: any) {
      console.error("Error deleting subject:", err);
      setError(err.response?.data?.message || "Failed to delete subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Subjects</h2>
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
              Add Subject
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
            {editingSubject ? "Edit Subject" : "Add New Subject"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: URL to an image representing this subject
                </p>
              </div>

              <div>
                <label
                  htmlFor="units"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Units
                </label>
                <input
                  type="number"
                  id="units"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="1"
                  onBlur={(e) => {
                    // Ensure a valid number on blur
                    const value = e.target.value;
                    if (value === "" || isNaN(parseInt(value))) {
                      setFormData({
                        ...formData,
                        units: 0,
                      });
                    }
                  }}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="iconType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Icon
                </label>
                <select
                  id="iconType"
                  name="iconType"
                  value={formData.iconType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
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
                  required
                />
              </div>
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
                {editingSubject ? "Update Subject" : "Create Subject"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length === 0 ? (
            <div className="col-span-full bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No subjects found. Create your first subject to get started.
            </div>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                {subject.imageUrl ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={subject.imageUrl}
                      alt={subject.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, fall back to icon
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        // Find parent div and add icon
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = `h-40 ${subject.color} flex items-center justify-center`;
                          // Create icon element
                          const iconElement = document.createElement("div");
                          iconElement.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-16 w-16 text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                          parent.appendChild(iconElement);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`h-40 ${subject.color} flex items-center justify-center`}
                  >
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {subject.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {subject.units} {subject.units === 1 ? "unit" : "units"}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
