"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const PdfCoursesClient = () => {
  const [pdfCourses, setPdfCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/student/orders",
          { withCredentials: true }
        );

        console.log("📦 Full API Response:", res.data);
        console.log("📦 Orders:", res.data.orders);

        const orders = res.data.orders || res.data || [];
        console.log("📦 Processing orders:", orders);

        const { pdfCourses } = await separateCoursesByType(orders);

        console.log("✅ Final pdfCourses:", pdfCourses);
        setPdfCourses(pdfCourses);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
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
    <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-10 border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        My PDF Courses
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pdfCourses.length === 0 ? (
            <div>
              <p className="text-gray-500 text-center">
                No downloadable PDF courses found.
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                Check console for debugging information
              </p>
            </div>
          ) : (
            pdfCourses.map((course, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50"
              >
                <span className="text-sm text-gray-500 sm:w-32 mb-2 sm:mb-0">
                  {course.date}
                </span>
                <span className="text-blue-600 font-semibold text-center flex-1 mx-2">
                  {course.name}
                </span>

                {course.downloadUrl ? (
                  <button
                    onClick={() =>
                      handleDownload(
                        course.downloadUrl,
                        `${course.name.replace(/\[PDF\]/gi, "").trim()}.pdf`
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition text-sm font-medium shadow-sm"
                  >
                    Download PDF
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm italic">
                    File not available
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PdfCoursesClient;

/* ✅ Helper Function with detailed logging */
// ✅ Helper Function
async function separateCoursesByType(orders = []) {
  const pdfCourses = [];
  const examCourses = [];

  const fetchPromises = [];

  orders.forEach((order) => {
    order.courseDetails?.forEach((course) => {
      if (course.name?.toLowerCase().includes("[pdf]")) {
        const apiUrl = `http://localhost:3000/api/products/get-by-slug/${course.slug}`;

        const promise = axios
          .get(apiUrl)
          .then((response) => {
            // ✅ FIXED: Accessing the nested data
            const productData = response.data?.data;

            if (!productData) {
              console.warn("⚠️ Product data missing for slug:", course.slug);
              return;
            }

            console.log("🧾 Product Data:", productData);

            // ✅ Check if mainPdfUrl exists
            if (
              productData.mainPdfUrl &&
              productData.mainPdfUrl.trim() !== ""
            ) {
              pdfCourses.push({
                name: course.name,
                code: course.code || productData.sapExamCode,
                date: new Date(order.purchaseDate).toLocaleDateString("en-GB"),
                downloadUrl: productData.mainPdfUrl, // ✅ mainPdfUrl found
              });
            } else {
              console.warn(`⚠️ No mainPdfUrl found for ${course.name}`);
            }
          })
          .catch((err) => {
            console.error(
              `❌ Error fetching product by slug: ${course.slug}`,
              err
            );
          });

        fetchPromises.push(promise);
      }
    });
  });

  await Promise.all(fetchPromises);
  return { pdfCourses, examCourses };
}
