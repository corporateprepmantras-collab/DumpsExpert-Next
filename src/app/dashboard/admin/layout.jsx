// app/dashboard/admin/layout.jsx
"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./adminComps/AdminSidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    setMounted(true);
    // Redirect if user is not an admin
    if (mounted && !loading && user && user.role !== "admin") {
      let targetDashboard = "/dashboard/guest";
      if (user.role === "student" && user.subscription === "yes") {
        targetDashboard = "/dashboard/student";
      }
      router.push(targetDashboard);
    }
  }, [mounted, loading, user, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><span>Loading...</span></div>;
  }

  if (user.error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{user.error}</div>;
  }

  if (user.role !== "admin") {
    return null; // Prevent rendering until redirect
  }

  const sidebarWidth = sidebarOpen ? "ml-64" : "ml-16";

  return (
    <div className="bg-gray-100">
      <div
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <AdminSidebar />
      </div>
      <div className={`transition-all duration-300 ${sidebarWidth} mt-20 p-6`}>
        {children}
      </div>
    </div>
  );
}