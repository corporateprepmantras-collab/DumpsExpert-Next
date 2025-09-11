"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import GuestSidebar from "./GuestSidebar";

export default function GuestDashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading, error } = useUser();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "student" && user.subscription === "yes") {
        router.push("/dashboard/student");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user || user.role !== "guest") return null;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r">
        <GuestSidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
