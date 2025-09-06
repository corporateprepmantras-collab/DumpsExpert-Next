"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./TestPage.css";

const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

export default function TestPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [startTime] = useState(new Date());
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [exam, setExam] = useState({});

  const router = useRouter();
  //   const { slug } = params; // ✅ App Router slug param
  const slug = "sdfsdf%20sdfsf";
  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `http://${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/byProductSlug/${slug}`
        );
        const data = res.data;
        console.log("📦 Fetched question data:", data);

        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("Invalid question format");
        }

        setQuestions(data.data);
      } catch (err) {
        console.error("❌ Failed to fetch questions:", err);
        setQuestions([]);
      }
    };

    if (slug) fetchQuestions();
  }, [slug]);

  // Fetch Exam Info
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(
          `http://${process.env.NEXT_PUBLIC_BASE_URL}/api/exams/byslug/${slug}`
        );
        const fetchedExam = res.data;
        console.log("✅ Exam fetched:", fetchedExam);
        setExam(fetchedExam[0]);
      } catch (error) {
        console.error("❌ Failed to fetch exam:", error);
      }
    };

    if (slug) {
      console.log("🧪 slug:", slug);
      fetchExam();
    }
  }, [slug]);

  // Set timer
  useEffect(() => {
    if (exam && Object.keys(exam).length > 0) {
      console.log("✅ Updated exam state:", exam);
      console.log("timer", exam.sampleDuration);
      setTimeLeft(exam.sampleDuration * 60); // seconds
    }
  }, [exam, slug]);

  // Auto submit trigger
  useEffect(() => {
    if (autoSubmitTriggered && questions.length > 0) {
      handleSubmit();
    }
  }, [autoSubmitTriggered, questions]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Disable copy/paste
  useEffect(() => {
    const blockAction = (e) => {
      e.preventDefault();
      alert("❌ Copy, paste, and cut are disabled during the test.");
    };
    document.addEventListener("copy", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("cut", blockAction);
    return () => {
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("cut", blockAction);
    };
  }, []);

  // Disable right-click
  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      alert("❌ Right-click is disabled during the test.");
    };
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  // Restrict tab switching
  useEffect(() => {
    let blurCount = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurCount++;
        if (blurCount < 5) {
          alert(`⚠️ Do not switch tabs. ${5 - blurCount} warnings left.`);
        } else {
          alert("❌ Test auto-submitted due to tab switches.");
          setAutoSubmitTriggered(true);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Handle Answer Selection
  const handleAnswer = (qId, option) => {
    const question = questions.find((q) => q._id === qId);
    const isCheckbox = question?.questionType === "checkbox";

    setAnswers((prev) => {
      let updated;
      if (isCheckbox) {
        const current = Array.isArray(prev[qId]) ? prev[qId] : [];
        updated = current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option];
      } else {
        updated = option;
      }

      setUserAnswers((ua) => ({ ...ua, [qId]: updated }));
      return { ...prev, [qId]: updated };
    });

    setStatusMap((prev) => ({ ...prev, [qId]: "Answered" }));
  };

  // Mark for Review
  const markReview = (qId) => {
    setStatusMap((prev) => ({ ...prev, [qId]: "Review" }));
  };

  // Skip Question
  const skip = (qId) => {
    setStatusMap((prev) => ({ ...prev, [qId]: "Skipped" }));
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  // Go to Question
  const goToQuestion = (index) => {
    setCurrent(index);
    const qId = questions[index]._id;
    if (statusMap[qId] === "Not Visited") {
      setStatusMap((prev) => ({ ...prev, [qId]: "Visited" }));
    }
  };

  // Format Timer
  const formatTime = (sec) => {
    const min = String(Math.floor(sec / 60)).padStart(2, "0");
    const secStr = String(sec % 60).padStart(2, "0");
    return `${min}:${secStr}`;
  };

  // Submit Test
  const handleSubmit = async () => {
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);
    const studentId = localStorage.getItem("studentId");

    let wrongAnswers = 0;

    questions.forEach((q) => {
      const correct = q.correctAnswers?.sort().join(",") || "";
      const user = (
        Array.isArray(userAnswers[q._id])
          ? userAnswers[q._id]
          : [userAnswers[q._id]]
      )
        .sort()
        .join(",");
      if (correct !== user) {
        wrongAnswers++;
      }
    });

    const resultData = {
      studentId,
      examCode: slug,
      totalQuestions: questions.length,
      attempted: Object.keys(userAnswers).length,
      wrong: wrongAnswers,
      correct: questions.length - wrongAnswers,
      percentage: Math.round(
        ((questions.length - wrongAnswers) / questions.length) * 100
      ),
      duration,
      completedAt: new Date().toISOString(),
      questions,
      userAnswers,
    };

    try {
      const res = await axios.post(
        "http://${process.env.NEXT_PUBLIC_BASE_URL}/api/results/save",
        resultData
      );

      router.push(
        `/student/courses-exam/result?attempt=${res.data.attempt || 1}`
      );
    } catch (error) {
      console.error(
        "❌ Failed to save result:",
        error.response?.data || error.message
      );
      alert("Failed to save result. Try again.");
    }
  };

  // Loading state
  if (!questions?.length) {
    return <div className="text-center p-6">Loading questions...</div>;
  }

  const currentQuestion = questions[current];
  const selected = answers[currentQuestion._id];

  return (
    <div className="app-container">
      <div className="question-area">
        <h3 className="heading">Question</h3>
        <div className="mb-2">
          <strong>Q{current + 1}: </strong>
          <span>{stripHtml(currentQuestion.questionText)}</span>
        </div>

        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="Question"
            className="my-2 rounded border max-w-xs"
          />
        )}

        <div className="options mt-4 space-y-3">
          {currentQuestion.options.map((opt, i) => (
            <label key={i} className="option flex items-start gap-2">
              <input
                type={
                  currentQuestion.questionType === "checkbox"
                    ? "checkbox"
                    : "radio"
                }
                checked={
                  currentQuestion.questionType === "checkbox"
                    ? Array.isArray(selected) && selected.includes(opt.label)
                    : selected === opt.label
                }
                onChange={() => handleAnswer(currentQuestion._id, opt.label)}
              />
              <div>
                <div className="font-medium">
                  {opt.label}. {stripHtml(opt.text)}
                </div>
                {opt.image && (
                  <img
                    src={opt.image}
                    alt={`Option ${opt.label}`}
                    className="mt-1 max-w-[200px] border rounded"
                  />
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="btns mt-6 flex gap-4">
          <button
            onClick={() => markReview(currentQuestion._id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Mark for Review
          </button>
          <button
            onClick={() => skip(currentQuestion._id)}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Skip
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % questions.length)}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div className="sidebar">
        <h2 className="font-semibold mb-2">All Questions</h2>
        <div className="questions-grid grid grid-cols-5 gap-2">
          {questions.map((q, i) => (
            <div
              key={q._id}
              className={`q-btn text-sm px-2 py-1 rounded cursor-pointer text-center ${statusMap[
                q._id
              ]?.toLowerCase()}`}
              onClick={() => goToQuestion(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="bottom-bar bg-white border-t py-3 px-6 flex justify-between items-center shadow-lg">
          <span className="font-semibold">
            Time Left: {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
