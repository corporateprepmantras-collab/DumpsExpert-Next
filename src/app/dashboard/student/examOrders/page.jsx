"use client";
import React, { useEffect, useState } from "react";

const ExamCoursesPage = () => {
  const [examCourses, setExamCourses] = useState([
    {
      name: "SAP Certified Associate – Back-End Developer – ABAP Cloud",
      slug: "sap-abap-cloud",
      productId: "1",
      examCode: "C_ABAPD_2309",
      purchaseDate: "2025-08-11",
      purchaseType: "online",
      category: "SAP Certification",
      imageUrl: "https://via.placeholder.com/80",
      expiryDate: "2025-11-30",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleStartExam = (slug) => {
    console.log("Starting exam:", slug);
  };

  const getPurchaseTypeDisplay = (type) => {
    const typeMap = {
      online: "Exam Access",
      combo: "Combo",
      regular: "PDF Only",
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const getPurchaseTypeBadgeColor = (type) => {
    const colorMap = {
      online: "bg-blue-500 text-white",
      combo: "bg-purple-500 text-white",
      regular: "bg-gray-500 text-white",
    };
    return colorMap[type?.toLowerCase()] || "bg-green-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              PREPMANTRAS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                1
              </span>
            </div>
            <button className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Exam Courses
        </h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : examCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Exam Courses
            </h3>
            <p className="text-sm text-gray-500">
              You haven't purchased any exam access yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {examCourses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Course Card */}
                <div className="p-4">
                  {/* Header with Image and Title */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                        {course.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {course.examCode}
                        </span>
                        <span
                          className={`${getPurchaseTypeBadgeColor(
                            course.purchaseType
                          )} px-2.5 py-1 rounded-lg text-xs font-semibold`}
                        >
                          {getPurchaseTypeDisplay(course.purchaseType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-medium">Purchased</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {new Date(course.purchaseDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {course.expiryDate && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-orange-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">Expires</span>
                        </div>
                        <span className="font-semibold text-orange-700">
                          {new Date(course.expiryDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartExam(course.slug)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="text-xs font-semibold">Courses</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-medium">Progress</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCoursesPage;
