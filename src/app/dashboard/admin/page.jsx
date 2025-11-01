"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Icon components
const RefreshIcon = ({ className = "", spinning = false }) => (
  <svg
    className={`${className} ${spinning ? "animate-spin" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const TrendingUpIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const UsersIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const PackageIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const GraduationCapIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  </svg>
);

const NewspaperIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const DollarIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const InboxIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const ClipboardIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    exams: 0,
    totalCustomers: 0,
    students: 0,
    subscribers: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    unpublishedBlogs: 0,
    orders: 0,
    totalOrders: 0,
    salesINR: 0,
    salesUSD: 0,
    recentOrders: [],
    recentUsers: [],
    monthlyData: [],
  });

  const [chartMonths, setChartMonths] = useState(5);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    fetchDashboardData();
  }, [chartMonths]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `/api/admin/dashboard?months=${chartMonths}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      console.log(data);
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "Total Products",
        value: dashboardData.products,
        icon: PackageIcon,
        gradient: "from-blue-500 to-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
      },
      {
        title: "Total Exams",
        value: dashboardData.exams,
        icon: GraduationCapIcon,
        gradient: "from-purple-500 to-purple-600",
        bgGradient: "from-purple-50 to-purple-100",
      },
      {
        title: "Total Customers",
        value: dashboardData.totalCustomers,
        icon: UsersIcon,
        gradient: "from-green-500 to-green-600",
        bgGradient: "from-green-50 to-green-100",
        subtitle: `${dashboardData.students} Students`,
      },
      {
        title: "Total Blogs",
        value: dashboardData.totalBlogs,
        icon: NewspaperIcon,
        gradient: "from-amber-500 to-amber-600",
        bgGradient: "from-amber-50 to-amber-100",
        subtitle: `${dashboardData.publishedBlogs} Published • ${dashboardData.unpublishedBlogs} Unpublished`,
      },
      {
        title: "Total Orders",
        value: dashboardData.orders,
        icon: ShoppingCartIcon,
        gradient: "from-red-500 to-red-600",
        bgGradient: "from-red-50 to-red-100",
      },
      {
        title: "Sales (INR)",
        value: `₹${dashboardData.salesINR.toLocaleString("en-IN")}`,
        icon: DollarIcon,
        gradient: "from-indigo-500 to-indigo-600",
        bgGradient: "from-indigo-50 to-indigo-100",
      },
      {
        title: "Sales (USD)",
        value: `$${dashboardData.salesUSD.toLocaleString("en-US")}`,
        icon: DollarIcon,
        gradient: "from-pink-500 to-pink-600",
        bgGradient: "from-pink-50 to-pink-100",
      },
      {
        title: "Subscribers",
        value: dashboardData.subscribers,
        icon: InboxIcon,
        gradient: "from-teal-500 to-teal-600",
        bgGradient: "from-teal-50 to-teal-100",
      },
    ],
    [dashboardData]
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Products", "Exams", "Orders", "Subscribers"],
      datasets: [
        {
          data: [
            dashboardData.products,
            dashboardData.exams,
            dashboardData.totalOrders,
            dashboardData.subscribers,
          ],
          backgroundColor: ["#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6"],
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: "#fff",
        },
      ],
    }),
    [dashboardData]
  );

  const barData = useMemo(
    () => ({
      labels: dashboardData.monthlyData.map((m) => m.month),
      datasets: [
        {
          label: `Monthly Sales (${currency})`,
          data: dashboardData.monthlyData.map((m) =>
            currency === "INR" ? m.salesINR : m.salesUSD
          ),
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderRadius: 6,
          barThickness: 40,
        },
      ],
    }),
    [dashboardData.monthlyData, currency]
  );

  const chartOptions = useMemo(
    () => ({
      doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              font: { size: 13, weight: "500" },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            padding: 12,
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
      bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            padding: 12,
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return currency === "INR"
                  ? `Sales: ₹${value.toLocaleString("en-IN")}`
                  : `Sales: $${value.toLocaleString("en-US")}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.04)",
              drawBorder: false,
            },
            border: { display: false },
            ticks: {
              font: { size: 11 },
              callback: (value) => {
                if (value >= 1000) {
                  return currency === "INR"
                    ? `₹${(value / 1000).toFixed(0)}k`
                    : `$${(value / 1000).toFixed(0)}k`;
                }
                return currency === "INR" ? `₹${value}` : `$${value}`;
              },
            },
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11, weight: "500" } },
          },
        },
      },
    }),
    [currency]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <TrendingUpIcon className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mt-6">
            Loading Dashboard
          </p>
          <p className="text-sm text-gray-500 mt-2">Fetching latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col pt-20 sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Monitor your platform statistics
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
        >
          <RefreshIcon className="w-4 h-4" spinning={refreshing} />
          <span className="hidden sm:inline">
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </span>
          <span className="sm:hidden">Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.bgGradient} p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm group cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div
                className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Doughnut Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900">
            Entity Distribution
          </h2>
          <div className="h-[280px] sm:h-[300px]">
            <Doughnut data={doughnutData} options={chartOptions.doughnut} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Monthly Sales Trends
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-semibold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
              <select
                value={chartMonths}
                onChange={(e) => setChartMonths(Number(e.target.value))}
                className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-semibold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="3">Last 3 Months</option>
                <option value="5">Last 5 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="24">Last 24 Months</option>
              </select>
            </div>
          </div>
          <div className="h-[280px] sm:h-[300px]">
            <Bar data={barData} options={chartOptions.bar} />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Orders Table */}
        <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-900">
            Latest Orders
          </h2>
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Order #
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">
                      Gateway
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Total
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          {new Date(order.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold text-gray-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 capitalize font-medium hidden sm:table-cell">
                          {order.paymentMethod}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                          {order.currency === "INR" ? "₹" : "$"}
                          {order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardIcon className="w-12 h-12 text-gray-300" />
                          <p className="font-medium">No orders found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-900">
            Latest Users
          </h2>
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Registered
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">
                      Email
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Role
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">
                      Sub
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.recentUsers.length > 0 ? (
                    dashboardData.recentUsers.map((user, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold text-gray-900">
                          {user.name || "N/A"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                          {user.email}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full capitalize whitespace-nowrap ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "student"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              user.subscription === "yes"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.subscription === "yes" ? "Active" : "None"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <UsersIcon className="w-12 h-12 text-gray-300" />
                          <p className="font-medium">No users found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
