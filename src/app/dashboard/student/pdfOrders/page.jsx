"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const PdfCoursesClient = () => {
  const [pdfCourses, setPdfCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfCourses = async () => {
      try {
        // Step 1: Get user orders
        const { data } = await axios.get("/api/student/orders");
        const orders = data?.orders || [];

        if (orders.length === 0) {
          setLoading(false);
          return;
        }

        // Step 2: Extract courses and check if PDF was purchased
        const coursesMap = new Map(); // Use Map to deduplicate by productId

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const purchaseType = course.type || "";

            // IMPORTANT: Only show if user bought PDF (regular) or COMBO (not just online/exam)
            const hasPdfAccess =
              purchaseType.toLowerCase() === "regular" ||
              purchaseType.toLowerCase() === "combo";

            if (!hasPdfAccess) {
              continue;
            }

            // Use productId as the unique key
            const productId = course.productId || course.courseId;

            if (!productId) {
              continue;
            }

            // Use slug from course if available, otherwise use productId as fallback
            const slug = course.slug?.trim() || productId;

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

            // Use PDF URL from product or course
            const pdfUrl = (product?.mainPdfUrl || course.mainPdfUrl || "").trim();

            // Check if this product already exists in our map
            const existingCourse = coursesMap.get(productId);

            // Priority: combo > regular > online
            const typePriority = { combo: 3, regular: 2, online: 1 };
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
                downloadUrl: pdfUrl,
                expiryDate: course.expiryDate || order.expiryDate,
                hasPdfUrl: pdfUrl !== "",
              };

              coursesMap.set(productId, courseData);
            }
          }
        }

        // Convert Map to Array
        const coursesWithPdf = Array.from(coursesMap.values());
        setPdfCourses(coursesWithPdf);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfCourses();
  }, []);

  const handleDownload = async (url, filename) => {
    // Check if URL is valid
    if (!url || url.trim() === "") {
      toast.error("PDF is not yet available for this course. Please contact support or check back later.");
      return;
    }

    try {
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        toast.error("Invalid PDF URL. Please contact support.");
        return;
      }

      // Ensure filename has .pdf extension
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
      }

      // Show loading toast
      toast.loading("Downloading PDF...");

      // Fetch file from URL
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const blob = await res.blob();

      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(link.href);
      }, 100);

      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      toast.dismiss();
      toast.error("Failed to download PDF. Please try again or contact support.");
    }
  };

  const getPurchaseTypeDisplay = (type) => {
    const typeMap = {
      regular: "PDF Access",
      combo: "Combo (PDF + Exam)",
      online: "Exam Only",
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const getPurchaseTypeBadgeColor = (type) => {
    const colorMap = {
      regular: "bg-green-100 text-green-700",
      combo: "bg-purple-100 text-purple-700",
      online: "bg-blue-100 text-blue-700",
    };
    return colorMap[type?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
          My PDF Courses
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your courses...</p>
          </div>
        ) : pdfCourses.length === 0 ? (
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No PDF Courses Available
            </p>
            <p className="text-gray-500">
              You haven't purchased any PDF courses yet. Only Exam purchases
              won't show here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pdfCourses.map((course, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-white"
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

                        {!course.hasPdfUrl && (
                          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
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
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            PDF Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload(course.downloadUrl, course.name)
                    }
                    disabled={!course.hasPdfUrl}
                    className={`${
                      course.hasPdfUrl
                        ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed opacity-60"
                    } text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap min-w-[200px]`}
                  >
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {course.hasPdfUrl ? "Download PDF" : "PDF Not Available"}
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

export default PdfCoursesClient;