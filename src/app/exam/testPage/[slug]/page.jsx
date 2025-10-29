// TestPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

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
            // ✨ FILTER ONLY SAMPLE QUESTIONS
            questionsData = responseData.data.filter(q => q.isSample === true);
            console.log("✅ Sample questions loaded:", questionsData.length);
            console.log("📋 Filtered out:", responseData.data.length - questionsData.length, "non-sample questions");
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
          console.error("❌ No sample questions available");
        }

      } catch (error) {
        console.error("❌ Error initializing data:", error);
      }
    };

    if (slug) initializeData();
  }, [slug]);

  // Initialize matching options when questions load
  useEffect(() => {
    if (questions.length > 0) {
      const initializedOptions = {};
      
      questions.forEach(question => {
        if (question.questionType === "matching") {
          initializedOptions[question._id] = {};
          
          const leftItems = question.matchingPairs?.leftItems || [];
          const rightItems = question.matchingPairs?.rightItems || [];
          const correctMatches = question.matchingPairs?.correctMatches || {};
          
          leftItems.forEach(leftItem => {
            const correctRightId = correctMatches[leftItem.id];
            const correctItem = rightItems.find(item => item.id === correctRightId);
            
            let options = [];
            
            if (rightItems.length <= 4) {
              // Use all items if 4 or fewer
              options = [...rightItems];
            } else {
              // Use correct item + 3 random wrong items
              const wrongItems = rightItems.filter(item => item.id !== correctRightId);
              const randomWrongItems = [...wrongItems]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
              options = correctItem ? [correctItem, ...randomWrongItems] : randomWrongItems;
            }
            
            // Shuffle the options
            initializedOptions[question._id][leftItem.id] = options.sort(() => Math.random() - 0.5);
          });
        }
      });
      
      setMatchingOptions(initializedOptions);
    }
  }, [questions]);

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

  // Matching dropdown handler
  const handleMatchingSelect = (questionId, leftItemId, selectedRightItemId) => {
    setMatchingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [leftItemId]: selectedRightItemId
      }
    }));

    setStatusMap(prev => ({ ...prev, [questionId]: "Answered" }));
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

