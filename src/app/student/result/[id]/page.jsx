// app/student/result/[id]/page.jsx - FIXED with proper question display
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SavedResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
const fetchResult = async () => {
  try {
    const res = await axios.get(`/api/results/${params.id}`);
    if (res.data.success) {
      const rawResult = res.data.data;

      // Process questions to ensure each has isCorrect and consistent structure
      const processedQuestions = (rawResult.questions || []).map((q) => {
        let isCorrect = false;

        if (q.questionType === "matching") {
          // Compare both objects (correctAnswer vs selectedAnswer)
          const correct = JSON.stringify(q.correctAnswer || {});
          const selected = JSON.stringify(q.selectedAnswer || {});
          isCorrect = correct === selected;
        } else if (q.questionType === "checkbox") {
          const correctAnswers = q.correctAnswer || [];
          const selectedAnswers = q.selectedAnswer || [];
          isCorrect =
            correctAnswers.length === selectedAnswers.length &&
            correctAnswers.every((ans) => selectedAnswers.includes(ans));
        } else {
          // Single choice / radio
          isCorrect = q.correctAnswer === q.selectedAnswer;
        }

        return {
          ...q,
          isCorrect,
        };
      });

      setResult({
        ...rawResult,
        questions: processedQuestions,
      });
    } else {
      console.error("Failed to fetch result:", res.data.message);
    }
  } catch (error) {
    console.error("Error fetching result:", error);
  } finally {
    setLoading(false);
  }
};


    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p>Loading result details...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen mt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Result Not Found</h2>
          <p className="mt-2">The requested result could not be found.</p>
          <button
            onClick={() => router.push("/dashboard/student/resultTracking")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPassStatus = (percentage) => {
    return percentage >= 60 ? "PASS" : "FAIL";
  };

  const getPassColor = (percentage) => {
    return percentage >= 60
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Filter questions based on selected filter
  const filteredQuestions = result.questions?.filter((q) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "correct") return q.isCorrect;
    if (filterStatus === "wrong") return !q.isCorrect && q.selectedAnswer !== null && q.selectedAnswer !== undefined;
    if (filterStatus === "unattempted") return q.selectedAnswer === null || q.selectedAnswer === undefined || q.selectedAnswer === "";
    return true;
  }) || [];

  // Render answer based on question type
  const renderAnswer = (question) => {
 if (question.questionType === "matching") {
  const correctPairs = question.correctAnswer || {};
  const selectedPairs = question.selectedAnswer || {};

  const allKeys = Object.keys(correctPairs);

  return (
    <div className="space-y-2 mt-2">
      {allKeys.map((key, idx) => {
        const selected = selectedPairs[key];
        const correct = correctPairs[key];
        const isCorrect = selected === correct;

        return (
          <div
            key={idx}
            className={`flex justify-between items-center px-3 py-2 rounded-md border ${
              isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}
          >
            <span className="font-medium text-gray-700">{key}</span>
            <span className="text-gray-600">→</span>
            <span className="font-semibold text-gray-800">{selected || "—"}</span>

            {!isCorrect && (
              <span className="text-sm text-gray-500 ml-2">
                (Correct: <b>{correct}</b>)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}


    if (question.questionType === "checkbox") {
      const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      const selectedAnswers = Array.isArray(question.selectedAnswer) ? question.selectedAnswer : [];

      return (
        <div className="space-y-3 mt-4">
          {question.options?.map((opt) => {
            const isCorrect = correctAnswers.includes(opt.label);
            const isSelected = selectedAnswers.includes(opt.label);
            
            let bgColor = "bg-white border-gray-300";
            let icon = "";
            let textColor = "text-gray-800";
            
            if (isCorrect && isSelected) {
              bgColor = "bg-green-50 border-green-400";
              icon = "✓✓";
              textColor = "text-green-800";
            } else if (isCorrect && !isSelected) {
              bgColor = "bg-yellow-50 border-yellow-400";
              icon = "✓";
              textColor = "text-yellow-800";
            } else if (!isCorrect && isSelected) {
              bgColor = "bg-red-50 border-red-400";
              icon = "✗";
              textColor = "text-red-800";
            }

            return (
              <div key={opt.label} className={`p-4 rounded-lg border-2 ${bgColor}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  {icon && (
                    <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
                  )}
                  
                  {/* Option Content */}
                  <div className="flex-1">
                    <div className={`font-semibold ${textColor}`}>
                      <span className="inline-block w-8">{opt.label}.</span>
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </div>
                    {opt.image && (
                      <img src={opt.image} alt={opt.label} className="mt-2 max-h-32 rounded border" />
                    )}
                  </div>

                  {/* Status Label */}
                  <div className="text-xs font-semibold">
                    {isCorrect && isSelected && <span className="text-green-600">Correct & Selected</span>}
                    {isCorrect && !isSelected && <span className="text-yellow-600">Correct (Missed)</span>}
                    {!isCorrect && isSelected && <span className="text-red-600">Wrong Selection</span>}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Correct Answers: </span>
                <span className="font-semibold text-green-600">{correctAnswers.join(", ") || "None"}</span>
              </div>
              <div>
                <span className="text-gray-600">Your Answers: </span>
                <span className={`font-semibold ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedAnswers.length > 0 ? selectedAnswers.join(", ") : "Not answered"}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Single choice (MCQ/Radio)
    return (
      <div className="space-y-3 mt-4">
        {question.options?.map((opt) => {
          const isCorrect = opt.label === question.correctAnswer;
          const isSelected = opt.label === question.selectedAnswer;
          
          let bgColor = "bg-white border-gray-300";
          let borderWidth = "border";
          let icon = "";
          let textColor = "text-gray-800";
          
          if (isCorrect) {
            bgColor = "bg-green-50 border-green-400";
            borderWidth = "border-2";
            icon = "✓";
            textColor = "text-green-800";
          }
          if (isSelected && !isCorrect) {
            bgColor = "bg-red-50 border-red-400";
            borderWidth = "border-2";
            icon = "✗";
            textColor = "text-red-800";
          }

          return (
            <div key={opt.label} className={`p-4 rounded-lg ${borderWidth} ${bgColor}`}>
              <div className="flex items-start gap-3">
                {/* Icon */}
                {icon && (
                  <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
                )}
                {isSelected && !icon && (
                  <span className="text-xl font-bold text-blue-600">→</span>
                )}
                
                {/* Option Content */}
                <div className="flex-1">
                  <div className={`font-semibold ${textColor}`}>
                    <span className="inline-block w-8">{opt.label}.</span>
                    <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                  </div>
                  {opt.image && (
                    <img src={opt.image} alt={opt.label} className="mt-2 max-h-32 rounded border" />
                  )}
                </div>

                {/* Status Label */}
                {isCorrect && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-green-600 text-white">
                    Correct Answer
                  </span>
                )}
                {isSelected && !isCorrect && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white">
                    Your Answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Correct Answer: </span>
              <span className="font-semibold text-green-600">{question.correctAnswer || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Your Answer: </span>
              <span className={`font-semibold ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {question.selectedAnswer || "Not answered"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Result Details
          </h1>
          <p className="text-gray-600">
            Attempt #{result.attempt} - {result.examCode}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Score
              </h2>
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  result.percentage
                )}`}
              >
                {result.percentage}%
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPassColor(
                  result.percentage
                )}`}
              >
                {getPassStatus(result.percentage)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.totalQuestions}
                </div>
                <div className="text-sm text-blue-800">Total Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.attempted}
                </div>
                <div className="text-sm text-green-800">Attempted</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {result.correct}
                </div>
                <div className="text-sm text-emerald-800">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.wrong}
                </div>
                <div className="text-sm text-red-800">Wrong</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Exam Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Exam Code</span>
                <span className="font-semibold">{result.examCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attempt Number</span>
                <span className="font-semibold">{result.attempt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Date</span>
                <span className="font-semibold">
                  {new Date(
                    result.completedAt || result.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Taken</span>
                <span className="font-semibold">
                  {Math.floor(result.duration / 60)}m {result.duration % 60}s
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold">
                  {result.attempted > 0
                    ? ((result.correct / result.attempted) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {((result.attempted / result.totalQuestions) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">
                  {result.correct}/{result.totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Question-wise Analysis
            </h3>
            <button
              onClick={() => setShowQuestions(!showQuestions)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showQuestions ? "Hide Questions" : "Show Detailed Analysis"}
            </button>
          </div>

          {showQuestions && (
            <>
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  All ({result.questions?.length || 0})
                </button>
                <button
                  onClick={() => setFilterStatus("correct")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "correct" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  ✓ Correct ({result.questions?.filter(q => q.isCorrect).length || 0})
                </button>
                <button
                  onClick={() => setFilterStatus("wrong")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "wrong" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  ✗ Wrong ({result.questions?.filter(q => !q.isCorrect && q.selectedAnswer).length || 0})
                </button>
                <button
                  onClick={() => setFilterStatus("unattempted")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "unattempted" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  ○ Unattempted ({result.questions?.filter(q => !q.selectedAnswer).length || 0})
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question, index) => (
                    <div key={question.questionId || index} className={`p-6 rounded-lg border-2 ${question.isCorrect ? 'border-green-300 bg-green-50' : (question.selectedAnswer ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50')}`}>
                      {/* Question Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${question.isCorrect ? 'bg-green-500' : (question.selectedAnswer ? 'bg-red-500' : 'bg-gray-500')}`}>
                          {result.questions?.indexOf(question) + 1}   
                        </span>
                        <span className="text-gray-800">{result.questions?.[index]?.question}</span>

                        <div className="flex-1">
                          <div className="text-lg font-semibold text-gray-900 mb-3" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                          {question.questionImage && (
                            <img src={question.questionImage} alt="Question" className="max-h-64 rounded border mb-3 shadow-sm" />
                          )}
                        </div>
                        <span className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${question.isCorrect ? 'bg-green-600 text-white' : (question.selectedAnswer ? 'bg-red-600 text-white' : 'bg-gray-600 text-white')}`}>
                          {question.isCorrect ? '✓ Correct' : (question.selectedAnswer ? '✗ Wrong' : '○ Unattempted')}
                        </span>
                      </div>

                      {/* Answer Options */}
                      {renderAnswer(question)}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600 text-xl">💡</span>
                            <div>
                              <div className="font-semibold text-blue-900 mb-1">Explanation:</div>
                              <div className="text-blue-800 text-sm">{question.explanation}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No questions found for this filter.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard/student/resultTracking")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to History
          </button>
          <button
            onClick={() => router.push("/dashboard/student")}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}