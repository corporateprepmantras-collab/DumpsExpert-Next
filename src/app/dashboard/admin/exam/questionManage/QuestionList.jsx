"use client";
// Import React and necessary hooks
import React, { useState, useEffect } from "react";
// Import Next.js router for navigation
import { useRouter } from "next/navigation";
// Import axios instance for API calls
import api from "axios";

// Helper function to truncate text for display
const truncateText = (text, wordLimit = 5) => {
  // Return empty string if no text
  if (!text) return "";
  // Remove HTML tags from text
  const cleanText = text.replace(/<[^>]+>/g, "");
  // Split text into words
  const words = cleanText.trim().split(" ");
  // Truncate if over word limit
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : words.join(" ");
};

// Main component for displaying list of questions
const QuestionList = ({ examId, questions: initialQuestions }) => {
  // Initialize router for navigation
  const router = useRouter();
  // State to manage questions list
  const [questions, setQuestions] = useState(initialQuestions || []);
  // State to manage question preview modal
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Effect to fetch questions if not provided as prop
  useEffect(() => {
    // Function to fetch questions from API
    const fetchQuestions = async () => {
      try {
        // API call to get questions by exam ID
        const { data } = await api.get(`/api/questions/byExam/${examId}`);

        // Check if response has data array
        if (data?.success && Array.isArray(data.data)) {
          // Update state with fetched questions
          setQuestions(data.data);
        } else {
          // Set empty array if no questions found
          setQuestions([]);
        }
      } catch (err) {
        // Log error and set empty array
        console.error("Failed to fetch questions", err);
        setQuestions([]);
      }
    };

    // Only fetch if initialQuestions not provided
    if (!initialQuestions) {
      fetchQuestions();
    }
  }, [examId, initialQuestions]);

  // Function to delete a question
  const deleteQuestion = async (id) => {
    // Confirm deletion with user
    if (!window.confirm("Delete this question?")) return;
    try {
      // API call to delete question
      await api.delete(`/api/questions/${id}`);
      // Update state by filtering out deleted question
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      // Log error and show alert
      console.error("Delete failed", err);
      alert("Failed to delete question");
    }
  };

  // Render component
  return (
    <div className="space-y-6">
      {/* Header section with title and add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Questions & Answers List
        </h2>
        <button
          // Navigate to add question page
          onClick={() =>
            router.push(`/dashboard/admin/exam/${examId}/questions/new`)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium shadow"
        >
          + Add Question
        </button>
      </div>

      {/* Table to display questions */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse shadow-md rounded-md overflow-hidden">
          {/* Table header */}
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-sm">
              <th className="p-3 text-left border-b">Sn.No</th>
              <th className="p-3 text-left border-b">Question Code</th>
              <th className="p-3 text-left border-b">Question</th>
              <th className="p-3 text-left border-b">Answer</th>
              <th className="p-3 text-left border-b">Sample</th>
              <th className="p-3 text-left border-b">Status</th>
              <th className="p-3 text-left border-b">Subject</th>
              <th className="p-3 text-left border-b">Topic</th>
              <th className="p-3 text-left border-b">Action</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="text-sm text-gray-800">
            {/* Check if questions exist */}
            {questions.length > 0 ? (
              // Map through questions and render each row
              questions.map((q, index) => (
                <tr
                  key={q._id}
                  className="hover:bg-gray-50 border-b transition duration-300"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{q.questionCode || "N/A"}</td>
                  <td className="p-3">
                    <div
                      // Display truncated question text
                      dangerouslySetInnerHTML={{
                        __html: truncateText(q.questionText),
                      }}
                    />
                  </td>
                  <td className="p-3">
                    {q.correctAnswers && q.correctAnswers.length > 0
                      ? q.correctAnswers.join(", ")
                      : q.matchingPairs?.correctMatches &&
                        Object.keys(q.matchingPairs.correctMatches).length > 0
                      ? Object.entries(q.matchingPairs.correctMatches)
                          .map(([left, right]) => `${left} - ${right}`)
                          .join(", ")
                      : "N/A"}
                  </td>

                  <td className="p-3">
                    {/* Display sample status */}
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      {q.isSample ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3">
                    {/* Display status with color coding */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        q.status === "publish"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.status || "draft"}
                    </span>
                  </td>
                  <td className="p-3">{q.subject || "N/A"}</td>
                  <td className="p-3">{q.topic || "N/A"}</td>
                  <td className="p-3 space-x-2">
                    {/* Edit button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/exam/${examId}/questions/${q._id}`
                        )
                      }
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => deleteQuestion(q._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                    {/* Preview button */}
                    <button
                      onClick={() => setPreviewQuestion(q)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Display message if no questions found
              <tr>
                <td colSpan="9" className="p-3 text-center text-gray-500">
                  No questions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for question preview */}

      {previewQuestion && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg max-w-4xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setPreviewQuestion(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Question Preview
            </h3>

            {/* Question text section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Question:
              </label>
              <div
                className="prose prose-sm max-w-none border p-3 rounded"
                dangerouslySetInnerHTML={{
                  __html: previewQuestion.questionText,
                }}
              />
              {previewQuestion.questionImage && (
                <img
                  src={previewQuestion.questionImage}
                  alt="Question"
                  className="mt-3 max-h-40 rounded border"
                />
              )}
            </div>

            {/* Check question type and render accordingly */}
            {previewQuestion.questionType === "matching" ? (
              // Matching type question display
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Matching Pairs:
                </label>

                {/* Left and Right columns */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">
                      Column A
                    </h4>
                    <div className="space-y-3">
                      {previewQuestion.matchingPairs?.leftItems?.map(
                        (item, index) => (
                          <div
                            key={item.id || index}
                            className="border p-3 rounded bg-gray-50"
                          >
                            <div className="font-medium text-sm text-gray-600">
                              {item.id}
                            </div>
                            <div
                              className="mt-1 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: item.text }}
                            />
                            {item.image && (
                              <img
                                src={item.image}
                                alt={`Left ${item.id}`}
                                className="mt-2 max-h-24 border rounded"
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">
                      Column B
                    </h4>
                    <div className="space-y-3">
                      {previewQuestion.matchingPairs?.rightItems?.map(
                        (item, index) => (
                          <div
                            key={item.id || index}
                            className="border p-3 rounded bg-gray-50"
                          >
                            <div className="font-medium text-sm text-gray-600">
                              {item.id}
                            </div>
                            <div
                              className="mt-1 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: item.text }}
                            />
                            {item.image && (
                              <img
                                src={item.image}
                                alt={`Right ${item.id}`}
                                className="mt-2 max-h-24 border rounded"
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Correct Matches */}
                {previewQuestion.matchingPairs?.correctMatches &&
                  Object.keys(previewQuestion.matchingPairs.correctMatches)
                    .length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Correct Matches:
                      </label>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(
                            previewQuestion.matchingPairs.correctMatches
                          ).map(([leftId, rightId]) => {
                            const leftItem =
                              previewQuestion.matchingPairs.leftItems?.find(
                                (item) => item.id === leftId
                              );
                            const rightItem =
                              previewQuestion.matchingPairs.rightItems?.find(
                                (item) => item.id === rightId
                              );

                            return (
                              <div
                                key={leftId}
                                className="flex items-center gap-3 text-sm"
                              >
                                <div className="flex-1 bg-white p-2 rounded border">
                                  <span className="font-medium">{leftId}:</span>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: leftItem?.text || "N/A",
                                    }}
                                  />
                                </div>
                                <div className="text-green-600 font-bold">
                                  →
                                </div>
                                <div className="flex-1 bg-white p-2 rounded border">
                                  <span className="font-medium">
                                    {rightId}:
                                  </span>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: rightItem?.text || "N/A",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              // MCQ type question display (original code)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewQuestion.options?.map((opt, i) => (
                  <div
                    key={i}
                    className={`border p-3 rounded ${
                      previewQuestion.correctAnswers?.includes(opt.label)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <strong className="text-sm">Option {opt.label}:</strong>
                    <div
                      className="mt-1 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: opt.text }}
                    />
                    {opt.image && (
                      <img
                        src={opt.image}
                        alt={`Option ${opt.label}`}
                        className="mt-2 max-h-32 border rounded"
                      />
                    )}
                    {previewQuestion.correctAnswers?.includes(opt.label) && (
                      <div className="text-green-600 text-sm font-medium mt-2">
                        ✓ Correct Answer
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation section */}
            {previewQuestion.explanation && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Explanation:
                </label>
                <div
                  className="prose prose-sm max-w-none border p-3 rounded"
                  dangerouslySetInnerHTML={{
                    __html: previewQuestion.explanation,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export component
export default QuestionList;
