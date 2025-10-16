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
        // ✅ Step 1: Fetch all student orders
        const { data } = await axios.get(
          `http://localhost:3000/api/student/orders`
        );
        const orders = data?.orders || [];

        // ✅ Step 2: Extract ALL course details (including PDFs)
        const courses = orders.flatMap((order) =>
          order.courseDetails.map((course) => ({
            name: course.name,
            slug: course.slug,
            code: course.sapExamCode,
            purchaseDate: order.purchaseDate,
          }))
        );

        if (courses.length === 0) {
          setExamCourses([]);
          return;
        }

        // ✅ Step 3: Check which courses have an exam available
        const checkedCourses = await Promise.all(
          courses.map(async (course) => {
            try {
              const res = await axios.get(
                `http://localhost:3000/api/exams/byslug/${course.slug}`
              );
              const exam = res.data?.data?.[0];
              return { ...course, examId: exam?._id || null };
            } catch (error) {
              console.error(`Error checking exam for ${course.slug}:`, error);
              return { ...course, examId: null };
            }
          })
        );

        setExamCourses(checkedCourses);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamCourses();
  }, []);

  // ✅ When user clicks "Start Exam"
  const handleStartExam = (examId) => {
    if (examId) router.push(`/student/courses-exam/instructions/${examId}`);
  };

  return (
    <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">My Exam Courses</h1>

      {loading ? (
        <p className="text-gray-600 text-center">Loading your courses...</p>
      ) : examCourses.length === 0 ? (
        <p className="text-gray-500 text-center">No courses found</p>
      ) : (
        <div className="space-y-4">
          {examCourses.map((course, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50"
            >
              <span className="text-sm text-gray-500 sm:w-32 mb-2 sm:mb-0">
                {new Date(course.purchaseDate).toLocaleDateString("en-GB")}
              </span>

              <span className="text-blue-700 font-semibold text-center flex-1 mx-2">
                {course.name}
              </span>

              <span className="text-blue-500 font-semibold w-32 text-center">
                {course.code || "N/A"}
              </span>

              {course.examId ? (
                <button
                  onClick={() => handleStartExam(course.examId)}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-lg hover:bg-green-600 transition text-sm mt-2 sm:mt-0"
                >
                  Start Exam
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg cursor-not-allowed text-sm mt-2 sm:mt-0"
                >
                  Exam Not Available
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamCoursesPage;
