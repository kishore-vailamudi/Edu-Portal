import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SubjectSelection from "./pages/SubjectSelection";
import SubjectUnits from "./pages/SubjectUnits";
import UnitPage from "./pages/UnitPage";
import QuizPage from "./pages/QuizPage";
import ReviewSection from "./pages/ReviewSection";
import Progress from "./pages/Progress";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./contexts/AuthContext";

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Admin route component
interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Public route that redirects to dashboard if authenticated
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Landing page - public route that redirects to dashboard if authenticated */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Routes with Navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/subjects"
                      element={
                        <ProtectedRoute>
                          <SubjectSelection />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/subject/:subjectId"
                      element={
                        <ProtectedRoute>
                          <SubjectUnits />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/unit/:unitId"
                      element={
                        <ProtectedRoute>
                          <UnitPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz/:quizId"
                      element={
                        <ProtectedRoute>
                          <QuizPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review"
                      element={
                        <ProtectedRoute>
                          <ReviewSection />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/progress"
                      element={
                        <ProtectedRoute>
                          <Progress />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
