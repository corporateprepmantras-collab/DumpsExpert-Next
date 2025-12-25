"use client";

import React, { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  TrendingUp,
  BookOpen,
  FileText,
  Award,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ProfessionalDashboard({
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

  // Safely access data with fallbacks
  const safeStats = stats || { completed: 0, pending: 0 };
  const safeExams = exams || { upcoming: 0, total: 0 };
  const safeCourses = courses || { active: 0, total: 0 };
  const safeResults = results || {
    attempts: [],
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  };

  // Get recent attempts (last 5)
  const recentAttempts = safeResults.attempts?.slice(0, 5) || [];
  const allAttempts = safeResults.attempts || [];

  // Chart Data - Show last 10 attempts
  const chartAttempts = allAttempts.slice(0, 10).reverse();

  const barData = {
    labels: chartAttempts.map((attempt, idx) => `Test ${idx + 1}`),
    datasets: [
      {
        label: "Score %",
        data: chartAttempts.map((attempt) => attempt.score),
        backgroundColor: chartAttempts.map((attempt) =>
          attempt.passed ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
        ),
        borderColor: chartAttempts.map((attempt) =>
          attempt.passed ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
        ),
        borderWidth: 2,
        borderRadius: 8,
        barThickness: isMobile ? 30 : 50,
      },
    ],
  };

  // Line chart for progress tracking
  const lineData = {
    labels: chartAttempts.map((_, idx) => `Test ${idx + 1}`),
    datasets: [
      {
        label: "Performance Trend",
        data: chartAttempts.map((attempt) => attempt.score),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
      },
    ],
  };

  const totalTasks = safeStats.completed + safeStats.pending;
  const completionRate =
    totalTasks > 0 ? Math.round((safeStats.completed / totalTasks) * 100) : 0;

  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [safeStats.completed, safeStats.pending],
        backgroundColor: ["rgba(34, 197, 94, 0.9)", "rgba(234, 179, 8, 0.9)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 3,
        hoverOffset: 8,
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
          labels: {
            font: { size: isMobile ? 11 : 13, weight: "600" },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          callbacks: {
            label: function (context) {
              return `Score: ${context.parsed.y}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            callback: (value) => value + "%",
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 10 : 12 } },
        },
      },
    },
    line: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { size: isMobile ? 11 : 13, weight: "600" },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            callback: (value) => value + "%",
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 10 : 12 } },
        },
      },
    },
    doughnut: {
      cutout: "75%",
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: isMobile ? 11 : 13, weight: "600" },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
        },
      },
    },
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white mt-16 border-b border-gray-200 sticky top-0 z-9 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Welcome back, {user?.name?.split(" ")[0] || "Student"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Avg Score"
            value={`${safeResults.averageScore}%`}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={
              safeResults.averageScore >= 75
                ? `+${safeResults.averageScore - 70}%`
                : null
            }
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Highest Score"
            value={`${safeResults.highestScore}%`}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="Best performance"
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Total Attempts"
            value={safeResults.totalAttempts}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="exams taken"
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="Completed"
            value={safeStats.completed}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle={`${completionRate}% rate`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Bar Chart - Exam Scores */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Exam Scores
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Last {chartAttempts.length} attempts
                </p>
              </div>
            </div>
            <div className="h-56 sm:h-72">
              {chartAttempts.length > 0 ? (
                <Bar data={barData} options={chartOptions.bar} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No exam attempts yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doughnut Chart - Completion Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Task Status
              </h2>
              <p className="text-sm text-gray-500 mt-1">Completion overview</p>
            </div>
            <div className="h-56">
              {totalTasks > 0 ? (
                <Doughnut data={doughnutData} options={chartOptions.doughnut} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Chart - Performance Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Performance Trend
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track your improvement over time
              </p>
            </div>
          </div>
          <div className="h-56 sm:h-72">
            {chartAttempts.length > 0 ? (
              <Line data={lineData} options={chartOptions.line} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attempts Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Exam Attempts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest test results
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/student/results")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All →
            </button>
          </div>

          {recentAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Exam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">
                      Correct
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAttempts.map((attempt, idx) => (
                    <tr
                      key={attempt.id || idx}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/student/results/${attempt.id}`)
                      }
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">
                          {attempt.examName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-bold text-lg ${
                            attempt.score >= 75
                              ? "text-green-600"
                              : attempt.score >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {attempt.score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600">
                          {formatTime(attempt.timeTaken)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">
                          {formatDate(attempt.date)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {attempt.passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No exam attempts yet</p>
              <p className="text-sm mt-1">
                Start taking exams to see your results here
              </p>
              <button
                onClick={() => router.push("/dashboard/student/courses-exam")}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Exams
              </button>
            </div>
          )}
        </div>

        {/* Bottom Grid - Profile and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={user?.profileImage || "https://via.placeholder.com/120"}
                  alt="profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-4 border-white rounded-full"></div>
              </div>
              <h3 className="font-bold text-xl sm:text-2xl mb-1">
                {user?.name || "Student User"}
              </h3>
              <p className="text-indigo-100 text-sm mb-4 break-words">
                {user?.email || "student@example.com"}
              </p>
              <div className="w-full space-y-2">
                <button
                  onClick={() => router.push("/dashboard/student/edit-profile")}
                  className="w-full py-2.5 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all shadow-md"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() =>
                    router.push("/dashboard/student/change-password")
                  }
                  className="w-full py-2.5 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition-all shadow-md"
                >
                  Change Password
                </button>
                <button
                  onClick={() => router.push("/auth/signout")}
                  className="w-full py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
              icon={<Calendar className="w-6 h-6" />}
              title="Exams"
              description={`${safeExams.upcoming} upcoming • ${safeExams.total} total`}
              buttonText="View All Exams"
              onClick={() => router.push("/dashboard/student/courses-exam")}
              gradient="from-blue-500 to-blue-600"
            />
            <ActionCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Courses"
              description={`${safeCourses.active} active • ${safeCourses.total} total`}
              buttonText="View All Courses"
              onClick={() => router.push("/dashboard/student/courses-pdf")}
              gradient="from-purple-500 to-purple-600"
            />
            <ActionCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="All Results"
              description={`${safeResults.totalAttempts} total attempts`}
              buttonText="View Full History"
              onClick={() => router.push("/dashboard/student/results")}
              gradient="from-green-500 to-green-600"
            />
            <ActionCard
              icon={<Award className="w-6 h-6" />}
              title="Achievements"
              description="Track your milestones"
              buttonText="View Achievements"
              onClick={() => router.push("/dashboard/student/achievements")}
              gradient="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 ${color} rounded-lg flex items-center justify-center text-white shadow-md`}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  gradient,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-4 shadow-md`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>
      <button
        onClick={onClick}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
      >
        {buttonText}
      </button>
    </div>
  );
}
