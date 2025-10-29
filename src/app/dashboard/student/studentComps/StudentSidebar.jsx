"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaUser,
  FaBook,
  FaClipboardList,
  FaLock,
  FaSignOutAlt,
  FaShoppingCart,
  FaFileAlt,
} from "react-icons/fa";

const menuItems = [
  {
    name: "Dashboard",
    to: "/dashboard/student",
    icon: <FaTachometerAlt />,
  },
  {
    name: "My Orders",
    to: "/dashboard/student/myOrders",
    icon: <FaShoppingCart />,
  },
  {
    name: "My Courses (PDF)",
    to: "/dashboard/student/pdfOrders",
    icon: <FaBook />,
  },
  {
    name: "My Courses (Online Exam)",
    to: "/dashboard/student/examOrders",
    icon: <FaClipboardList />,
  },
  {
    name: "Result History Tracking",
    to: "/dashboard/student/resultTracking",
    icon: <FaFileAlt />,
  },
  {
    name: "Edit Profile",
    to: "/dashboard/student/editProfile",
    icon: <FaUser />,
  },
  {
    name: "Change Password",
    to: "/dashboard/student/changePassword",
    icon: <FaLock />,
  },
  { name: "Logout", to: "/logout", icon: <FaSignOutAlt /> },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 pt-20 min-h-screen bg-white p-2 shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">🎓 Student Panel</h2>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            href={item.to}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition ${
              pathname === item.to ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
