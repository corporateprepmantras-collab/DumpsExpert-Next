"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

const ExamCoursesPage = () => {
  const router = useRouter();
  const [examCourses, setExamCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamCourses = async () => {
      try {
        const { data } = await axios.get("/api/student/orders");
        const orders = data?.orders || [];

        if (orders.length === 0) {
          setExamCourses([]);
          setLoading(false);
          return;
        }

        const coursesMap = new Map();

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const purchaseType = course.type?.toLowerCase() || "";

            // Only include online and combo types
            if (purchaseType !== "online" && purchaseType !== "combo") continue;

            const productId = course.productId || course.courseId;
            const uniqueKey = `${productId}-${purchaseType}`;

            // Only add if this specific combination doesn't exist
            if (!coursesMap.has(uniqueKey)) {
              coursesMap.set(uniqueKey, {
                name: course.title || course.name || "Unknown Course",
                slug: course.slug || `course-${productId}`,
                productId: productId,
                examCode: course.code || "N/A",
                purchaseDate: order.purchaseDate,
                purchaseType: purchaseType,
                category: course.category || "Certification",
                imageUrl: course.imageUrl || "https://via.placeholder.com/80",
                expiryDate: course.expiryDate || order.expiryDate,
                isExpired: course.isExpired || false,
                duration: course.duration,
                numberOfQuestions: course.numberOfQuestions,
                passingScore: course.passingScore,
              });
            }
          }
        }

        const examCoursesArray = Array.from(coursesMap.values());
        setExamCourses(examCoursesArray);
      } catch (err) {
        console.error("Error fetching exam courses:", err);
        toast.error("Failed to fetch exam courses");
      } finally {
        setLoading(false);
      }
    };

    fetchExamCourses();
  }, []);

  const handleStartExam = (slug) => {
    console.log("Starting exam:", slug);
    router.push(`/exam/mainExamPage/${slug}`);
  };

  const getPurchaseTypeDisplay = (type) => {
    const typeMap = {
      online: "Exam Access",
      combo: "Combo",
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const getPurchaseTypeBadgeColor = (type) => {
    const colorMap = {
      online: "bg-blue-500 text-white",
      combo: "bg-purple-500 text-white",
    };
    return colorMap[type?.toLowerCase()] || "bg-green-500 text-white";
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-10">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PM
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PREPMANTRAS
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {examCourses.length}
              </span>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Exam Courses
          </h2>
          <p className="text-gray-600">
            Access your purchased exam courses and start practicing
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your courses...</p>
          </div>
        ) : examCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exam Courses
            </h3>
            <p className="text-gray-600">
              You haven't purchased any exam access yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examCourses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Course Card */}
                <div className="relative">
                  {/* Header with Image and Title */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover rounded-lg opacity-20 absolute inset-0"
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`${getPurchaseTypeBadgeColor(
                            course.purchaseType,
                          )} px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {getPurchaseTypeDisplay(course.purchaseType)}
                        </span>
                        {course.isExpired ? (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Expired
                          </span>
                        ) : isExpiringSoon(course.expiryDate) ? (
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Expiring Soon
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                      {course.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {course.examCode}
                      </span>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <span className="font-medium">Purchased</span>
                          <p className="text-gray-500">
                            {new Date(course.purchaseDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {course.expiryDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <span className="font-medium">Expires</span>
                            <p className="text-gray-500">
                              {new Date(course.expiryDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartExam(course.slug)}
                      disabled={course.isExpired}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                        course.isExpired
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white shadow-blue-500/30"
                      }`}
                    >
                      {course.isExpired ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Access Expired
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Start Exam
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCoursesPage;
