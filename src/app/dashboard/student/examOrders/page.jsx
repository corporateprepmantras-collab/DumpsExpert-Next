"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ExamCoursesPage = () => {
  const [examCourses, setExamCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExamCourses = async () => {
      try {
        // Step 1: Get user orders
        const { data } = await axios.get(`/api/student/orders`);
        const orders = data?.orders || [];

        if (orders.length === 0) {
          setLoading(false);
          return;
        }

        // Step 2: Extract courses and check if EXAM was purchased
        const coursesMap = new Map(); // Use Map to deduplicate by productId

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const purchaseType = course.type || "";

            // IMPORTANT: Only show if user bought EXAM (online) or COMBO (not PDF/regular)
            // type: "regular" = PDF only
            // type: "online" = Exam only
            // type: "combo" = Both PDF + Exam
            const hasExamAccess =
              purchaseType.toLowerCase() === "online" ||
              purchaseType.toLowerCase() === "combo";

            if (!hasExamAccess) {
              console.log(
                `Skipping - User only bought PDF (type: ${purchaseType}) for: ${course.name}`
              );
              continue;
            }

            // Use productId as the unique key
            const productId = course.productId || course.courseId;

            if (!productId) {
              console.log(`Skipping course without identifier: ${course.name}`);
              continue;
            }

            // Use slug from course if available, otherwise use productId as fallback
            const slug = course.slug?.trim() || productId;

            try {
              // Step 3: Try to fetch product details if slug is valid
              let product = null;

              // Only fetch if slug looks like a proper slug (not an ID)
              if (course.slug?.trim()) {
                try {
                  const productResponse = await axios.get(
                    `/api/products/get-by-slug/${course.slug}`
                  );
                  product = productResponse.data?.data;
                } catch (err) {
                  console.log(`Product not found for slug: ${course.slug}`);
                }
              }

              // Check if this product already exists in our map
              const existingCourse = coursesMap.get(productId);

              // Priority: combo > online > regular
              const typePriority = { combo: 3, online: 2, regular: 1 };
              const currentPriority =
                typePriority[purchaseType.toLowerCase()] || 0;
              const existingPriority = existingCourse
                ? typePriority[existingCourse.purchaseType.toLowerCase()] || 0
                : 0;

              // Only add/update if this is a new course or has higher priority
              if (!existingCourse || currentPriority > existingPriority) {
                const courseData = {
                  name: product?.title || course.name || "Unknown Course",
                  slug: slug,
                  productId: product?._id || productId,
                  examCode: product?.sapExamCode || course.code || "N/A",
                  purchaseDate: order.purchaseDate,
                  purchaseType: purchaseType,
                  category: product?.category || "",
                  imageUrl: product?.imageUrl || course.imageUrl || "",
                  expiryDate: course.expiryDate || order.expiryDate,
                };

                coursesMap.set(productId, courseData);
              }
            } catch (err) {
              console.log(`Error processing course: ${course.name}`, err);
            }
          }
        }

        // Convert Map to Array
        const coursesWithExams = Array.from(coursesMap.values());
        setExamCourses(coursesWithExams);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamCourses();
  }, []);

  const handleStartExam = (slug) => {
    if (slug) {
      router.push(`/exam/mainExamPage/${slug}`);
    }
  };

  const getPurchaseTypeDisplay = (type) => {
    const typeMap = {
      online: "Exam Access",
      combo: "Combo (PDF + Exam)",
      regular: "PDF Only",
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const getPurchaseTypeBadgeColor = (type) => {
    const colorMap = {
      online: "bg-blue-100 text-blue-700",
      combo: "bg-purple-100 text-purple-700",
      regular: "bg-gray-100 text-gray-700",
    };
    return colorMap[type?.toLowerCase()] || "bg-green-100 text-green-700";
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
          My Exam Courses
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your courses...</p>
          </div>
        ) : examCourses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No Exam Courses Available
            </p>
            <p className="text-gray-500">
              You haven't purchased any exam access yet. Only PDF purchases
              won't show here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {examCourses.map((course, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {course.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
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
                          {new Date(course.purchaseDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>

                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {course.examCode}
                        </span>

                        {course.purchaseType && (
                          <span
                            className={`${getPurchaseTypeBadgeColor(
                              course.purchaseType
                            )} px-3 py-1 rounded-full text-xs font-medium`}
                          >
                            {getPurchaseTypeDisplay(course.purchaseType)}
                          </span>
                        )}

                        {course.category && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {course.category}
                          </span>
                        )}

                        {course.expiryDate && (
                          <span className="flex items-center gap-1 text-orange-600">
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
                            Expires:{" "}
                            {new Date(course.expiryDate).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(course.slug)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
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
    </div>
  );
};

export default ExamCoursesPage;