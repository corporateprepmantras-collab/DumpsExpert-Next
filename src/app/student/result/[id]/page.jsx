// app/student/result/[id]/page.jsx (NEW - for viewing saved result details)
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SavedResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/results/${params.id}`);
        if (res.data.success) {
          setResult(res.data.data);
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

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard/student/resultTracking")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to History
          </button>
          <button
            onClick={() => router.push("/dashboard/student")}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
