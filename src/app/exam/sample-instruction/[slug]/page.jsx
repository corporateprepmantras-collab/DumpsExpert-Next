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
  Sparkles,
  ArrowRight,
  FlaskConical,
  Timer,
  TrendingUp,
  Zap,
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full border border-white/20">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-emerald-600 animate-spin relative z-10" />
            </div>
            <p className="text-gray-700 text-lg font-semibold mt-6">
              Loading sample test...
            </p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full border border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something Went Wrong
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full border border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Test Found
            </h2>
            <p className="text-gray-600 mb-6">
              No instructions are available for this sample test.
            </p>
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                <FlaskConical className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-sm">
              Sample Test
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Sample Test Instructions
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Practice and familiarize yourself before the main examination
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Exam Header */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-3">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Practice Mode</span>
                </div>
                <h2 className="text-4xl font-bold mb-3">{exam.name}</h2>
                <div className="flex items-center gap-3 text-white/90">
                  <Award className="w-5 h-5" />
                  <span className="text-lg font-semibold">
                    Code: {exam.code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gradient-to-br from-gray-50 to-white">
            {/* Duration Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:border-emerald-200">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Clock className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Duration
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {exam.sampleDuration}{" "}
                  <span className="text-lg text-gray-600">min</span>
                </p>
              </div>
            </div>

            {/* Marks Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:border-teal-200">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FileText className="w-7 h-7 text-teal-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Marks per Question
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {exam.eachQuestionMark}{" "}
                  <span className="text-lg text-gray-600">marks</span>
                </p>
              </div>
            </div>

            {/* Passing Score Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:border-cyan-200">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Target className="w-7 h-7 text-cyan-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Passing Score
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {exam.passingScore}
                  <span className="text-lg text-gray-600">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Test Guidelines
              </h3>
            </div>

            {exam.sampleInstructions ? (
              <div
                className="prose prose-emerald max-w-none bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-inner"
                dangerouslySetInnerHTML={{ __html: exam.sampleInstructions }}
              />
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-inner">
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      This is a practice test to help you prepare for the main
                      examination.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      Read each question carefully and select the most
                      appropriate answer.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      You can navigate between questions using the question
                      palette.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      Make sure to submit your test before the timer runs out.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      Once submitted, you cannot change your answers.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">
                      Use this sample test to understand the exam pattern and
                      timing.
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-emerald-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Why Take This Sample Test?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Get familiar with the exam interface and format</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Practice time management skills</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Identify areas that need more preparation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Build confidence before the actual exam</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-6 hover:border-emerald-300 transition-colors">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-gray-900 font-medium group-hover:text-emerald-600 transition-colors">
                    I have read and understood all the test instructions and
                    agree to abide by the rules and regulations.
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>

              <button
                onClick={handleStart}
                disabled={!agreed}
                className={`w-full sm:w-auto px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                  agreed
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 hover:shadow-xl hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FlaskConical className="w-6 h-6" />
                <span>Start Sample Test</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {!agreed && (
              <p className="text-center text-amber-600 text-sm mt-4 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please agree to the terms before starting the sample test
              </p>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Need assistance?{" "}
            <a
              href="/support"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
