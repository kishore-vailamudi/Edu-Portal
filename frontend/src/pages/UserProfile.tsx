import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, uploadAPI } from "../services/api";
import { User, Camera, Save, Key, X, Check } from "lucide-react";
import { getImageUrl, getInitials } from "../utils/imageUtils";

// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1024 * 1024;
// Maximum width or height in pixels for the compressed image
const MAX_IMAGE_SIZE = 800;

const UserProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    previewURL: user?.photoURL || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      // Log the user object for debugging
      console.log("UserProfile - User object:", user);

      // Initialize profile data from user object
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        previewURL: user.photoURL ? getImageUrl(user.photoURL) : "",
      });

      // Log the user's photoURL for debugging
      console.log("User photoURL:", user.photoURL);
      console.log(
        "Formatted photoURL:",
        user.photoURL ? getImageUrl(user.photoURL) : ""
      );
    }
  }, [user, navigate]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Compress image to reduce file size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_IMAGE_SIZE) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          } else if (height > MAX_IMAGE_SIZE) {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Get compressed image as data URL
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setIsCompressing(false);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          setIsCompressing(false);
          reject(new Error("Failed to load image"));
        };
      };
      reader.onerror = () => {
        setIsCompressing(false);
        reject(new Error("Failed to read file"));
      };
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Check file size before compression
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
      return;
    }

    setIsCompressing(true);
    setError("");

    try {
      // Set the file for later upload
      setSelectedFile(file);

      // Compress the image
      const compressedDataUrl = await compressImage(file);

      // For demonstration, create a path in the /uploads folder
      // In a real app, this would be handled by the backend
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const uploadPath = `/uploads/${fileName}`;

      // Update state with the compressed image and path
      setProfileData({
        ...profileData,
        previewURL: compressedDataUrl, // Use the compressed image for preview
        photoURL: uploadPath, // Store the path for the backend
      });
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process the image. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profileData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);

      // Handle file upload if a file was selected
      let photoURL = profileData.photoURL;
      if (selectedFile && profileData.previewURL) {
        try {
          console.log("Uploading profile image...");
          // Upload the compressed image to the server
          const response = await uploadAPI.uploadProfileImage(
            profileData.previewURL,
            selectedFile.name
          );

          // Get the URL of the uploaded file
          photoURL = response.data.fileUrl;
          console.log("File uploaded successfully:", photoURL);

          // Update the preview URL with the full URL
          const fullImageUrl = getImageUrl(photoURL);
          setProfileData({
            ...profileData,
            photoURL: photoURL, // Update photoURL in state
            previewURL: fullImageUrl,
          });
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          setError("Failed to upload profile picture. Please try again.");
          setLoading(false);
          return;
        }
      }

      console.log("Updating profile with photoURL:", photoURL);

      // Update user profile
      await updateProfile({
        name: profileData.name,
        photoURL,
      });

      setSuccess("Profile updated successfully");

      // Force a reload of the page to ensure the profile image is updated
      window.location.reload();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password
    if (!passwordData.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Update password
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password updated successfully");
    } catch (err: any) {
      console.error("Error updating password:", err);
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                    {/* Profile Avatar */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        {profileData.previewURL ? (
                          <img
                            src={profileData.previewURL}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                            onError={(e) => {
                              console.error(
                                "Failed to load preview image:",
                                profileData.previewURL
                              );
                              // Try a direct URL as a fallback
                              if (
                                profileData.photoURL &&
                                !profileData.previewURL.includes(
                                  "http://localhost:5000"
                                )
                              ) {
                                const directUrl = `http://localhost:5000${
                                  profileData.photoURL.startsWith("/")
                                    ? ""
                                    : "/"
                                }${profileData.photoURL}`;
                                console.log(
                                  "Trying direct URL as fallback:",
                                  directUrl
                                );
                                e.currentTarget.src = directUrl;
                              } else {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = ""; // Clear the src to show the fallback
                              }
                            }}
                          />
                        ) : user?.photoURL ? (
                          <img
                            src={getImageUrl(user.photoURL)}
                            alt="Profile"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Failed to load profile image:",
                                user.photoURL
                              );
                              // Try a direct URL as a fallback
                              if (
                                user.photoURL &&
                                !e.currentTarget.src.includes(
                                  "http://localhost:5000"
                                )
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
                              }
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                            {getInitials(user?.name || "")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-white">
                  {profileData.name || "User Profile"}
                </h1>
                <p className="text-indigo-200">{profileData.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`${
                  activeTab === "profile"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab("profile")}
              >
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </button>
              <button
                className={`${
                  activeTab === "password"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab("password")}
              >
                <Key className="h-5 w-5 mr-2" />
                Change Password
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError("")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{success}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setSuccess("")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                          {profileData.previewURL ? (
                            <img
                              src={profileData.previewURL}
                              alt="Profile preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Failed to load preview image:",
                                  profileData.previewURL
                                );
                                // Try a direct URL as a fallback
                                if (
                                  profileData.photoURL &&
                                  !profileData.previewURL.includes(
                                    "http://localhost:5000"
                                  )
                                ) {
                                  const directUrl = `http://localhost:5000${
                                    profileData.photoURL.startsWith("/")
                                      ? ""
                                      : "/"
                                  }${profileData.photoURL}`;
                                  console.log(
                                    "Trying direct URL as fallback:",
                                    directUrl
                                  );
                                  e.currentTarget.src = directUrl;
                                } else {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = ""; // Clear the src to show the fallback
                                }
                              }}
                            />
                          ) : user?.photoURL ? (
                            <img
                              src={getImageUrl(user.photoURL)}
                              alt="Profile"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Failed to load profile image:",
                                  user.photoURL
                                );
                                // Try a direct URL as a fallback
                                if (
                                  user.photoURL &&
                                  !e.currentTarget.src.includes(
                                    "http://localhost:5000"
                                  )
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
                                }
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                              {getInitials(user?.name || "")}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white hover:bg-indigo-700"
                        disabled={isCompressing}
                      >
                        {isCompressing ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Click the camera icon to upload a profile picture (max
                      5MB)
                    </p>
                    {isCompressing && (
                      <p className="mt-1 text-xs text-indigo-600">
                        Compressing image...
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                      disabled={loading || isCompressing}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
