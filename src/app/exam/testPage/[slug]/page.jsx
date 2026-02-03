// TestPage.jsx - Updated for Multiple Images
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const isExamPublished = (examDoc) => {
  if (!examDoc) return false;

  const boolFlags = [
    examDoc.isPublished,
    examDoc.published,
    examDoc.publishSettings?.isPublished,
    examDoc.publishSettings?.published,
  ];

  if (boolFlags.some((flag) => flag === true)) {
    return true;
  }

  if (boolFlags.some((flag) => flag === false)) {
    return false;
  }

  const statusCandidates = [
    examDoc.status,
    examDoc.state,
    examDoc.publishStatus,
  ]
    .filter(Boolean)
    .map((value) => value.toString().toLowerCase());

  if (statusCandidates.some((status) => status.includes("draft"))) {
    return false;
  }

  if (
    statusCandidates.some((status) =>
      ["published", "active", "live"].includes(status),
    )
  ) {
    return true;
  }

  return true;
};

const isQuestionPublished = (questionDoc) => {
  if (!questionDoc) return false;

  const boolFlags = [
    questionDoc.isPublished,
    questionDoc.isSamplePublished,
    questionDoc.publishSettings?.isPublished,
    questionDoc.publishSettings?.samplePublished,
  ];

  if (boolFlags.some((flag) => flag === true)) {
    return true;
  }

  if (boolFlags.some((flag) => flag === false)) {
    return false;
  }

  const statusCandidates = [
    questionDoc.status,
    questionDoc.publishStatus,
    questionDoc.visibility,
  ]
    .filter(Boolean)
    .map((value) => value.toString().toLowerCase());

  if (
    statusCandidates.some((status) =>
      ["draft", "unpublished", "inactive"].includes(status),
    )
  ) {
    return false;
  }

  if (
    statusCandidates.some((status) =>
      ["published", "active", "live"].includes(status),
    )
  ) {
    return true;
  }

  return true;
};

