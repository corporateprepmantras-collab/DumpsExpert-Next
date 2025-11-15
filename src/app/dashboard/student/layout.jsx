"use client";

import { useState } from "react";
import StudentSidebar from "./studentComps/StudentSidebar";
import { FaBars, FaTimes } from "react-icons/fa";

export default function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen z-40
          w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <StudentSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto lg:ml-0">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
        {children}
      </main>
    </div>
  );
}
