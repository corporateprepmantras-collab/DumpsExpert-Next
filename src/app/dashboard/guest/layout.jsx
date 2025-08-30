// app/dashboard/guest/layout.jsx
"use client";

import { AppSidebar } from "@/components/guest/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

export default function GuestDashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Redirect if user is not a guest
    if (!loading && user && user.role !== "guest") {
      let targetDashboard = "/dashboard/guest";
      if (user.role === "admin") {
        targetDashboard = "/dashboard/admin";
      } else if (user.role === "student" && user.subscription === "yes") {
        targetDashboard = "/dashboard/student";
      }
      router.push(targetDashboard);
    }
  }, [loading, user, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><span>Loading...</span></div>;

  if (user.error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{user.error}</div>;
  }

  if (user.role !== "guest") {
    return null; // Prevent rendering until redirect
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex mt-27 w-full relative">
        <div className="z-[-1]">
          <AppSidebar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}