// Image Gallery Component for multiple images
const ImageGallery = ({ images, alt = "Image" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const validImages = images.filter((img) => img && img.trim() !== "");

  if (validImages.length === 0) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length,
    );
  };

  return (
    <div className="my-4">
      <div className="relative group">
        <img
          src={validImages[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
        />

        {validImages.length > 1 && (
          <>
            {/* Navigation Buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {validImages.length}
            </div>

            {/* Thumbnail Dots */}
            <div className="flex justify-center gap-1 mt-2">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [matchingOptions, setMatchingOptions] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [examUnavailable, setExamUnavailable] = useState(false);
  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsDataReady(false);
        setExamUnavailable(false);

        let studentData = null;
        let examData = null;
        let questionsData = [];

        // Fetch student data
        try {
          const studentRes = await axios.get("/api/user/me");
          if (studentRes.data && studentRes.data.id) {
            studentData = studentRes.data;
            console.log("✅ Student data loaded:", studentData.id);
          }
        } catch (studentError) {
          console.error("❌ Error fetching student:", studentError);
        }

        // Fetch exam data
        try {
          const examRes = await axios.get(`/api/exams/byslug/${slug}`);
          console.log("📊 Exam API response:", examRes.data);

          if (
            examRes.data &&
            Array.isArray(examRes.data) &&
            examRes.data.length > 0
          ) {
            examData = examRes.data[0];
          } else if (
            examRes.data &&
            examRes.data.data &&
            Array.isArray(examRes.data.data) &&
            examRes.data.data.length > 0
          ) {
            examData = examRes.data.data[0];
          } else if (examRes.data && examRes.data._id) {
            examData = examRes.data;
          }

          if (examData) {
            console.log("✅ Exam data loaded:", examData._id);
          }
        } catch (examError) {
          console.error("❌ Error fetching exam:", examError);
        }

        // Fetch questions
        try {
          const questionsRes = await axios.get(
            `/api/questions/product/${slug}`,
          );
          const responseData = questionsRes.data;
          console.log("❓ Questions API response:", responseData);

          if (responseData.success && Array.isArray(responseData.data)) {
            questionsData = responseData.data.filter(
              (q) => q.isSample === true,
            );
            console.log("✅ Sample questions loaded:", questionsData.length);
          }
        } catch (questionsError) {
          console.error("❌ Error fetching questions:", questionsError);
        }

        if (studentData) {
          setStudent(studentData);
        }

        if (!examData || !isExamPublished(examData)) {
          setExam(null);
          setQuestions([]);
          setStatusMap({});
          setMatchingAnswers({});
          setExamUnavailable(true);
          setIsDataReady(true);
          return;
        }

        setExam(examData);
        setTimeLeft((examData.sampleDuration || examData.duration || 60) * 60);

        const sampleQuestions = Array.isArray(questionsData)
          ? questionsData.filter(
              (q) => q.isSample === true && isQuestionPublished(q),
            )
          : [];

        setQuestions(sampleQuestions);

        const initialStatus = {};
        const initialMatching = {};

        sampleQuestions.forEach((q, index) => {
          initialStatus[q._id] = index === 0 ? "Visited" : "Not Visited";
          if (q.questionType === "matching") {
            initialMatching[q._id] = {};
          }
        });

        setStatusMap(initialStatus);
        setMatchingAnswers(initialMatching);
        setCurrent(0);
        setIsDataReady(true);
      } catch (error) {
        console.error("❌ Error initializing data:", error);
        setIsDataReady(true);
      }
    };

    if (slug) initializeData();
  }, [slug]);

  useEffect(() => {
    if (questions.length > 0) {
      const initializedOptions = {};

      questions.forEach((question) => {
        if (question.questionType === "matching") {
          initializedOptions[question._id] = {};

          const leftItems = question.matchingPairs?.leftItems || [];
          const rightItems = question.matchingPairs?.rightItems || [];
          const correctMatches = question.matchingPairs?.correctMatches || {};

          leftItems.forEach((leftItem) => {
            const correctRightId = correctMatches[leftItem.id];
            const correctItem = rightItems.find(
              (item) => item.id === correctRightId,
            );

            let options = [];

            if (rightItems.length <= 4) {
              options = [...rightItems];
            } else {
              const wrongItems = rightItems.filter(
                (item) => item.id !== correctRightId,
              );
              const randomWrongItems = [...wrongItems]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
              options = correctItem
                ? [correctItem, ...randomWrongItems]
                : randomWrongItems;
            }

            initializedOptions[question._id][leftItem.id] = options.sort(
              () => Math.random() - 0.5,
            );
          });
        }
      });

      setMatchingOptions(initializedOptions);
    } else {
      setMatchingOptions({});
    }
  }, [questions]);

  useEffect(() => {
    if (!isDataReady || !exam || questions.length === 0) return;

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
  }, [isDataReady, exam, questions]);

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

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  useEffect(() => {
    let blurCount = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurCount++;
        if (blurCount < 5) {
          alert(`⚠️ Do not switch tabs. ${5 - blurCount} warnings left.`);
        } else {
          alert("❌ Test auto-submitted due to tab switches.");
          handleSubmit();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleMatchingSelect = (
    questionId,
    leftItemId,
    selectedRightItemId,
  ) => {
    setMatchingAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [leftItemId]: selectedRightItemId,
      },
    }));

    setStatusMap((prev) => ({ ...prev, [questionId]: "Answered" }));
  };

  const getMatchingOptions = (questionId, leftItemId) => {
    return matchingOptions[questionId]?.[leftItemId] || [];
  };

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
      return { ...prev, [qId]: updated };
    });

    setStatusMap((prev) => ({ ...prev, [qId]: "Answered" }));
  };

  const markReview = (qId) => {
    setStatusMap((prev) => ({ ...prev, [qId]: "Review" }));
  };

  const skip = (qId) => {
    setStatusMap((prev) => ({ ...prev, [qId]: "Skipped" }));
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  const goToQuestion = (index) => {
    setCurrent(index);
    const qId = questions[index]._id;
    if (statusMap[qId] === "Not Visited") {
      setStatusMap((prev) => ({ ...prev, [qId]: "Visited" }));
    }
  };

  const formatTime = (sec) => {
    const min = String(Math.floor(sec / 60)).padStart(2, "0");
    const secStr = String(sec % 60).padStart(2, "0");
    return `${min}:${secStr}`;
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    let wrong = 0;

    questions.forEach((q) => {
      if (q.questionType === "matching") {
        const userMatches = matchingAnswers[q._id] || {};
        const correctMatches = q.matchingPairs?.correctMatches || {};

        let allMatched = true;
        let hasAttempt = Object.keys(userMatches).length > 0;

        Object.keys(correctMatches).forEach((leftId) => {
          if (userMatches[leftId] !== correctMatches[leftId]) {
            allMatched = false;
          }
        });

        Object.keys(userMatches).forEach((leftId) => {
          if (
            !correctMatches[leftId] ||
            userMatches[leftId] !== correctMatches[leftId]
          ) {
            allMatched = false;
          }
        });

        if (hasAttempt) {
          attempted++;
          if (
            allMatched &&
            Object.keys(userMatches).length ===
              Object.keys(correctMatches).length
          ) {
            correct++;
          } else {
            wrong++;
          }
        }
      } else {
        if (answers[q._id]) {
          attempted++;
          if (q.questionType === "checkbox") {
            const userAnswer = Array.isArray(answers[q._id])
              ? answers[q._id]
              : [answers[q._id]];
            const correctAnswer = q.correctAnswers || [];
            const isCorrect =
              JSON.stringify(userAnswer.sort()) ===
              JSON.stringify(correctAnswer.sort());
            if (isCorrect) {
              correct++;
            } else {
              wrong++;
            }
          } else {
            if (answers[q._id] === q.correctAnswers?.[0]) {
              correct++;
            } else {
              wrong++;
            }
          }
        }
      }
    });

    return { correct, attempted, wrong };
  };

  const handleSubmit = async () => {
    if (!isDataReady || questions.length === 0) {
      alert("Test data is not ready. Please wait...");
      return;
    }

    let submitStudent;
    let submitExam;

    if (!student) {
      submitStudent = {
        userInfoId: `temp_${Date.now()}`,
        name: "Guest Student",
      };

      submitExam = {
        _id: `temp_exam_${slug}`,
        code: slug,
        sampleDuration: 60,
      };
    } else {
      submitStudent = student;
      submitExam = exam;
    }

    const { correct, attempted, wrong } = calculateScore();
    const totalQuestions = questions.length;

    const payload = {
      studentId: submitStudent.userInfoId,
      examCode: submitExam.code || slug,
      examId: submitExam._id,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage:
        totalQuestions > 0 ? ((correct / totalQuestions) * 100).toFixed(2) : 0,
      duration: (submitExam.sampleDuration || 60) * 60 - timeLeft,
      questions: questions.map((q) => ({
        question: q.questionText,
        questionType: q.questionType,
        correctAnswer:
          q.questionType === "matching"
            ? q.matchingPairs?.correctMatches
            : q.correctAnswers,
        selectedAnswer:
          q.questionType === "matching"
            ? matchingAnswers[q._id]
            : answers[q._id] || null,
      })),
      userAnswers: {
        singleChoice: answers,
        matching: matchingAnswers,
      },
    };

    try {
      const res = await fetch("/api/results/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (data.isTempStudent) {
          router.push(
            `/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`,
          );
        } else {
          router.push(`/student/result/${data.data._id}`);
        }
      } else {
        router.push(
          `/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`,
        );
      }
    } catch (error) {
      console.error("❌ Error saving result:", error);
      toast.error(error?.message);
      router.push(
        `/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`,
      );
    }
  };

  const renderMatchingQuestion = (question) => {
    const leftItems = question.matchingPairs?.leftItems || [];
    const rightItems = question.matchingPairs?.rightItems || [];
    const currentMatches = matchingAnswers[question._id] || {};

    return (
      <div className="flex flex-col space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Match the items from the left column with the correct options from
            the right column using the dropdown menus.
          </p>
        </div>

        <div className="space-y-4">
          {leftItems.map((leftItem, index) => {
            const currentMatchingOptions = getMatchingOptions(
              question._id,
              leftItem.id,
            );

            return (
              <div
                key={leftItem._id || leftItem.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-gray-800 font-medium mb-2">
                      {leftItem.text}
                    </div>
                    {/* 🆕 Multiple images for left item */}
                    <ImageGallery
                      images={leftItem.images}
                      alt={`Left item ${leftItem.id}`}
                    />
                  </div>

                  <div className="hidden lg:flex text-gray-500 font-bold text-xl mx-2">
                    →
                  </div>

                  <div className="flex-1">
                    <select
                      value={currentMatches[leftItem.id] || ""}
                      onChange={(e) =>
                        handleMatchingSelect(
                          question._id,
                          leftItem.id,
                          e.target.value,
                        )
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select match...</option>
                      {currentMatchingOptions.map((rightItem) => (
                        <option
                          key={rightItem._id || rightItem.id}
                          value={rightItem.id}
                        >
                          {rightItem.text}
                        </option>
                      ))}
                    </select>

                    {/* 🆕 Show selected right item images */}
                    {currentMatches[leftItem.id] &&
                      (() => {
                        const selectedRightItem = rightItems.find(
                          (item) => item.id === currentMatches[leftItem.id],
                        );
                        return selectedRightItem?.images?.length > 0 ? (
                          <div className="mt-3 p-2 bg-gray-50 rounded border">
                            <ImageGallery
                              images={selectedRightItem.images}
                              alt={`Selected ${selectedRightItem.id}`}
                            />
                          </div>
                        ) : null;
                      })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">
            Available Options:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rightItems.map((rightItem) => (
              <div
                key={rightItem._id || rightItem.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="font-medium text-gray-700 mb-2">
                  {rightItem.text}
                </div>
                {/* 🆕 Multiple images for right item */}
                <ImageGallery
                  images={rightItem.images}
                  alt={`Right item ${rightItem.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (question) => {
    const selected = answers[question._id];

    if (question.questionType === "matching") {
      return renderMatchingQuestion(question);
    }

    return (
      <>
        <div className="mb-4">
          <strong className="text-base">Q{current + 1}: </strong>
          <span
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />
        </div>

        {/* 🆕 Multiple question images */}
        <ImageGallery images={question.questionImages} alt="Question" />

        <div className="space-y-3 mt-6">
          {question.options.map((opt, i) => (
            <label
              key={i}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm"
            >
              <input
                type={
                  question.questionType === "checkbox" ? "checkbox" : "radio"
                }
                checked={
                  question.questionType === "checkbox"
                    ? Array.isArray(selected) && selected.includes(opt.label)
                    : selected === opt.label
                }
                onChange={() => handleAnswer(question._id, opt.label)}
                className="mt-1 transform scale-110"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {opt.label}.{" "}
                  <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                </div>
                {/* 🆕 Multiple option images */}
                <ImageGallery images={opt.images} alt={`Option ${opt.label}`} />
              </div>
            </label>
          ))}
        </div>
      </>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "answered":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "skipped":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      case "review":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "visited":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.values(statusMap).filter(
    (status) => status?.toLowerCase() === "answered",
  ).length;
  const reviewCount = Object.values(statusMap).filter(
    (status) => status?.toLowerCase() === "review",
  ).length;
  const skippedCount = Object.values(statusMap).filter(
    (status) => status?.toLowerCase() === "skipped",
  ).length;
  const progress = totalQuestions
    ? Math.round(((current + 1) / totalQuestions) * 100)
    : 0;

  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sample test questions...</p>
        </div>
      </div>
    );
  }

  if (examUnavailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Exam Not Available
          </h2>
          <p className="text-gray-600 mb-4">
            We could not find a published version of this exam. Please check
            back later or contact support if you believe this is an error.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Published Sample Questions Available
          </h2>
          <p className="text-gray-600 mb-4">
            There are no published sample questions available for this test at
            the moment.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[current];

  return (
    <div className="min-h-screen bg-white pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Question {current + 1}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {exam?.code || slug}
              </span>
            </div>

            <div className="mt-6">{renderQuestion(currentQuestion)}</div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 text-sm">
              <button
                onClick={() => markReview(currentQuestion._id)}
                className="rounded-full border border-amber-200 bg-amber-100 px-5 py-2 font-medium text-amber-700 transition hover:border-amber-300"
              >
                Mark for Review
              </button>
              <button
                onClick={() => skip(currentQuestion._id)}
                className="rounded-full border border-slate-200 bg-slate-100 px-5 py-2 font-medium text-slate-700 transition hover:border-slate-300"
              >
                Skip
              </button>
              <button
                onClick={() =>
                  setCurrent((prev) => (prev + 1) % totalQuestions)
                }
                className="ml-auto rounded-full bg-blue-600 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Next Question
              </button>
            </div>
          </main>
        </div>

        <aside className="w-full max-w-xs space-y-6 self-start lg:sticky lg:top-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Question Palette
              </h3>

              <span className="text-xs uppercase text-slate-400">Jump</span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-900">
                    {exam?.title || exam?.name || "Sample Practice Test"}
                  </h1>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-blue-700">
                    Sample Test
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Practice the live exam flow with curated sample questions and
                  track your progress as you go.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] md:justify-end">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                  Ans {answeredCount}
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-700">
                  Review {reviewCount}
                </span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 font-medium text-rose-700">
                  Skip {skippedCount}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {questions.map((q, i) => (
                <button
                  key={q._id}
                  className={`h-9 w-9 rounded-lg text-xs font-semibold transition ${getStatusColor(
                    statusMap[q._id],
                  )} ${
                    current === i
                      ? "shadow ring-2 ring-blue-400"
                      : "hover:-translate-y-0.5 hover:shadow"
                  }`}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[10px]">
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
                  <span>
                    Question {current + 1} of {totalQuestions}
                  </span>
                  <span>{progress}% Complete</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-medium uppercase text-slate-500">
                <span>Time Left</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="mt-4 w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Submit Test
              </button>
            </div>
            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                <span>Skipped</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                <span>Visited</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
