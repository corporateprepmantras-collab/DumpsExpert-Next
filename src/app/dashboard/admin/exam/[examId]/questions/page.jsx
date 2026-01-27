"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QuestionList from "../../questionManage/QuestionList";
import QuestionForm from "../../questionManage/QuestionForm";
import Modal from "@/components/ui/modal";

export default function QuestionsPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [keepModalOpen, setKeepModalOpen] = useState(true);
  const [search, setSearch] = useState("");

  console.log("Exam ID from URL:", examId);

  // ✅ Check role-based access
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      const hasSubscription = session.user.subscription === "yes";

      // Only allow admin and student roles
      if (userRole === "admin") {
        setIsLoading(false);
        return;
      }

      if (userRole === "student") {
        // Check if student has active subscription/exam access
        if (!hasSubscription) {
          // Redirect to exam purchase page
          router.push(`/exam/${examId}/purchase`);
          return;
        }
        setIsLoading(false);
        return;
      }

      // For guest, redirect to guest dashboard
      if (userRole === "guest") {
        router.push("/dashboard/guest");
        return;
      }

      // Default: redirect to guest dashboard for unknown roles
      router.push("/dashboard/guest");
    }
  }, [status, session, router, examId]);

  const handleQuestionAdded = () => {
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh

    // Scroll modal to top after save
    const modalContent = document.querySelector(".max-h-\\[80vh\\]");
    if (modalContent) {
      modalContent.scrollTop = 0;
    }

    // Only close modal if keepModalOpen is false
    if (!keepModalOpen) {
      setIsModalOpen(false);
    }
  };

  // Show loading state
  if (isLoading || status === "loading") {
    return (
      <div className="p-6 pt-20 flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show restriction message for non-authorized users
  if (!session?.user || !["admin", "student"].includes(session.user.role)) {
    return (
      <div className="p-6 pt-20 flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-700 mb-6">
            You don't have permission to access this page. Only students and
            admins can view exam questions.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard/guest")}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Go to Guest Area
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-20 pt-10">
      {/* Header with Add Question Button and Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exam Questions</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question text or code..."
            className="w-full sm:w-80 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Question
          </button>
        </div>
      </div>

      {/* Question List */}
      <QuestionList
        examId={examId}
        key={refreshTrigger}
        hideAddButton={true}
        searchTerm={search}
      />

      {/* Add Question Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              Add New Questions
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepModalOpen}
                  onChange={(e) => setKeepModalOpen(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium">Keep modal open after save</span>
              </label>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                ✖
              </button>
            </div>
          </div>
          <QuestionForm
            examId={examId}
            onSuccess={handleQuestionAdded}
            isModal={true}
          />
        </div>
      </Modal>
    </div>
  );
}
