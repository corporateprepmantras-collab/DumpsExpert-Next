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
        const coursesWithPdf = [];

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            const slug = course.slug;
            const purchaseType = course.type || "";

            // Skip if no slug
            if (!slug || slug.trim() === "") {
              console.log(`Skipping course without slug: ${course.name}`);
              continue;
            }

            // IMPORTANT: Only show if user bought PDF (regular) or COMBO (not just online/exam)
            // type: "regular" = PDF only
            // type: "online" = Exam only
            // type: "combo" = Both PDF + Exam
            const hasPdfAccess =
              purchaseType.toLowerCase() === "regular" ||
              purchaseType.toLowerCase() === "combo";

            if (!hasPdfAccess) {
              console.log(
                `Skipping - User only bought Exam (type: ${purchaseType}) for: ${course.name}`
              );
              continue;
            }

            try {
              // Step 3: Check if product exists and get PDF URL
              const productResponse = await axios.get(
                `/api/products/get-by-slug/${slug}`
              );

              if (productResponse.data?.data) {
                const product = productResponse.data.data;

                // Only add if mainPdfUrl exists
                if (product.mainPdfUrl && product.mainPdfUrl.trim() !== "") {
                  coursesWithPdf.push({
                    name: product.title || course.name || "Unknown Course",
                    slug: slug,
                    productId: product._id,
                    examCode: product.sapExamCode || course.code || "N/A",
                    purchaseDate: order.purchaseDate,
                    purchaseType: purchaseType,
                    category: product.category || "",
                    imageUrl: product.imageUrl || "",
                    downloadUrl: product.mainPdfUrl,
                  });
                } else {
                  console.warn(`⚠️ No PDF URL found for: ${product.title}`);
                }
              }
            } catch (err) {
              console.log(`Product not found for slug: ${slug}`);
            }
          }
        }

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
    // 🧩 Agar filename me extension nahi hai to ".pdf" lagao
    if (!filename.toLowerCase().endsWith(".pdf")) {
      filename += ".pdf";
    }

    // 🔽 Fetch file from URL
    const res = await fetch(url);
    const blob = await res.blob();

    // 📥 Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Download started!");
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Failed to download file.");
  }
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
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium uppercase">
                            {course.purchaseType === "regular"
                              ? "PDF Access"
                              : course.purchaseType}
                          </span>
                        )}

                        {course.category && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {course.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload(course.downloadUrl, `${course.name}.pdf`)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
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
                    Download PDF
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
