"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  { name: "Dashboard", to: "/dashboard/student", icon: <FaTachometerAlt /> },
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
  { name: "Logout", icon: <FaSignOutAlt />, isLogout: true },
];

export default function StudentSidebar({ onNavigate }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      <div className="pt-6 pb-4 px-4 border-b">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-600">
          🎓 Student Panel
        </h2>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {menuItems.map((item, i) =>
          item.isLogout ? (
            // ✅ LOGOUT BUTTON
            <button
              key={i}
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-left"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm sm:text-base font-medium">
                {item.name}
              </span>
            </button>
          ) : (
            // ✅ NORMAL LINKS
            <Link
              key={i}
              href={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === item.to
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-sm sm:text-base font-medium truncate">
                {item.name}
              </span>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
