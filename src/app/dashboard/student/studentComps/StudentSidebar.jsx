"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaSignOutAlt,
  FaShoppingCart,
  FaFileAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", to: "/dashboard/student/dashboard", icon: <FaUser /> },
  {
    name: "My Orders",
    to: "/dashboard/student/myOrders",
    icon: <FaShoppingCart />,
  },
  {
    name: "My Courses (PDF)",
    to: "/dashboard/student/pdfOrders",
    icon: <FaFileAlt />,
  },
  {
    name: "My Courses (Online Exam)",
    to: "/dashboard/student/examOrders",
    icon: <FaFileAlt />,
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
    icon: <FaUser />,
  },
  { name: "Logout", to: "/logout", icon: <FaSignOutAlt /> },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

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
      {/* Mobile toggle button */}
  {/* Mobile toggle button */}
<div className="lg:hidden fixed top-40 left-4 z-50">
  <button
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
    onClick={() => setIsOpen((v) => !v)}
  >
    {isOpen ? (
      <>
        <FaTimes className="text-lg" />
        <span>Close</span>
      </>
    ) : (
      <>
        <FaBars className="text-lg" />
        <span>Menu</span>
      </>
    )}
  </button>
</div>


      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 pt-20 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 pt-20 h-full w-4/5 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden  ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Card className="w-full h-full p-4 border bg-white shadow-lg overflow-y-auto">
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
                    <span className="truncate">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Card>
      </aside>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Card className="w-64 xl:w-72 mt-16 min-h-screen p-4 shadow-lg border bg-white fixed left-0 top-0">
          <h2 className="text-xl font-bold text-center text-blue-600 mb-6 mt-6">
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
                    <span className="truncate">{item.name}</span>
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
