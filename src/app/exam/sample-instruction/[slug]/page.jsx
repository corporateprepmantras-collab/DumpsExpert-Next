"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  BookOpen,
  Target,
  Info,
  ArrowRight,
  FlaskConical,
} from "lucide-react";

export default function SampleInstructionsPage() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);

  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    const fetchInstructions = async () => {
      try {
        const res = await fetch(
          `/api/exams/byslug/${encodeURIComponent(slug)}`
        );
        const data = await res.json();

        if (data?.data?.length > 0) {
          setExam(data.data[0]);
        } else {
          setError("No exam found for this slug.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-700 text-base font-medium mt-4">
              Loading sample test...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something Went Wrong
            </h2>
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Test Found
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              No instructions are available for this sample test.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-3">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-medium text-xs">
              Sample Test
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sample Test Instructions
          </h1>
          <p className="text-gray-600 text-sm">
            Practice before the main examination
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Exam Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{exam.name}</h2>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Code: {exam.code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
            {/* Duration Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-xl font-bold text-gray-900">
                    {exam.sampleDuration} <span className="text-sm">min</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Passing Score Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Passing Score</p>
                  <p className="text-xl font-bold text-gray-900">
                    {exam.passingScore}
                    <span className="text-sm">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Test Guidelines
              </h3>
            </div>

            {exam.sampleInstructions ? (
              <div
                className="prose prose-sm max-w-none bg-blue-50 rounded-lg p-4 border border-blue-100"
                dangerouslySetInnerHTML={{ __html: exam.sampleInstructions }}
              />
            ) : (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      This is a practice test to help you prepare for the main
                      examination.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Read each question carefully and select the most
                      appropriate answer.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You can navigate between questions using the question
                      palette.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Make sure to submit your test before the timer runs out.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Once submitted, you cannot change your answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Use this sample test to understand the exam pattern and
                      timing.
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Agreement Section */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer mt-0.5"
                />
                <span className="text-gray-900 text-sm">
                  I have read and understood all the test instructions and agree
                  to abide by the rules and regulations.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between items-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
              >
                Go Back
              </button>

              <button
                onClick={handleStart}
                disabled={!agreed}
                className={`px-8 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  agreed
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Start Sample Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!agreed && (
              <p className="text-center text-amber-600 text-xs mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Please agree to the terms before starting the sample test
              </p>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            Need assistance?{" "}
            <a
              href="/support"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
