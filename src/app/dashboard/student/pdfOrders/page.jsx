'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const PdfCoursesClient = () => {
  const [pdfCourses, setPdfCourses] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("studentId");
        if (!userId) {
          console.error("No user ID found in localStorage");
          return;
        }

        const res = await axios.get(
          `http://${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/user/${userId}`,
          { withCredentials: true }
        );

        const { pdfCourses } = separateCoursesByType(res.data.data || []);
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
    <div className="bg-white text-black p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">My PDF Courses</h1>
      <div className="space-y-4">
        {pdfCourses.length === 0 ? (
          <p className="text-gray-600">No PDF courses found.</p>
        ) : (
          pdfCourses.map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <span className="text-sm font-medium text-gray-600 w-32">{course.date}</span>
              <span className="text-blue-700 font-semibold text-center flex-1 mx-2">
                {course.name}
              </span>
              <button
                onClick={() => handleDownload(course.downloadUrl, `${course.name}-Main.pdf`)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Download File
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PdfCoursesClient;

// ✅ Helper
function separateCoursesByType(orders = []) {
  const pdfCourses = [];
  const examCourses = [];

  orders.forEach(order => {
    order.courseDetails.forEach(course => {
      if (course.name?.toLowerCase().includes("[pdf]")) {
        pdfCourses.push({
          name: course.name,
          code: course.sapExamCode,
          date: new Date(order.purchaseDate).toLocaleDateString("en-GB"),
          downloadUrl: course.mainPdfUrl || course.samplePdfUrl,
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
