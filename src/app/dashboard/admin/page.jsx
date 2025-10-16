"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import {
  FaUsers,
  FaClipboardList,
  FaDollarSign,
  FaNewspaper,
  FaInbox,
  FaGraduationCap,
  FaSpinner,
  FaSync,
} from "react-icons/fa";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    exams: 0,
    customers: 0,
    students: 0,
    subscribers: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    unpublishedBlogs: 0,
    orders: 0,
    salesINR: 0,
    salesUSD: 0,
    recentOrders: [],
    recentUsers: [],
    monthlyData: [],
  });
  
  const [chartMonths, setChartMonths] = useState(5);
  const [currency, setCurrency] = useState('INR');

  // Fetch dashboard data
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
      
      const response = await fetch(`/api/admin/dashboard?months=${chartMonths}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      console.log(data)
      setDashboardData(data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show error toast or notification here
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Stat cards configuration
  const statCards = [
    { 
      title: "Total Products", 
      value: dashboardData.products, 
      icon: FaClipboardList, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    { 
      title: "Total Exams", 
      value: dashboardData.exams, 
      icon: FaGraduationCap, 
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    { 
      title: "Total Customers", 
      value: dashboardData.totalCustomers, 
      icon: FaUsers, 
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      subtitle: `${dashboardData.students} Students`
    },
    { 
      title: "Total Blogs", 
      value: dashboardData.totalBlogs, 
      icon: FaNewspaper, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      subtitle: `${dashboardData.publishedBlogs} Published • ${dashboardData.unpublishedBlogs} Unpublished`
    },
    { 
      title: "Total Orders", 
      value: dashboardData.orders, 
      icon: FaClipboardList, 
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    { 
      title: "Sales (INR)", 
      value: `₹${dashboardData.salesINR.toLocaleString('en-IN')}`, 
      icon: FaDollarSign, 
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    { 
      title: "Sales (USD)", 
      value: `$${dashboardData.salesUSD.toLocaleString('en-US')}`, 
      icon: FaDollarSign, 
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    { 
      title: "Subscribers", 
      value: dashboardData.subscribers, 
      icon: FaInbox, 
      color: "text-teal-500",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
  ];

  // Chart data
  const doughnutData = {
    labels: ["Products", "Exams", "Orders", "Subscribers"],
    datasets: [
      {
        data: [
          dashboardData.products, 
          dashboardData.exams, 
          dashboardData.totalOrders, 
          dashboardData.subscribers
        ],
        backgroundColor: ["#3B82F6", "#8B5CF6", "#EF4444", "#10B981"],
        borderWidth: 3,
        borderColor: "#ffffff",
      },
    ],
  };

  const barData = {
    labels: dashboardData.monthlyData.map(m => m.month),
    datasets: [
      {
        label: `Monthly Sales (${currency})`,
        data: dashboardData.monthlyData.map(m => 
          currency === 'INR' ? m.salesINR : m.salesUSD
        ),
        backgroundColor: "#6366F1",
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { 
      legend: { 
        position: "bottom",
        labels: {
          padding: 20,
          font: { size: 13, weight: '500' },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return currency === 'INR' 
              ? `Sales: ₹${value.toLocaleString('en-IN')}`
              : `Sales: $${value.toLocaleString('en-US')}`;
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 },
          callback: (value) => {
            if (value >= 1000) {
              return currency === 'INR'
                ? `₹${(value / 1000).toFixed(0)}k`
                : `$${(value / 1000).toFixed(0)}k`;
            }
            return currency === 'INR' ? `₹${value}` : `$${value}`;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' } }
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your platform statistics</p>
        </div>
        <button 
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`${card.bgColor} p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border-2 ${card.borderColor}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-semibold mb-2 uppercase tracking-wide">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-600 font-medium mt-2">{card.subtitle}</p>
                )}
              </div>
              <div className={`${card.color} p-3 rounded-xl bg-white shadow-sm`}>
                <card.icon className="w-7 h-7" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Doughnut Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900">Entity Distribution</h2>
          <div className="h-[300px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-xl font-bold text-gray-900">Monthly Sales Trends</h2>
            <div className="flex gap-2">
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
              <select 
                value={chartMonths}
                onChange={(e) => setChartMonths(Number(e.target.value))}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="3">Last 3 Months</option>
                <option value="5">Last 5 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="24">Last 24 Months</option>
              </select>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-5 text-gray-900">Latest Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order #</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Gateway</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(order.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="p-3 text-sm text-gray-700 capitalize font-medium">
                        {order.paymentMethod}
                      </td>
                      <td className="p-3 text-sm font-bold text-gray-900">
                        {order.currency === 'INR' ? '₹' : '$'}
                        {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FaClipboardList className="w-12 h-12 text-gray-300" />
                        <p className="font-medium">No orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-5 text-gray-900">Latest Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registered</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="p-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sub</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentUsers.length > 0 ? (
                  dashboardData.recentUsers.map((user, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-900">
                        {user.name || 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'student'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.subscription === 'yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.subscription === 'yes' ? 'Active' : 'None'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FaUsers className="w-12 h-12 text-gray-300" />
                        <p className="font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}