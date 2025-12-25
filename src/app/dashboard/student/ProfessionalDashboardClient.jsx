"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  ShoppingCart,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";

export default function ProfessionalDashboardClient({
  user,
  stats,
  exams,
  courses,
  results,
  purchased,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const avgScore = results?.attempts?.length
    ? Math.round(
        results.attempts.reduce((a, b) => a + b, 0) /
          results.attempts.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        <div className="flex items-center gap-3">
          <Search />
          <ShoppingCart />
          <Bell />
          <img
            src={user?.image}
            className="w-8 h-8 rounded-full"
            alt="profile"
          />
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-1">
          Welcome, {user?.name || "Professional"}
        </h1>
        <p className="text-gray-600 mb-6">
          Track your certification preparation
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat title="Completed" value={stats?.completed} icon={FileText} />
          <Stat title="Pending" value={stats?.pending} icon={Clock} />
          <Stat title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} />
          <Stat title="Courses" value={courses?.active} icon={Award} />
        </div>
      </main>
    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <Icon className="mb-2" />
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value ?? 0}</p>
    </div>
  );
}
