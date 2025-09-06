'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ExamCoursesPage = () => {
  const [examCourses, setExamCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("studentId");
        if (!userId) {
          console.error("No user ID found in localStorage");
          return;
        }

        const res = await axios.get(`http://${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/user/${userId}`, {
          withCredentials: true,
        });

        const orders = res.data?.data || [];
        const { examCourses } = separateCoursesByType(orders);
        setExamCourses(examCourses);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAttemptClick = async (courseId) => {
    try {
      const res = await axios.get(`http://${process.env.NEXT_PUBLIC_BASE_URL}/api/exams/byCourseId/${courseId}`);
      const exam = res.data?.data?.[0];

      if (exam?._id) {
        router.push(`/student/courses-exam/instructions/${exam._id}`);
      } else {
        alert("No exam found for this course");
      }
    } catch (err) {
      console.error("Error fetching exam:", err);
      alert("Failed to get exam. Try again later.");
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">My Exam Courses</h1>

      {loading ? (
        <p className="text-gray-600">Loading exams...</p>
      ) : examCourses.length === 0 ? (
        <p className="text-gray-500">No exams found</p>
      ) : (
        <div className="space-y-4">
          {examCourses.map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <span className="text-sm font-medium text-gray-600 w-32">
                {new Date(course.createdAt).toLocaleDateString("en-GB")}
              </span>
              <span className="text-blue-700 font-semibold text-center flex-1 mx-2">
                {course.name}
              </span>
              <span className="text-blue-700 font-semibold w-24 text-center">
                {course.code}
              </span>
              <button
                onClick={() => handleAttemptClick(course._id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Attempt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamCoursesPage;

// // ✅ Helper: Separates PDF and Exam Courses from orders
// function separateCoursesByType(orders) {
//   const pdfCourses = [];
//   const examCourses = [];

//   orders.forEach(order => {
//     order.courseDetails.forEach(course => {
//       if (course.name?.toLowerCase().includes("[pdf]")) {
//         pdfCourses.push({
//           name: course.name,
//           code: course.sapExamCode,
//           date: new Date(order.purchaseDate).toLocaleDateString("en-GB"),
//           downloadUrl: course.mainPdfUrl || course.samplePdfUrl,
//         });
//       } else if (course.name?.toLowerCase().includes("[online exam]")) {
//         examCourses.push({
//           _id: course._id,
//           name: course.name,
//           code: course.sapExamCode,
//           createdAt: order.purchaseDate,
//         });
//       }
//     });
//   });

//   return { pdfCourses, examCourses };
// }
