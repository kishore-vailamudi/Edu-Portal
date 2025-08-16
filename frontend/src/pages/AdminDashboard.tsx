import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SubjectManager from "./admin/SubjectManager";
import UnitManager from "./admin/UnitManager";
import QuizManager from "./admin/QuizManager";
import {
  BookOpen,
  BookText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("subjects");

  // Redirect if not admin
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Manage your educational content
          </p>
        </div>
        <div className="mt-4 flex-grow">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`w-full text-left px-6 py-3 flex items-center ${
              activeTab === "subjects"
                ? "bg-indigo-900 border-l-4 border-white"
                : "hover:bg-indigo-700"
            }`}
          >
            <BookText className="h-5 w-5 mr-3" />
            <span>Subjects</span>
          </button>
          <button
            onClick={() => setActiveTab("units")}
            className={`w-full text-left px-6 py-3 flex items-center ${
              activeTab === "units"
                ? "bg-indigo-900 border-l-4 border-white"
                : "hover:bg-indigo-700"
            }`}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            <span>Units & Lessons</span>
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`w-full text-left px-6 py-3 flex items-center ${
              activeTab === "quizzes"
                ? "bg-indigo-900 border-l-4 border-white"
                : "hover:bg-indigo-700"
            }`}
          >
            <GraduationCap className="h-5 w-5 mr-3" />
            <span>Quizzes</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-6 py-3 flex items-center ${
              activeTab === "users"
                ? "bg-indigo-900 border-l-4 border-white"
                : "hover:bg-indigo-700"
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-6 py-3 flex items-center ${
              activeTab === "settings"
                ? "bg-indigo-900 border-l-4 border-white"
                : "hover:bg-indigo-700"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </button>
        </div>
        <div className="border-t border-indigo-700 p-4 mt-auto">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-indigo-300">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-md text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === "subjects" && "Subject Management"}
              {activeTab === "units" && "Unit & Lesson Management"}
              {activeTab === "quizzes" && "Quiz Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "settings" && "System Settings"}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === "subjects" &&
                "Create, edit, and manage subjects for your educational platform."}
              {activeTab === "units" &&
                "Manage units and their lessons, including content like videos, readings, and exercises."}
              {activeTab === "quizzes" &&
                "Create and manage quizzes to assess student understanding."}
              {activeTab === "users" && "Manage user accounts and permissions."}
              {activeTab === "settings" &&
                "Configure system settings and preferences."}
            </p>
          </div>

          {/* Content */}
          <div>
            {activeTab === "subjects" && <SubjectManager />}
            {activeTab === "units" && <UnitManager />}
            {activeTab === "quizzes" && <QuizManager />}
            {activeTab === "users" && (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">
                  User management functionality will be implemented in a future
                  update.
                </p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">
                  Settings functionality will be implemented in a future update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
