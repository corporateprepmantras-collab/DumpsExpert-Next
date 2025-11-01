// app/dashboard/admin/layout.jsx
"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./adminComps/AdminSidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function AdminLayout({ children }) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg font-semibold text-gray-700">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (user.error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-xl font-semibold">{user.error}</p>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area - No extra padding top since navbar is already there */}
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
