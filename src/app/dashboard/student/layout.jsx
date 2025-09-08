// app/dashboard/student/layout.jsx
"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "./studentComps/StudentSidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { FaBars, FaTimes } from "react-icons/fa";

export default function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    setMounted(true);
    if (mounted && !loading && user && (user.role !== "student" || user.subscription !== "yes")) {
      let targetDashboard = "/dashboard/guest";
      if (user.role === "admin") {
        targetDashboard = "/dashboard/admin";
      }
      router.push(targetDashboard);
    }
  }, [mounted, loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (user.error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {user.error}
      </div>
    );
  }

  if (user.role !== "student" || user.subscription !== "yes") {
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar (drawer) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <StudentSidebar />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 w-full transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-white shadow-md flex items-center px-4 z-30 lg:hidden">
          <button
            className="text-xl text-gray-700"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="ml-4 font-semibold text-gray-800">Student Dashboard</h1>
        </div>

        {/* Page content with padding for header */}
        <div className="pt-16 p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
