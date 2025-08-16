import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart2,
  BookMarked,
  Home,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, getInitials } from "../utils/imageUtils";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  useEffect(() => {
    // Log the user object for debugging
    console.log("Navbar - User object:", user);

    if (user?.photoURL) {
      const photoURL = user.photoURL; // Store in a constant to satisfy TypeScript
      console.log("Navbar - User photoURL:", photoURL);

      // If photoURL is a relative path, make it absolute
      if (
        photoURL &&
        !photoURL.startsWith("http") &&
        !photoURL.startsWith("data:")
      ) {
        const baseUrl = "http://localhost:5000"; // Your API base URL
        const fullUrl = `${baseUrl}${
          photoURL.startsWith("/") ? "" : "/"
        }${photoURL}`;
        console.log("Navbar - Constructed full URL:", fullUrl);
        setProfileImageUrl(fullUrl);
      } else {
        // If it's already a full URL or data URL, use it directly
        console.log("Navbar - Using photoURL directly:", photoURL);
        setProfileImageUrl(photoURL);
      }
    } else {
      console.log("Navbar - No photoURL found");
      setProfileImageUrl("");
    }
  }, [user]);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                EduPortal
              </Link>
            </div>

            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/")
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Home className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/subjects"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/subjects")
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <BookOpen className="mr-1 h-4 w-4" />
                  Subjects
                </Link>
                <Link
                  to="/review"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/review")
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <BookMarked className="mr-1 h-4 w-4" />
                  Review
                </Link>
                <Link
                  to="/progress"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/progress")
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <BarChart2 className="mr-1 h-4 w-4" />
                  Progress
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/admin")
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Settings className="mr-1 h-4 w-4" />
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="flex items-center">
                    {user?.photoURL ? (
                      <img
                        src={profileImageUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            profileImageUrl
                          );
                          // Try a direct URL as a fallback
                          if (
                            user.photoURL &&
                            !profileImageUrl.includes("http://localhost:5000")
                          ) {
                            const directUrl = `http://localhost:5000${
                              user.photoURL.startsWith("/") ? "" : "/"
                            }${user.photoURL}`;
                            console.log(
                              "Trying direct URL as fallback:",
                              directUrl
                            );
                            e.currentTarget.src = directUrl;
                          } else {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = ""; // Clear the src to show the fallback
                            // Force a re-render to show the initials
                            setProfileImageUrl("");
                          }
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {getInitials(user?.name || "User")}
                        </span>
                      </div>
                    )}
                    <span className="ml-2 text-sm text-gray-700">
                      {user?.name}
                      {user?.role === "admin" && (
                        <span className="ml-1 text-xs text-indigo-600 font-semibold">
                          (Admin)
                        </span>
                      )}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <User className="mr-1 h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
