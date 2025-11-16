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
        const coursesMap = new Map();

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const purchaseType = course.type || "";

            const hasExamAccess =
              purchaseType.toLowerCase() === "online" ||
              purchaseType.toLowerCase() === "combo";

            if (!hasExamAccess) {
              console.log(
                `Skipping - User only bought PDF (type: ${purchaseType}) for: ${course.name}`
              );
              continue;
            }

            const productId = course.productId || course.courseId;

            if (!productId) {
              console.log(`Skipping course without identifier: ${course.name}`);
              continue;
            }

            try {
              // Step 3: ALWAYS fetch the product to get slug and latest data
              let product = null;
              let slug = null;

              // Try fetching by productId first (most reliable)
              try {
                console.log(`Fetching product by ID: ${productId}`);
                const productResponse = await axios.get(
                  `/api/products/${productId}`
                );
                product = productResponse.data?.data;
                slug = product?.slug?.trim();

                console.log(`Found product: ${product?.title}, slug: ${slug}`);
              } catch (err) {
                console.error(
                  `Failed to fetch product for ID: ${productId}`,
                  err.message
                );
              }

              // If product fetch failed, try by slug as fallback (if exists)
              if (!product && course.slug?.trim()) {
                try {
                  console.log(`Trying to fetch by slug: ${course.slug}`);
                  const productResponse = await axios.get(
                    `/api/products/get-by-slug/${course.slug}`
                  );
                  product = productResponse.data?.data;
                  slug = product?.slug?.trim();
                } catch (err) {
                  console.log(`Product not found for slug: ${course.slug}`);
                }
              }

              // Skip course if we couldn't get product or slug
              if (!product || !slug) {
                console.warn(
                  `⚠️ Skipping course "${course.name}" - Product not found or missing slug (ID: ${productId})`
                );
                continue;
              }

              // Create a unique key combining productId and purchaseType
              const uniqueKey = `${productId}-${purchaseType.toLowerCase()}`;

              // Check if this specific combination already exists
              const existingCourse = coursesMap.get(uniqueKey);

              if (!existingCourse) {
                const courseData = {
                  name: product.title || course.name || "Unknown Course",
                  slug: slug,
                  productId: product._id || productId,
                  examCode: product.sapExamCode || course.code || "N/A",
                  purchaseDate: order.purchaseDate,
                  purchaseType: purchaseType,
                  category: product.category || "",
                  imageUrl: product.imageUrl || course.imageUrl || "",
                  expiryDate: course.expiryDate || order.expiryDate,
                };

                console.log(
                  `✅ Added course: ${courseData.name} with type: ${courseData.purchaseType} and slug: ${courseData.slug}`
                );
                coursesMap.set(uniqueKey, courseData);
              }
            } catch (err) {
              console.error(`Error processing course: ${course.name}`, err);
            }
          }
        }

        const coursesWithExams = Array.from(coursesMap.values());
        console.log(`Total exam courses found: ${coursesWithExams.length}`);
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
    <div className="w-full min-h-screen bg-gray-50 py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
            My Exam Courses
          </h1>

          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 text-base sm:text-lg">
                Loading your courses...
              </p>
            </div>
          ) : examCourses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
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
              <p className="text-gray-600 text-lg sm:text-xl font-semibold mb-2 px-4">
                No Exam Courses Available
              </p>
              <p className="text-gray-500 text-sm sm:text-base px-4">
                You haven't purchased any exam access yet. Only PDF purchases
                won't show here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {examCourses.map((course, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-white"
                >
                  <div className="flex flex-col space-y-4">
                    {/* Top Section: Image + Title */}
                    <div className="flex gap-3 sm:gap-4">
                      {course.imageUrl && (
                        <img
                          src={course.imageUrl}
                          alt={course.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.name}
                        </h3>

                        {/* Mobile: Show exam code prominently */}
                        <div className="sm:hidden">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium text-xs">
                            {course.examCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Badges and Info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                      {/* Purchase Date */}
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-md">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
                        <span className="hidden xs:inline">Purchased: </span>
                        {new Date(course.purchaseDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>

                      {/* Exam Code - Desktop Only */}
                      <span className="hidden sm:inline-block bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                        {course.examCode}
                      </span>

                      {/* Purchase Type */}
                      {course.purchaseType && (
                        <span
                          className={`${getPurchaseTypeBadgeColor(
                            course.purchaseType
                          )} px-2.5 sm:px-3 py-1.5 rounded-full font-medium`}
                        >
                          {getPurchaseTypeDisplay(course.purchaseType)}
                        </span>
                      )}

                      {/* Category */}
                      {course.category && (
                        <span className="bg-gray-100 text-gray-700 px-2.5 sm:px-3 py-1.5 rounded-full hidden md:inline-block">
                          {course.category}
                        </span>
                      )}

                      {/* Expiry Date */}
                      {course.expiryDate && (
                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-md">
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
                          <span className="hidden xs:inline">Expires: </span>
                          {new Date(course.expiryDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      )}
                    </div>

                    {/* Bottom Section: Button */}
                    <button
                      onClick={() => handleStartExam(course.slug)}
                      className="w-full sm:w-auto sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
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
    </div>
  );
};

export default ExamCoursesPage;
