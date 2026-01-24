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
    setIsModalOpen(false);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
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
      {/* Header with Add Question Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exam Questions</h1>
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

      {/* Question List */}
      <QuestionList examId={examId} key={refreshTrigger} hideAddButton={true} />

      {/* Add Question Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Add New Question
          </h2>
          <QuestionForm examId={examId} onSuccess={handleQuestionAdded} />
        </div>
      </Modal>
    </div>
  );
}
