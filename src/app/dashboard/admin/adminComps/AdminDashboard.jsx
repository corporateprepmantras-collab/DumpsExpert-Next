"use client";

import React from "react";
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
} from "react-icons/fa";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Stat cards data
const statCards = [
  {
    title: "Total Products",
    value: 50,
    icon: FaClipboardList,
    color: "text-blue-500",
  },
  {
    title: "Total Exams",
    value: 12,
    icon: FaGraduationCap,
    color: "text-purple-500",
  },
  { title: "Customers", value: 140, icon: FaUsers, color: "text-green-500" },
  { title: "Blogs", value: 18, icon: FaNewspaper, color: "text-yellow-500" },
  { title: "Orders", value: 65, icon: FaClipboardList, color: "text-red-500" },
  {
    title: "Sales (INR)",
    value: "₹85,000",
    icon: FaDollarSign,
    color: "text-indigo-500",
  },
  {
    title: "Sales (USD)",
    value: "$1,000",
    icon: FaDollarSign,
    color: "text-pink-500",
  },
  { title: "Subscribers", value: 245, icon: FaInbox, color: "text-teal-500" },
];

// Chart data
const doughnutData = {
  labels: ["Products", "Exams", "Orders", "Subscribers"],
  datasets: [
    {
      data: [50, 12, 65, 245],
      backgroundColor: ["#3B82F6", "#8B5CF6", "#EF4444", "#10B981"],
      borderWidth: 2,
    },
  ],
};

const barData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Monthly Sales (INR)",
      data: [10000, 15000, 20000, 18000, 22000],
      backgroundColor: "#6366F1",
      borderRadius: 5,
    },
  ],
};

const doughnutOptions = {
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: { legend: { position: "bottom" } },
};

const barOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

// Table data
const orders = [
  {
    date: "2025-06-01",
    number: "#ORD123",
    gateway: "Razorpay",
    total: "₹500",
    status: "Paid",
    payment: "Confirmed",
  },
  {
    date: "2025-06-02",
    number: "#ORD124",
    gateway: "Stripe",
    total: "₹300",
    status: "Pending",
    payment: "Pending",
  },
];

const users = [
  {
    date: "2025-06-01",
    name: "Yagyesh",
    email: "yagyesh@example.com",
    lastActive: "2025-06-04",
    spend: "₹500",
  },
  {
    date: "2025-06-03",
    name: "Ankit",
    email: "ankit@example.com",
    lastActive: "2025-06-04",
    spend: "₹300",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            {card.icon && <card.icon className={`w-10 h-10 ${card.color}`} />}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md h-[350px]"
        >
          <h2 className="text-lg font-semibold mb-4">Entity Distribution</h2>
          <div className="h-[250px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-md h-[350px]"
        >
          <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
          <div className="h-[250px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-lg font-semibold mb-4">Latest Orders</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="p-2">Date</th>
                <th className="p-2">Order #</th>
                <th className="p-2">Gateway</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{o.date}</td>
                  <td className="p-2">{o.number}</td>
                  <td className="p-2">{o.gateway}</td>
                  <td className="p-2">{o.total}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">{o.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-lg font-semibold mb-4">Latest Users</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="p-2">Registered</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Last Active</th>
                <th className="p-2">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{u.date}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.lastActive}</td>
                  <td className="p-2">{u.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