// TestPage.jsx - Updated handleSubmit function

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
  let submitStudent;
  let submitExam;

  if (!student) {
    submitStudent = { 
      userInfoId: `temp_${Date.now()}`,
      name: "Guest Student"
    };

    submitExam = {
      _id: `temp_exam_${slug}`,
      code: slug,
      sampleDuration: 60
    };
  } else {
    submitStudent = student;
    submitExam = exam;
  }
  console.log("👤 Submitting for student:", submitStudent);

  const { correct, attempted, wrong } = calculateScore();
  const totalQuestions = questions.length;

  // ✨ UPDATED: Include full question details matching your schema
  const detailedQuestions = questions.map((q) => {
    let correctAnswer;
    let selectedAnswer;
    let isCorrect = false;

    if (q.questionType === "matching") {
      correctAnswer = q.matchingPairs?.correctMatches || {};
      selectedAnswer = matchingAnswers[q._id] || {};
      
      // Check if all matches are correct
      const correctMatches = q.matchingPairs?.correctMatches || {};
      const userMatches = matchingAnswers[q._id] || {};
      
      let allMatched = true;
      Object.keys(correctMatches).forEach(leftId => {
        if (userMatches[leftId] !== correctMatches[leftId]) {
          allMatched = false;
        }
      });
      
      isCorrect = allMatched && Object.keys(userMatches).length === Object.keys(correctMatches).length;
      
    } else if (q.questionType === "checkbox") {
      correctAnswer = q.correctAnswers || [];
      selectedAnswer = answers[q._id] || [];
      isCorrect = JSON.stringify([...selectedAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
      
    } else {
      // Single choice (radio/mcq)
      correctAnswer = q.correctAnswers?.[0] || null;
      selectedAnswer = answers[q._id] || null;
      isCorrect = selectedAnswer === correctAnswer;
    }

    // ✅ Map options with complete data (matching your schema)
    const mappedOptions = q.options?.map(opt => ({
      label: opt.label,
      text: opt.text,
      images: opt.images || [], // ✅ Array of images
    })) || [];

    // ✅ Map matching pairs properly
    const mappedMatchingPairs = q.questionType === "matching" && q.matchingPairs ? {
      leftItems: q.matchingPairs.leftItems?.map(item => ({
        id: item.id,
        text: item.text,
        images: item.images || [] // ✅ Array of images
      })) || [],
      rightItems: q.matchingPairs.rightItems?.map(item => ({
        id: item.id,
        text: item.text,
        images: item.images || [] // ✅ Array of images
      })) || [],
      correctMatches: q.matchingPairs.correctMatches || {}
    } : null;

    return {
      questionId: q._id,
      questionText: q.questionText, // ✅ Correct field name
      questionImages: q.questionImages || [], // ✅ Array of images
      questionType: q.questionType,
      options: mappedOptions, // ✅ Complete options with images array
      matchingPairs: mappedMatchingPairs, // ✅ Complete matching data
      correctAnswer,
      selectedAnswer,
      isCorrect,
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      explanation: q.explanation || null,
      subject: q.subject || null,
      topic: q.topic || null
    };
  });

  const payload = {
    studentId: submitStudent.userInfoId,
    examCode: submitExam.code || slug,
    examId: submitExam._id,
    totalQuestions,
    attempted,
    correct,
    wrong,
    percentage: totalQuestions > 0 ? ((correct / totalQuestions) * 100).toFixed(2) : 0,
    duration: (submitExam.sampleDuration || 60) * 60 - timeLeft,
    questions: detailedQuestions, // ✅ Now includes full details
    userAnswers: {
      singleChoice: answers,
      matching: matchingAnswers
    },
  };

  console.log("📤 Submission payload:", payload);
  console.log("🔍 First question details:", detailedQuestions[0]);
  console.log("📝 First question options:", detailedQuestions[0]?.options);

  try {
    const res = await fetch("/api/results/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    console.log("✅ Save result response:", data);
    
    if (data.success) {
      if (data.isTempStudent) {
        // For temp students, pass detailed results in URL (base64 encoded for complex data)
        const resultsData = btoa(JSON.stringify({
          correct,
          total: totalQuestions,
          attempted,
          questions: detailedQuestions
        }));
        router.push(`/student/result/local?data=${resultsData}`);
      } else {
        router.push(`/student/result/${data.data._id}`);
      }
    } else {
      const resultsData = btoa(JSON.stringify({
        correct,
        total: totalQuestions,
        attempted,
        questions: detailedQuestions
      }));
      router.push(`/student/result/local?data=${resultsData}`);
    }
  } catch (error) {
    console.error("❌ Error saving result:", error);
    toast.error(error?.message);
    const resultsData = btoa(JSON.stringify({
      correct,
      total: totalQuestions,
      attempted,
      questions: detailedQuestions
    }));
    router.push(`/student/result/local?data=${resultsData}`);
  }
};

  const renderMatchingQuestion = (question) => {
    const leftItems = question.matchingPairs?.leftItems || [];
    const rightItems = question.matchingPairs?.rightItems || [];
    const currentMatches = matchingAnswers[question._id] || {};

    return (
      <div className="flex flex-col space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Match the items from the left column with the correct options from the right column using the dropdown menus.
          </p>
        </div>
        
        {/* Matching Questions List */}
        <div className="space-y-4">
          {leftItems.map((leftItem, index) => {
            const currentMatchingOptions = getMatchingOptions(question._id, leftItem.id);
            
            return (
              <div key={leftItem._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Question Number */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Left Item Content */}
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium mb-2">
                      {leftItem.text}
                    </div>
                    {leftItem.image && (
                      <img 
                        src={leftItem.image} 
                        alt={leftItem.text} 
                        className="max-w-full h-auto max-h-32 rounded border"
                      />
                    )}
                  </div>

                  {/* Connector */}
                  <div className="hidden lg:flex text-gray-500 font-bold text-xl mx-2">
                    →
                  </div>

                  {/* Dropdown Container */}
                  <div className="flex-1">
                    <select
                      value={currentMatches[leftItem.id] || ""}
                      onChange={(e) => handleMatchingSelect(question._id, leftItem.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select match...</option>
                      {currentMatchingOptions.map((rightItem) => (
                        <option key={rightItem._id} value={rightItem.id}>
                          {rightItem.text}
                        </option>
                      ))}
                    </select>

                    {/* Show selected right item image */}
                    {currentMatches[leftItem.id] && (() => {
                      const selectedRightItem = rightItems.find(item => item.id === currentMatches[leftItem.id]);
                      return selectedRightItem?.image ? (
                        <div className="mt-3 p-2 bg-gray-50 rounded border">
                          <img 
                            src={selectedRightItem.image} 
                            alt={selectedRightItem.text} 
                            className="max-w-full h-auto max-h-24 rounded mx-auto"
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

        {/* Right Items Reference */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">Available Options:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rightItems.map((rightItem) => (
              <div key={rightItem._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="font-medium text-gray-700 mb-2">
                  {rightItem.text}
                </div>
                {rightItem.image && (
                  <img 
                    src={rightItem.image} 
                    alt={rightItem.text} 
                    className="max-w-full h-auto max-h-24 rounded border mx-auto"
                  />
                )}
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
          <strong className="text-lg">Q{current + 1}: </strong>
          <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </div>

        {question.questionImage && (
          <img
            src={question.questionImage}
            alt="Question"
            className="my-4 rounded-lg border max-w-full h-auto max-h-64"
          />
        )}

        <div className="space-y-3 mt-6">
          {question.options.map((opt, i) => (
            <label key={i} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type={question.questionType === "checkbox" ? "checkbox" : "radio"}
                checked={
                  question.questionType === "checkbox"
                    ? Array.isArray(selected) && selected.includes(opt.label)
                    : selected === opt.label
                }
                onChange={() => handleAnswer(question._id, opt.label)}
                className="mt-1 transform scale-125"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {opt.label}. <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                </div>
                {opt.image && (
                  <img
                    src={opt.image}
                    alt={`Option ${opt.label}`}
                    className="mt-2 max-w-full h-auto max-h-32 rounded border"
                  />
                )}
              </div>
            </label>
          ))}
        </div>
      </>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'answered': return 'bg-green-500 text-white';
      case 'skipped': return 'bg-red-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'visited': return 'bg-blue-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sample test questions...</p>
          <p className="text-sm text-gray-500 mt-2">
            Preparing your test environment...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Sample Questions Available</h2>
          <p className="text-gray-600 mb-4">There are no sample questions available for this test at the moment.</p>
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
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Question Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Question {current + 1} of {questions.length}
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              Sample Test
            </span>
          </div>
          
          <div className="min-h-[400px]">
            {renderQuestion(currentQuestion)}
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => markReview(currentQuestion._id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Mark for Review
            </button>
            <button
              onClick={() => skip(currentQuestion._id)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % questions.length)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors ml-auto"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-gray-800 mb-4 text-lg">Question Palette</h2>
          
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2 mb-6">
            {questions.map((q, i) => (
              <button
                key={q._id}
                className={`w-10 h-10 rounded-lg font-medium transition-all hover:scale-105 ${getStatusColor(statusMap[q._id])} ${
                  current === i ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                }`}
                onClick={() => goToQuestion(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Time Left:</span>
              <span className={`font-mono font-bold text-lg ${
                timeLeft < 300 ? 'text-red-600' : 'text-gray-800'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Submit Test
            </button>
          </div>

          {/* Status Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Status Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Skipped</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Visited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}