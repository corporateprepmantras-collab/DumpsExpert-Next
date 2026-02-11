"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const resolvePdfUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  if (typeof value === "object" && "url" in value) {
    const candidate = value.url;
    return typeof candidate === "string"
      ? candidate.trim()
      : String(candidate ?? "").trim();
  }
  return String(value ?? "").trim();
};

const PdfCoursesClient = () => {
  const [pdfCourses, setPdfCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  // Calculate days remaining until expiry (90 days from purchase)
  const calculateDaysRemaining = (purchaseDate) => {
    const purchase = new Date(purchaseDate);
    const expiryDate = new Date(purchase);
    expiryDate.setDate(expiryDate.getDate() + 90);

    const today = new Date();
    const timeDiff = expiryDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: Math.max(0, daysRemaining),
      expiryDate: expiryDate.toLocaleDateString("en-GB"),
      isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
      isExpired: daysRemaining <= 0,
    };
  };

  useEffect(() => {
    const fetchPdfCourses = async () => {
      try {
        const { data } = await axios.get("/api/student/orders");
        const orders = data?.orders || [];

        if (orders.length === 0) {
          setPdfCourses([]);
          setLoading(false);
          return;
        }

        const coursesMap = new Map();

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const purchaseType = course.type?.toLowerCase() || "";

            if (purchaseType !== "regular" && purchaseType !== "combo")
              continue;

            const pdfUrl = resolvePdfUrl(course.mainPdfUrl);
            if (!pdfUrl) continue;

            const expiryInfo = calculateDaysRemaining(order.purchaseDate);

            const productId = course.productId || course.courseId;

            // Create unique key combining productId and purchaseType
            const uniqueKey = `${productId}-${purchaseType}`;

            // Only add if this specific combination doesn't exist
            if (!coursesMap.has(uniqueKey)) {
              coursesMap.set(uniqueKey, {
                name: course.title || course.name || "Unknown Course",
                code: course.code || "N/A",
                purchaseDate: order.purchaseDate,
                purchaseType: purchaseType,
                category: course.category || "",
                imageUrl: course.imageUrl || "",
                downloadUrl: pdfUrl,
                ...expiryInfo,
              });
            }
          }
        }

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
    try {
      setDownloading(url);
      toast.loading("Preparing download...", { id: "download-toast" });

      const cleanFilename = filename.endsWith(".pdf")
        ? filename
        : `${filename}.pdf`;

      const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(
        url,
      )}&filename=${encodeURIComponent(cleanFilename)}`;

      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = cleanFilename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      toast.success("Download started!", { id: "download-toast" });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF. Please try again.", {
        id: "download-toast",
      });
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const getExpiryBadge = (course) => {
    if (course.isExpired) {
      return (
        <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Expired
        </span>
      );
    }

    if (course.isExpiringSoon) {
      return (
        <span className="bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">
            {course.daysRemaining} {course.daysRemaining === 1 ? "day" : "days"}{" "}
            left
          </span>
          <span className="sm:hidden">{course.daysRemaining}d</span>
        </span>
      );
    }

    return (
      <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden sm:inline">
          {course.daysRemaining} days left
        </span>
        <span className="sm:hidden">{course.daysRemaining}d</span>
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 sm:mt-10 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-900">
          My PDF Courses
        </h1>
        <p className="text-center text-gray-600 mb-6 sm:mb-8 text-xs sm:text-sm">
          PDF courses expire 90 days after purchase
        </p>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg">
              Loading your courses...
            </p>
          </div>
        ) : pdfCourses.length === 0 ? (
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 text-lg sm:text-xl font-semibold mb-2 px-4">
              No PDF Courses Available
            </p>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              You haven't purchased any PDF courses yet. Only Exam purchases
              won't show here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pdfCourses.map((course, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow ${
                  course.isExpired
                    ? "bg-gradient-to-r from-red-50 to-gray-50 border-red-200 opacity-75"
                    : course.isExpiringSoon
                      ? "bg-gradient-to-r from-orange-50 to-white border-orange-200"
                      : "bg-gradient-to-r from-green-50 to-white border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Course Info Section */}
                  <div className="flex gap-3 sm:gap-4">
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                        {course.name}
                        {course.isExpired && (
                          <span className="block sm:inline sm:ml-2 text-xs sm:text-sm text-red-600 font-normal mt-1 sm:mt-0">
                            (Access Expired)
                          </span>
                        )}
                      </h3>

                      {/* Purchase Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="hidden sm:inline">Purchased: </span>
                          {new Date(course.purchaseDate).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-medium text-xs">
                          {course.code}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium uppercase">
                          {course.purchaseType === "regular"
                            ? "PDF Access"
                            : "Combo"}
                        </span>
                      </div>

                      {/* Expiry Info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {getExpiryBadge(course)}
                        {!course.isExpired && (
                          <span className="text-xs text-gray-500">
                            <span className="hidden sm:inline">Expires: </span>
                            {course.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() =>
                      handleDownload(course.downloadUrl, `${course.name}.pdf`)
                    }
                    disabled={
                      downloading === course.downloadUrl || course.isExpired
                    }
                    className={`w-full px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                      course.isExpired
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {course.isExpired ? (
                      <>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Expired
                      </>
                    ) : downloading === course.downloadUrl ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        <span className="hidden sm:inline">Downloading...</span>
                        <span className="sm:hidden">Downloading</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
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
                        Download PDF
                      </>
                    )}
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
