"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const PdfCoursesClient = () => {
  const [pdfCourses, setPdfCourses] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/student/orders",
          { withCredentials: true }
        );

        const { pdfCourses } = separateCoursesByType(res.data.orders || []);
        setPdfCourses(pdfCourses);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to fetch courses");
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

      <div className="space-y-4">
        {pdfCourses.length === 0 ? (
          <p className="text-gray-500 text-center">
            No downloadable PDF courses found.
          </p>
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
                      `${course.name}-Main.pdf`
                    )
                  }
                  className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Download
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
    </div>
  );
};

export default PdfCoursesClient;

/* ✅ Helper Function */
function separateCoursesByType(orders = []) {
  const pdfCourses = [];
  const examCourses = [];

  orders.forEach((order) => {
    order.courseDetails.forEach((course) => {
      if (
        course.name?.toLowerCase().includes("[pdf]") &&
        course.mainPdfUrl &&
        course.mainPdfUrl.trim() !== ""
      ) {
        pdfCourses.push({
          name: course.name,
          code: course.sapExamCode,
          date: new Date(order.purchaseDate).toLocaleDateString("en-GB"),
          downloadUrl: course.mainPdfUrl,
        });
      } else if (course.name?.toLowerCase().includes("[online exam]")) {
        examCourses.push({
          _id: course._id,
          name: course.name,
          code: course.sapExamCode,
          createdAt: order.purchaseDate,
        });
      }
    });
  });

  return { pdfCourses, examCourses };
}
