"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SampleInstructionsPage() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState({});

  const router = useRouter();
  const { slug } = useParams(); // ✅ useParams instead of props

  useEffect(() => {
    if (!slug) return;

    const fetchInstructions = async () => {
      try {
        const res = await axios.get(`/api/exams/byslug/${encodeURIComponent(slug)}`);
        const examData = res.data[0];
        setExam(examData);
      } catch (err) {
        console.error(err);
        setError("Failed to load instructions.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [slug]);

  const handleStart = () => {
    if (!agreed) {
      alert("Please agree to the terms and conditions before starting.");
      return;
    }
    router.push(`/exam/testPage/${slug}`);
  };

  return (
    <div className="instructions-container my-16 px-4">
      <div className="instructions-card max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Sample Test Instructions</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <ul className="space-y-2 text-gray-700">
              <p className="font-medium mb-2">
                📋 Please read the following test instructions carefully:
              </p>

              <li>🧾 <strong>Exam Name:</strong> {exam.name}</li>
              <li>🆔 <strong>Exam Code:</strong> {exam.code}</li>
              <li>⏱️ <strong>Sample Duration:</strong> {exam.sampleDuration} minutes</li>
              <li>✍️ <strong>Marks per Question:</strong> {exam.eachQuestionMark} marks</li>
              <li>🎯 <strong>Passing Score:</strong> {exam.passingScore}%</li>
            </ul>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agree" className="text-sm">
                I have read and agree to the above instructions.
              </label>
            </div>

            <button
              onClick={handleStart}
              disabled={!agreed || loading || !!error}
              className={`mt-6 px-6 py-2 text-white rounded ${
                agreed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Start Sample Test
            </button>
          </>
        )}
      </div>
    </div>
  );
}
