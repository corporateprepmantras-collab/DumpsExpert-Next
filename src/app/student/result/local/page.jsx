// app/student/result/local/page.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LocalResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const correct = parseInt(searchParams.get("correct")) || 0;
    const total = parseInt(searchParams.get("total")) || 0;
    const attempted = parseInt(searchParams.get("attempted")) || 0;
    const wrong = attempted - correct;
    const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;

    setResult({
      correct,
      total,
      attempted,
      wrong,
      percentage,
      isLocal: true,
    });
  }, [searchParams]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p>Loading result...</p>
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
    return percentage >= 60 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Results
          </h1>
          <p className="text-gray-600">
            {result.isLocal ? "Practice Test Completed" : "Exam Completed"}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Score
              </h2>
              <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPassColor(result.percentage)}`}>
                {getPassStatus(result.percentage)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-blue-800">Total Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.attempted}</div>
                <div className="text-sm text-green-800">Attempted</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{result.correct}</div>
                <div className="text-sm text-emerald-800">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.wrong}</div>
                <div className="text-sm text-red-800">Wrong</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold">
                  {result.attempted > 0 ? ((result.correct / result.attempted) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {((result.attempted / result.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">
                  {result.correct}/{result.total}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommendations
            </h3>
            <div className="space-y-2">
              {result.percentage >= 80 ? (
                <>
                  <p className="text-green-600">🎉 Excellent performance!</p>
                  <p className="text-sm text-gray-600">
                    You have a strong understanding of the material.
                  </p>
                </>
              ) : result.percentage >= 60 ? (
                <>
                  <p className="text-yellow-600">👍 Good effort!</p>
                  <p className="text-sm text-gray-600">
                    Review the questions you got wrong to improve your score.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-red-600">📚 Needs improvement</p>
                  <p className="text-sm text-gray-600">
                    Focus on understanding the concepts and practice more.
                  </p>
                </>
              )}
              {result.attempted < result.total && (
                <p className="text-sm text-orange-600">
                  ⚡ Try to attempt all questions next time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard/student")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Test
          </button>
          {result.isLocal && (
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Note for Local Results */}
        {result.isLocal && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 This is a practice test result. For official records, please log in and take the exam again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}