"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", to: "/guest/dashboard", icon: <FaUser /> },
  { name: "Edit Profile", to: "/guest/edit-profile", icon: <FaUser /> },
  { name: "Change Password", to: "/guest/change-password", icon: <FaUser /> },
  { name: "Logout", to: "/logout", icon: <FaSignOutAlt /> },
];

const GuestSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 pt-20 mt-4 min-h-screen bg-white p-2">
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
    </div>
  );
};

export default GuestSidebar;
