"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaSignOutAlt,
  FaShoppingCart,
  FaFileAlt,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", to: "/dashboard/student/dashboard", icon: <FaUser /> },
  { name: "My Orders", to: "/dashboard/student/myOrders", icon: <FaShoppingCart /> },
  { name: "My Courses (PDF)", to: "/dashboard/student/pdfOrders", icon: <FaFileAlt /> },
  { name: "My Courses (Online Exam)", to: "/dashboard/student/examOrders", icon: <FaFileAlt /> },
  { name: "Result History Tracking", to: "/dashboard/student/resultTracking", icon: <FaFileAlt /> },
  { name: "Edit Profile", to: "/dashboard/student/editProfile", icon: <FaUser /> },
  { name: "Change Password", to: "/dashboard/student/changePassword", icon: <FaUser /> },
  { name: "Logout", to: "/logout", icon: <FaSignOutAlt /> },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Handle sidebar toggle for mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(true);
      else setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Toggle button for mobile/tablet */}
      <div className="lg:hidden flex items-center p-2 fixed top-4 left-4 z-50">
        <button
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg focus:outline-none"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>
      {/* Overlay for mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-200 ${isOpen ? "block opacity-100" : "hidden opacity-0"} lg:hidden`}
        onClick={() => setIsOpen(false)}
      ></div>
      {/* Sidebar Drawer (mobile/tablet) */}
      <aside
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden flex flex-col pt-16`}
      >
        <Card className="w-full h-full p-4 shadow-lg border bg-white">
          <h2 className="text-xl font-bold text-center text-blue-600 mb-6">
            🎓 Student Panel
          </h2>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, i) => {
              const isActive = pathname === item.to;
              return (
                <Link key={i} href={item.to} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-base ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Card>
      </aside>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Card className="w-68 mt-20 min-h-screen p-4 shadow-lg border bg-white">
          <h2 className="text-xl font-bold text-center text-blue-600 mb-6">
            🎓 Student Panel
          </h2>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, i) => {
              const isActive = pathname === item.to;
              return (
                <Link key={i} href={item.to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-base ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Card>
      </div>
    </>
  );
}
