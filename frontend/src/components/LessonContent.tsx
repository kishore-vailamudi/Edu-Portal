import React, { useState } from "react";
import { X } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration: string;
  completed: boolean;
  content: string;
}

interface LessonContentProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  onClose,
  onComplete,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(lesson.completed);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const renderVideoContent = () => {
    // Check if content is a YouTube URL
    const isYouTubeUrl =
      lesson.content.includes("youtube.com") ||
      lesson.content.includes("youtu.be");

    if (isYouTubeUrl) {
      // Extract video ID from YouTube URL
      let videoId = "";
      if (lesson.content.includes("youtube.com/watch?v=")) {
        videoId = lesson.content.split("v=")[1].split("&")[0];
      } else if (lesson.content.includes("youtu.be/")) {
        videoId = lesson.content.split("youtu.be/")[1];
      }

      return (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        </div>
      );
    } else {
      // For direct video URLs
      return (
        <video
          controls
          className="w-full rounded-lg"
          src={lesson.content}
          title={lesson.title}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  const renderPdfContent = () => {
    // Check if content is a URL or base64 encoded PDF
    if (
      lesson.content.startsWith("http") ||
      lesson.content.startsWith("data:application/pdf")
    ) {
      return (
        <div className="h-[70vh]">
          <iframe
            src={lesson.content}
            title={lesson.title}
            className="w-full h-full rounded-lg border border-gray-200"
          ></iframe>
        </div>
      );
    } else {
      // Display a message if PDF can't be displayed
      return (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p>PDF content cannot be displayed. Please download the file.</p>
          <a
            href={`data:application/pdf;base64,${lesson.content}`}
            download={`${lesson.title}.pdf`}
            className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Download PDF
          </a>
        </div>
      );
    }
  };

  const renderExerciseContent = () => {
    // Parse exercise content if it's in JSON format
    try {
      const exerciseData = JSON.parse(lesson.content);

      return (
        <div className="space-y-6">
          {exerciseData.questions &&
            exerciseData.questions.map((question: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  {index + 1}. {question.text}
                </h3>
                <div className="space-y-2">
                  {question.options &&
                    question.options.map((option: any, optIndex: number) => (
                      <div key={optIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`q${index}-opt${optIndex}`}
                          name={`question-${index}`}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`q${index}-opt${optIndex}`}
                          className="ml-2 text-gray-700"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      );
    } catch (error) {
      // If content is not JSON, display as HTML/text
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      );
    }
  };

  const renderContent = () => {
    switch (lesson.type) {
      case "video":
        return renderVideoContent();
      case "reading":
        return renderPdfContent();
      case "exercise":
        return renderExerciseContent();
      default:
        return (
          <div className="prose max-w-none">
            <p>{lesson.content}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {lesson.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">{renderContent()}</div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {lesson.type} • {lesson.duration}
          </div>
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isCompleted
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isCompleted ? "Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
