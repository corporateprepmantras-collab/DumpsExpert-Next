// app/admin/exams/page.jsx
"use client";
import { useState, useEffect } from "react";
import ExamList from "./examComps/ExamList";
import { useRouter } from "next/navigation";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/exams?all=true");
        const data = await res.json();
        console.log("Fetched exams:", data);
        console.log("First exam examCategory:", data[0]?.examCategory);
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setExams(normalized);
      } catch (err) {
        setError("Failed to load exams");
        console.error("Exam fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this exam? All related questions will also be deleted.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExams(exams.filter((e) => e._id !== examId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}.{" "}
              <button
                onClick={() => window.location.reload()}
                className="font-medium text-red-700 hover:text-red-600 underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Exams</h1>
        <div className="w-full sm:w-80">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams by name..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <ExamList
        exams={exams
          .filter(Boolean)
          .filter((exam) =>
            exam?.name?.toLowerCase().includes(search.trim().toLowerCase()),
          )}
        onDelete={handleDelete}
        onEdit={(examId) => router.push(`/dashboard/admin/exam/${examId}`)}
        onManageQuestions={(examId) =>
          router.push(`/dashboard/admin/exam/${examId}/questions`)
        }
        onAddNew={() => router.push("/dashboard/admin/exam/new")}
      />
    </div>
  );
}
