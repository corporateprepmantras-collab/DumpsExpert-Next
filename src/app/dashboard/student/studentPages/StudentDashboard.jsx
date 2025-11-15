"use client";

import React from "react";
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

export default function Page() {
  const router = useRouter();

  const barData = {
    labels: ["Attempt 1", "Attempt 2", "Attempt 3"],
    datasets: [
      {
        label: "Score %",
        data: [83, 92, 89],
        backgroundColor: "#4F46E5",
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [4, 2],
        backgroundColor: ["#22C55E", "#EAB308"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <span className="text-indigo-600 text-3xl sm:text-4xl">📊</span>
        <span>Dashboard</span>
      </h1>

      {/* Top Section - Charts & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Result Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-700">
            Result Analytics
          </h2>
          <div className="h-48 sm:h-56">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Course Completion */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-700">
            Course Completion
          </h2>
          <div className="w-full max-w-[200px] sm:max-w-[240px]">
            <Doughnut data={doughnutData} options={{ cutout: "70%" }} />
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
          <img
            src="https://via.placeholder.com/60"
            alt="profile"
            className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-indigo-500 mb-3 sm:mb-4"
          />
          <h3 className="font-bold text-lg sm:text-xl mb-1">lorem epsum</h3>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
            google
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/student/edit-profile")}
              className="px-3 sm:px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm sm:text-base font-medium hover:bg-indigo-700 transition whitespace-nowrap"
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push("/student/change-password")}
              className="px-3 sm:px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 text-sm sm:text-base font-medium hover:bg-yellow-500 transition whitespace-nowrap"
            >
              Change Password
            </button>
            <button
              onClick={() => router.push("/student/logout")}
              className="px-3 sm:px-4 py-2 rounded-lg bg-red-500 text-white text-sm sm:text-base font-medium hover:bg-red-600 transition"
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
            <span className="text-indigo-600 text-xl sm:text-2xl">📅</span>
            <span>Exams</span>
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">
            2 upcoming exams
          </p>
          <button
            onClick={() => router.push("/student/courses-exam")}
            className="w-full py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
          >
            View All Exams
          </button>
        </div>

        {/* My Courses */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-indigo-600 text-xl sm:text-2xl">📚</span>
            <span>Courses</span>
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">
            4 active courses
          </p>
          <button
            onClick={() => router.push("/student/courses-pdf")}
            className="w-full py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
          >
            View All Courses
          </button>
        </div>

        {/* Result History */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-indigo-600 text-xl sm:text-2xl">📈</span>
            <span>Results</span>
          </h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">
            3 attempts recorded
          </p>
          <button
            onClick={() => router.push("/student/results")}
            className="w-full py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
          >
            View All Results
          </button>
        </div>
      </div>
    </div>
  );
}
