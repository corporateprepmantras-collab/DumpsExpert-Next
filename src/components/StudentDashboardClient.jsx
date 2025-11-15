"use client";

import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function StudentDashboardClient({
  user,
  stats,
  exams,
  courses,
  results,
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Chart data from server props
  const barData = {
    labels: ["Attempt 1", "Attempt 2", "Attempt 3"],
    datasets: [
      {
        label: "Score %",
        data: results?.attempts || [83, 92, 89],
        backgroundColor: "#4F46E5",
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [stats?.completed || 4, stats?.pending || 2],
        backgroundColor: ["#22C55E", "#EAB308"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    bar: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
        x: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    },
    doughnut: {
      cutout: "70%",
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 flex items-center gap-2 sm:gap-3">
        <span className="text-indigo-600 text-3xl sm:text-4xl">📊</span>{" "}
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Result Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-700">
            Result Analytics
          </h2>
          <div className="h-48 sm:h-64">
            <Bar data={barData} options={chartOptions.bar} />
          </div>
        </div>

        {/* Course Completion */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-700">
            Course Completion
          </h2>
          <div className="w-full max-w-[200px] sm:max-w-[240px]">
            <Doughnut data={doughnutData} options={chartOptions.doughnut} />
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
          <img
            src={user?.profileImage || "https://via.placeholder.com/128"}
            alt="profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-500 mb-3 sm:mb-4 object-cover"
          />
          <h3 className="font-bold text-lg sm:text-xl mb-1">
            {user?.name || "Student"}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 break-words max-w-full">
            {user?.email || "student@example.com"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/student/edit-profile")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm sm:text-base font-medium hover:bg-indigo-700 transition w-full sm:w-auto"
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push("/dashboard/student/change-password")}
              className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 text-sm sm:text-base font-medium hover:bg-yellow-500 transition w-full sm:w-auto"
            >
              Change Password
            </button>
            <button
              onClick={() => router.push("/auth/signout")}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm sm:text-base font-medium hover:bg-red-600 transition w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Exams */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-indigo-600 text-xl sm:text-2xl">📅</span>{" "}
            Exams
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">
            {exams?.upcoming || 2} upcoming exams
          </p>
          <button
            onClick={() => router.push("/dashboard/student/courses-exam")}
            className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            View All Exams
          </button>
        </div>

        {/* My Courses */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-indigo-600 text-xl sm:text-2xl">📚</span>{" "}
            Courses
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">
            {courses?.active || 4} active courses
          </p>
          <button
            onClick={() => router.push("/dashboard/student/courses-pdf")}
            className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            View All Courses
          </button>
        </div>

        {/* Result History */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-indigo-600 text-xl sm:text-2xl">📈</span>{" "}
            Results
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">
            {results?.attempts?.length || 3} attempts recorded
          </p>
          <button
            onClick={() => router.push("/dashboard/student/results")}
            className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            View All Results
          </button>
        </div>
      </div>
    </div>
  );
}
