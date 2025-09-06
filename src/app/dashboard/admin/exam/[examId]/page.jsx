'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ correct import
import ExamForm from "../examComps/ExamForm";

export default function ExamFormWrapper() {
  const params = useParams();
  const examId = params.examId; // App Router me jo folder name hai use params se milega

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) {
        // Add mode
        setExam(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/exams/${examId}`);
        const data = await res.json();
        setExam(data); // Edit mode
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>
  );

  return (


      <ExamForm exam={exam} />
   
  );
}
