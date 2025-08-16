import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  FileText,
  Beaker,
  Globe,
  BarChart2,
  CheckCircle,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <svg
            className="absolute left-0 bottom-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Enhance Your Learning with Smart Study Recommendations
            </h1>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Get customized study materials and quizzes based on your progress.
              Learn smarter, not harder.
            </p>
            <div className="mt-8 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-6"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-6"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 bg-gray-50 overflow-hidden lg:py-16">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-2xl leading-8 font-bold tracking-tight text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 max-w-3xl mx-auto text-center text-lg text-gray-500">
              Our adaptive learning platform guides you through a personalized
              learning journey
            </p>
          </div>

          <div className="relative mt-10 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-center">
            <div className="relative">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-3">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Take a Quiz
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Complete interactive quizzes to assess your knowledge and
                  identify areas for improvement.
                </p>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-24 -translate-y-1/2">
                  <ChevronRight className="h-8 w-8 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Get Study Materials
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Receive personalized study recommendations based on your quiz
                  performance.
                </p>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-24 -translate-y-1/2">
                  <ChevronRight className="h-8 w-8 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-3">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Track Progress
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Monitor your improvement over time with detailed analytics and
                  progress reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects & Topics Section */}
      <div className="py-12 bg-white overflow-hidden lg:py-16">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-2xl leading-8 font-bold tracking-tight text-gray-900 sm:text-3xl">
              Explore Subjects & Topics
            </h2>
            <p className="mt-3 max-w-3xl mx-auto text-center text-lg text-gray-500">
              Dive into a wide range of subjects with comprehensive learning
              materials
            </p>
          </div>

          <div className="relative mt-10 lg:mt-16 lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="relative lg:col-span-1">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm overflow-hidden p-6 flex flex-col">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600 mb-3">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Mathematics</h3>
                <p className="mt-2 text-sm text-blue-100">
                  Master mathematical concepts from algebra and calculus to
                  statistics and geometry.
                </p>
                <div className="mt-3 flex-grow">
                  <ul className="space-y-1">
                    <li className="flex items-center text-blue-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Algebra & Functions</span>
                    </li>
                    <li className="flex items-center text-blue-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Calculus & Analysis</span>
                    </li>
                    <li className="flex items-center text-blue-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Statistics & Probability</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
                >
                  Explore Mathematics
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 lg:col-span-1">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm overflow-hidden p-6 flex flex-col">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-green-600 mb-3">
                  <Beaker className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Science</h3>
                <p className="mt-2 text-sm text-green-100">
                  Explore the natural world through physics, chemistry, and
                  biology.
                </p>
                <div className="mt-3 flex-grow">
                  <ul className="space-y-1">
                    <li className="flex items-center text-green-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Physics & Mechanics</span>
                    </li>
                    <li className="flex items-center text-green-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Chemistry & Reactions</span>
                    </li>
                    <li className="flex items-center text-green-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Biology & Life Sciences</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-green-600 bg-white hover:bg-green-50"
                >
                  Explore Science
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-8 lg:col-span-1">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm overflow-hidden p-6 flex flex-col">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-purple-600 mb-3">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Computer Science
                </h3>
                <p className="mt-2 text-sm text-purple-100">
                  Learn programming, algorithms, and computational thinking.
                </p>
                <div className="mt-3 flex-grow">
                  <ul className="space-y-1">
                    <li className="flex items-center text-purple-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Programming & Languages</span>
                    </li>
                    <li className="flex items-center text-purple-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Data Structures & Algorithms</span>
                    </li>
                    <li className="flex items-center text-purple-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Web Development</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-purple-600 bg-white hover:bg-purple-50"
                >
                  Explore Computer Science
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-8 lg:mt-8 lg:col-span-1">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-sm overflow-hidden p-6 flex flex-col">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-yellow-600 mb-3">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Languages & Humanities
                </h3>
                <p className="mt-2 text-sm text-yellow-100">
                  Discover literature, history, and cultural studies.
                </p>
                <div className="mt-3 flex-grow">
                  <ul className="space-y-1">
                    <li className="flex items-center text-yellow-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Literature & Composition</span>
                    </li>
                    <li className="flex items-center text-yellow-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>History & Civilization</span>
                    </li>
                    <li className="flex items-center text-yellow-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Foreign Languages</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-yellow-600 bg-white hover:bg-yellow-50"
                >
                  Explore Languages & Humanities
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-12 bg-gray-50 overflow-hidden lg:py-16">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-2xl leading-8 font-bold tracking-tight text-gray-900 sm:text-3xl">
              Why Choose Us
            </h2>
            <p className="mt-3 max-w-3xl mx-auto text-center text-lg text-gray-500">
              Our platform offers unique features designed to enhance your
              learning experience
            </p>
          </div>

          <div className="relative mt-10 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="relative">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mb-3">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Personalized Recommendations
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Our AI analyzes your performance to provide tailored study
                  materials that address your specific needs.
                </p>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mb-3">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Interactive Quizzes
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Engage with dynamic quizzes that adapt to your knowledge level
                  and learning style.
                </p>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="relative flex flex-col items-center p-5 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mb-3">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Progress Tracking
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Monitor your improvement with detailed analytics and
                  visualizations of your learning journey.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start Learning Now
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            <div className="px-5 py-2">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms & Conditions
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Support
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
          </nav>
          <p className="mt-6 text-center text-sm text-gray-400">
            &copy; 2024 EduPortal. All rights reserved.
          </p>
        </div>
      </footer>

      {/* CSS for wave animation */}
      <style>{`
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="white" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
          background-size: 1440px 80px;
        }
        .wave1 {
          animation: wave 30s linear infinite;
          z-index: 1;
          opacity: 1;
          animation-delay: 0s;
          bottom: 0;
        }
        .wave2 {
          animation: wave2 15s linear infinite;
          z-index: 0;
          opacity: 0.5;
          animation-delay: -5s;
          bottom: 10px;
        }
        @keyframes wave {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: 1440px;
          }
        }
        @keyframes wave2 {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: -1440px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
