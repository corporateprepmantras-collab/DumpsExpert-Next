// TestPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import "./TestPage.css";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [dragState, setDragState] = useState({ draggedItem: null, isLeft: null });
  const [isDataReady, setIsDataReady] = useState(false);
  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("🔄 Initializing data for slug:", slug);

        let studentData = null;
        let examData = null;
        let questionsData = [];

        // Fetch student data
        try {
          const studentRes = await axios.get("/api/user/me");
          if (studentRes.data && studentRes.data._id) {
            studentData = studentRes.data;
            console.log("✅ Student data loaded:", studentData._id);
          }
        } catch (studentError) {
          console.error("❌ Error fetching student:", studentError);
        }

        // Fetch exam data
        try {
          const examRes = await axios.get(`/api/exams/byslug/${slug}`);
          console.log("📊 Exam API response:", examRes.data);
          
          if (examRes.data && Array.isArray(examRes.data) && examRes.data.length > 0) {
            examData = examRes.data[0];
          } else if (examRes.data && examRes.data.data && Array.isArray(examRes.data.data) && examRes.data.data.length > 0) {
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
          const questionsRes = await axios.get(`/api/questions/product/${slug}`);
          const responseData = questionsRes.data;
          console.log("❓ Questions API response:", responseData);
          
          if (responseData.success && Array.isArray(responseData.data)) {
            questionsData = responseData.data;
            console.log("✅ Questions loaded:", questionsData.length);
          }
        } catch (questionsError) {
          console.error("❌ Error fetching questions:", questionsError);
        }

        // Set all states at once
        if (studentData) setStudent(studentData);
        if (examData) {
          setExam(examData);
          setTimeLeft((examData.sampleDuration || examData.duration || 60) * 60);
        }
        if (questionsData.length > 0) {
          setQuestions(questionsData);
          const initialStatus = {};
          const initialMatching = {};
          questionsData.forEach((q, index) => {
            initialStatus[q._id] = index === 0 ? "Visited" : "Not Visited";
            if (q.questionType === "matching") {
              initialMatching[q._id] = {};
            }
          });
          setStatusMap(initialStatus);
          setMatchingAnswers(initialMatching);
        }

        // Check if we have minimum required data
        const hasQuestions = questionsData.length > 0;
        const hasExam = examData !== null;
        const hasStudent = studentData !== null;
        
        console.log("📋 Final Data check:", { 
          hasQuestions, 
          hasExam, 
          hasStudent,
          questionsCount: questionsData.length,
          examId: examData?._id,
          studentId: studentData?._id
        });
        
        if (hasQuestions) {
          setIsDataReady(true);
          console.log("✅ Data ready - starting test");
        } else {
          console.error("❌ Insufficient data to start test");
        }

      } catch (error) {
        console.error("❌ Error initializing data:", error);
      }
    };

    if (slug) initializeData();
  }, [slug]);

  useEffect(() => {
    if (!isDataReady || !exam || questions.length === 0) return;

    console.log("⏰ Starting timer with timeLeft:", timeLeft);

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

  // Security measures
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

  // Drag and drop functions
  const handleDragStart = (questionId, itemId, isLeft) => {
    setDragState({ draggedItem: itemId, isLeft, questionId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (questionId, targetItemId, isLeft) => {
    if (!dragState.draggedItem) return;

    const { draggedItem, isLeft: draggedIsLeft, questionId: draggedQId } = dragState;
    
    if (draggedQId !== questionId) return;
    if (draggedIsLeft === isLeft) return;

    setMatchingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [draggedItem]: targetItemId
      }
    }));

    setStatusMap(prev => ({ ...prev, [questionId]: "Answered" }));
    setDragState({ draggedItem: null, isLeft: null });
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

    setStatusMap(prev => ({ ...prev, [qId]: "Answered" }));
  };

  const markReview = (qId) => {
    setStatusMap(prev => ({ ...prev, [qId]: "Review" }));
  };

  const skip = (qId) => {
    setStatusMap(prev => ({ ...prev, [qId]: "Skipped" }));
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

        // Check if all correct matches are present and correct
        Object.keys(correctMatches).forEach(leftId => {
          if (userMatches[leftId] !== correctMatches[leftId]) {
            allMatched = false;
          }
        });

        // Check if user has extra incorrect matches
        Object.keys(userMatches).forEach(leftId => {
          if (!correctMatches[leftId] || userMatches[leftId] !== correctMatches[leftId]) {
            allMatched = false;
          }
        });

        if (hasAttempt) {
          attempted++;
          if (allMatched && Object.keys(userMatches).length === Object.keys(correctMatches).length) {
            correct++;
          } else {
            wrong++;
          }
        }
      } else {
        if (answers[q._id]) {
          attempted++;
          if (q.questionType === "checkbox") {
            const userAnswer = Array.isArray(answers[q._id]) ? answers[q._id] : [answers[q._id]];
            const correctAnswer = q.correctAnswers || [];
            const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
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

// Update the TestPage.jsx handleSubmit function to fix the local result redirect
const handleSubmit = async () => {
  console.log("🚀 Submitting test...");
  console.log("📊 Current state:", { 
    isDataReady, 
    hasExam: !!exam, 
    hasQuestions: questions.length > 0, 
    hasStudent: !!student 
  });

  if (!isDataReady || questions.length === 0) {
    console.error("❌ Cannot submit: Data not ready or no questions");
    alert("Test data is not ready. Please wait...");
    return;
  }

  // Create student object if not available
  const submitStudent = student || { 
    _id: `temp_${Date.now()}`,
    name: "Guest Student"
  };

  // Create exam object if not available
  const submitExam = exam || {
    _id: `temp_exam_${slug}`,
    code: slug,
    sampleDuration: 60
  };

  const { correct, attempted, wrong } = calculateScore();
  const totalQuestions = questions.length;

  const payload = {
    studentId: submitStudent._id,
    examCode: submitExam.code || slug,
    examId: submitExam._id,
    totalQuestions,
    attempted,
    correct,
    wrong,
    percentage: totalQuestions > 0 ? ((correct / totalQuestions) * 100).toFixed(2) : 0,
    duration: (submitExam.sampleDuration || 60) * 60 - timeLeft,
    questions: questions.map((q) => ({
      question: q.questionText,
      questionType: q.questionType,
      correctAnswer: q.questionType === "matching" 
        ? q.matchingPairs?.correctMatches 
        : q.correctAnswers,
      selectedAnswer: q.questionType === "matching" 
        ? matchingAnswers[q._id] 
        : answers[q._id] || null,
    })),
    userAnswers: {
      singleChoice: answers,
      matching: matchingAnswers
    },
  };

  console.log("📤 Submission payload:", payload);

  try {
    const res = await fetch("/api/results/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    console.log("✅ Save result response:", data);
    
    if (data.success) {
      // For both real and temp students, redirect to result page
      if (data.isTempStudent) {
        // For temp students, use local result page with query params
        router.push(`/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`);
      } else {
        // For real students, use the saved result ID
        router.push(`/student/result/${data.data._id}`);
      }
    } else {
      // If save fails, show results with local data
      router.push(`/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`);
    }
  } catch (error) {
    console.error("❌ Error saving result:", error);
    // Fallback: show results with local data
    router.push(`/student/result/local?correct=${correct}&total=${totalQuestions}&attempted=${attempted}`);
  }
};

  const renderMatchingQuestion = (question) => {
    const leftItems = question.matchingPairs?.leftItems || [];
    const rightItems = question.matchingPairs?.rightItems || [];
    const currentMatches = matchingAnswers[question._id] || {};

    return (
      <div className="matching-container">
        <div className="matching-columns">
          <div className="left-column">
            <h4>Left Items</h4>
            {leftItems.map((item) => (
              <div
                key={item._id}
                className="matching-item left-item"
                draggable
                onDragStart={() => handleDragStart(question._id, item.id, true)}
                onDragOver={handleDragOver}
              >
                <strong>{item.id}:</strong> {item.text}
                {item.image && (
                  <img src={item.image} alt={item.text} className="matching-image" />
                )}
              </div>
            ))}
          </div>
          
          <div className="right-column">
            <h4>Right Items</h4>
            {rightItems.map((item) => {
              const matchedLeftId = Object.keys(currentMatches).find(
                leftId => currentMatches[leftId] === item.id
              );
              
              return (
                <div
                  key={item._id}
                  className={`matching-item right-item ${matchedLeftId ? 'matched' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(question._id, item.id, false)}
                >
                  <strong>{item.id}:</strong> {item.text}
                  {item.image && (
                    <img src={item.image} alt={item.text} className="matching-image" />
                  )}
                  {matchedLeftId && (
                    <div className="match-indicator">← Matched with {matchedLeftId}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="matches-display">
          <h4>Current Matches</h4>
          {Object.keys(currentMatches).length === 0 ? (
            <p>No matches yet. Drag left items to right items.</p>
          ) : (
            <div className="match-list">
              {Object.keys(currentMatches).map(leftId => {
                const leftItem = leftItems.find(item => item.id === leftId);
                const rightItem = rightItems.find(item => item.id === currentMatches[leftId]);
                return (
                  <div key={leftId} className="match-pair">
                    <span className="left-match">{leftId}: {leftItem?.text}</span>
                    <span className="arrow"> → </span>
                    <span className="right-match">{currentMatches[leftId]}: {rightItem?.text}</span>
                  </div>
                );
              })}
            </div>
          )}
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
        <div className="mb-2">
          <strong>Q{current + 1}: </strong>
          <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </div>

        {question.questionImage && (
          <img
            src={question.questionImage}
            alt="Question"
            className="my-2 rounded border max-w-xs"
          />
        )}

        <div className="options mt-4 space-y-3">
          {question.options.map((opt, i) => (
            <label key={i} className="option flex items-start gap-2">
              <input
                type={question.questionType === "checkbox" ? "checkbox" : "radio"}
                checked={
                  question.questionType === "checkbox"
                    ? Array.isArray(selected) && selected.includes(opt.label)
                    : selected === opt.label
                }
                onChange={() => handleAnswer(question._id, opt.label)}
              />
              <div>
                <div className="font-medium">
                  {opt.label}. <span dangerouslySetInnerHTML={{ __html: opt.text }} />
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
      </>
    );
  };

  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p>Loading test questions...</p>
          <p className="text-sm text-gray-500 mt-2">
            Preparing your test environment...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">No Questions Available</h2>
          <p className="mt-2">There are no questions available for this test.</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[current];

  return (
    <div className="app-container">
      <div className="question-area">
        <h3 className="heading">Question {current + 1} of {questions.length}</h3>
        {renderQuestion(currentQuestion)}

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
        <div className="questions-grid">
          {questions.map((q, i) => (
            <div
              key={q._id}
              className={`q-btn ${statusMap[q._id]?.toLowerCase() || "not-visited"}`}
              onClick={() => goToQuestion(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="bottom-bar">
          <span className="font-semibold">
            Time Left: {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleSubmit}
            className="submit-btn"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}