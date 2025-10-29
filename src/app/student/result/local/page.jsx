// app/student/result/local/page.jsx - FIXED with proper question display
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LocalResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      
      if (dataParam) {
        const decodedData = JSON.parse(atob(dataParam));
        setResult({
          ...decodedData,
          percentage: decodedData.total > 0 ? ((decodedData.correct / decodedData.total) * 100).toFixed(2) : 0,
          wrong: decodedData.attempted - decodedData.correct,
          isLocal: true,
        });
      } else {
        const correct = parseInt(searchParams.get("correct")) || 0;
        const total = parseInt(searchParams.get("total")) || 0;
        const attempted = parseInt(searchParams.get("attempted")) || 0;
        const wrong = attempted - correct;
        const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;

        setResult({
          correct,
          total,
          attempted,
          wrong,
          percentage,
          questions: [],
          isLocal: true,
        });
      }
    } catch (error) {
      console.error("Error parsing result data:", error);
      setResult({
        correct: 0,
        total: 0,
        attempted: 0,
        wrong: 0,
        percentage: 0,
        questions: [],
        isLocal: true,
      });
    }
  }, [searchParams]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p>Loading result...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPassStatus = (percentage) => {
    return percentage >= 60 ? "PASS" : "FAIL";
  };

  const getPassColor = (percentage) => {
    return percentage >= 60 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const filteredQuestions = result.questions?.filter((q) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "correct") return q.isCorrect;
    if (filterStatus === "wrong") return !q.isCorrect && q.selectedAnswer !== null && q.selectedAnswer !== undefined;
    if (filterStatus === "unattempted") return q.selectedAnswer === null || q.selectedAnswer === undefined || q.selectedAnswer === "";
    return true;
  }) || [];

  const renderAnswer = (question) => {
    if (question.questionType === "matching") {
      const correctMatches = question.correctAnswer || {};
      const selectedMatches = question.selectedAnswer || {};
      const leftItems = question.matchingPairs?.leftItems || [];
      const rightItems = question.matchingPairs?.rightItems || [];

      return (
        <div className="space-y-4 mt-4">
          <h4 className="font-semibold text-gray-800">Your Matches:</h4>
          {leftItems.map((leftItem) => {
            const correctRightId = correctMatches[leftItem.id];
            const selectedRightId = selectedMatches[leftItem.id];
            const correctRightItem = rightItems.find(r => r.id === correctRightId);
            const selectedRightItem = rightItems.find(r => r.id === selectedRightId);
            const isMatch = correctRightId === selectedRightId;

            return (
              <div key={leftItem.id} className={`p-4 rounded-lg border-2 ${isMatch ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="font-medium text-gray-900">
                    <div className="text-sm text-gray-600 mb-1">Question:</div>
                    <div>{leftItem.text}</div>
                    {leftItem.image && (
                      <img src={leftItem.image} alt="" className="mt-2 max-h-20 rounded border" />
                    )}
                  </div>

                  <div className="text-center text-2xl text-gray-400 hidden md:block">→</div>

                  <div>
                    <div className={`p-3 rounded-lg mb-2 ${selectedRightItem ? (isMatch ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400') : 'bg-gray-100 border border-gray-300'}`}>
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {isMatch ? '✓ Your Answer (Correct)' : (selectedRightItem ? '✗ Your Answer (Wrong)' : 'Not Answered')}
                      </div>
                      <div className={`font-medium ${isMatch ? 'text-green-700' : (selectedRightItem ? 'text-red-700' : 'text-gray-500')}`}>
                        {selectedRightItem?.text || "Not answered"}
                      </div>
                      {selectedRightItem?.image && (
                        <img src={selectedRightItem.image} alt="" className="mt-2 max-h-16 rounded" />
                      )}
                    </div>

                    {!isMatch && correctRightItem && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-300">
                        <div className="text-xs font-semibold text-green-700 mb-1">✓ Correct Answer:</div>
                        <div className="font-medium text-green-800">{correctRightItem.text}</div>
                        {correctRightItem.image && (
                          <img src={correctRightItem.image} alt="" className="mt-2 max-h-16 rounded" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (question.questionType === "checkbox") {
      const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      const selectedAnswers = Array.isArray(question.selectedAnswer) ? question.selectedAnswer : [];

      return (
        <div className="space-y-3 mt-4">
          {question.options?.map((opt) => {
            const isCorrect = correctAnswers.includes(opt.label);
            const isSelected = selectedAnswers.includes(opt.label);
            
            let bgColor = "bg-white border-gray-300";
            let icon = "";
            let textColor = "text-gray-800";
            
            if (isCorrect && isSelected) {
              bgColor = "bg-green-50 border-green-400";
              icon = "✓✓";
              textColor = "text-green-800";
            } else if (isCorrect && !isSelected) {
              bgColor = "bg-yellow-50 border-yellow-400";
              icon = "✓";
              textColor = "text-yellow-800";
            } else if (!isCorrect && isSelected) {
              bgColor = "bg-red-50 border-red-400";
              icon = "✗";
              textColor = "text-red-800";
            }

            return (
              <div key={opt.label} className={`p-4 rounded-lg border-2 ${bgColor}`}>
                <div className="flex items-start gap-3">
                  {icon && (
                    <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
                  )}
                  
                  <div className="flex-1">
                    <div className={`font-semibold ${textColor}`}>
                      <span className="inline-block w-8">{opt.label}.</span>
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </div>
                    {opt.image && (
                      <img src={opt.image} alt={opt.label} className="mt-2 max-h-32 rounded border" />
                    )}
                  </div>

                  <div className="text-xs font-semibold">
                    {isCorrect && isSelected && <span className="text-green-600">Correct & Selected</span>}
                    {isCorrect && !isSelected && <span className="text-yellow-600">Correct (Missed)</span>}
                    {!isCorrect && isSelected && <span className="text-red-600">Wrong Selection</span>}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Correct Answers: </span>
                <span className="font-semibold text-green-600">{correctAnswers.join(", ") || "None"}</span>
              </div>
              <div>
                <span className="text-gray-600">Your Answers: </span>
                <span className={`font-semibold ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedAnswers.length > 0 ? selectedAnswers.join(", ") : "Not answered"}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4">
        {question.options?.map((opt) => {
          const isCorrect = opt.label === question.correctAnswer;
          const isSelected = opt.label === question.selectedAnswer;
          
          let bgColor = "bg-white border-gray-300";
          let borderWidth = "border";
          let icon = "";
          let textColor = "text-gray-800";
          
          if (isCorrect) {
            bgColor = "bg-green-50 border-green-400";
            borderWidth = "border-2";
            icon = "✓";
            textColor = "text-green-800";
          }
          if (isSelected && !isCorrect) {
            bgColor = "bg-red-50 border-red-400";
            borderWidth = "border-2";
            icon = "✗";
            textColor = "text-red-800";
          }

          return (
            <div key={opt.label} className={`p-4 rounded-lg ${borderWidth} ${bgColor}`}>
              <div className="flex items-start gap-3">
                {icon && (
                  <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
                )}
                {isSelected && !icon && (
                  <span className="text-xl font-bold text-blue-600">→</span>
                )}
                
                <div className="flex-1">
                  <div className={`font-semibold ${textColor}`}>
                    <span className="inline-block w-8">{opt.label}.</span>
                    <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                  </div>
                  {opt.image && (
                    <img src={opt.image} alt={opt.label} className="mt-2 max-h-32 rounded border" />
                  )}
                </div>

                {isCorrect && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-green-600 text-white">
                    Correct Answer
                  </span>
                )}
                {isSelected && !isCorrect && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white">
                    Your Answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Correct Answer: </span>
              <span className="font-semibold text-green-600">{question.correctAnswer || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Your Answer: </span>
              <span className={`font-semibold ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {question.selectedAnswer || "Not answered"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
          <p className="text-gray-600">{result.isLocal ? "Practice Test Completed" : "Exam Completed"}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Score</h2>
              <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPassColor(result.percentage)}`}>
                {getPassStatus(result.percentage)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-blue-800">Total Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.attempted}</div>
                <div className="text-sm text-green-800">Attempted</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{result.correct}</div>
                <div className="text-sm text-emerald-800">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.wrong}</div>
                <div className="text-sm text-red-800">Wrong</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold">
                  {result.attempted > 0 ? ((result.correct / result.attempted) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {((result.attempted / result.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">{result.correct}/{result.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-2">
              {result.percentage >= 80 ? (
                <>
                  <p className="text-green-600">🎉 Excellent performance!</p>
                  <p className="text-sm text-gray-600">You have a strong understanding of the material.</p>
                </>
              ) : result.percentage >= 60 ? (
                <>
                  <p className="text-yellow-600">👍 Good effort!</p>
                  <p className="text-sm text-gray-600">Review the questions you got wrong to improve your score.</p>
                </>
              ) : (
                <>
                  <p className="text-red-600">📚 Needs improvement</p>
                  <p className="text-sm text-gray-600">Focus on understanding the concepts and practice more.</p>
                </>
              )}
              {result.attempted < result.total && (
                <p className="text-sm text-orange-600">⚡ Try to attempt all questions next time.</p>
              )}
            </div>
          </div>
        </div>

        {result.questions && result.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Question-wise Analysis</h3>
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {showQuestions ? "Hide Questions" : "Show Detailed Analysis"}
              </button>
            </div>

            {showQuestions && (
              <>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    All ({result.questions.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("correct")}
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "correct" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    ✓ Correct ({result.questions.filter(q => q.isCorrect).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("wrong")}
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "wrong" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    ✗ Wrong ({result.questions.filter(q => !q.isCorrect && q.selectedAnswer).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("unattempted")}
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors ${filterStatus === "unattempted" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    ○ Unattempted ({result.questions.filter(q => !q.selectedAnswer).length})
                  </button>
                </div>

                <div className="space-y-6">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question, index) => (
                      <div key={question.questionId || index} className={`p-6 rounded-lg border-2 ${question.isCorrect ? 'border-green-300 bg-green-50' : (question.selectedAnswer ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50')}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${question.isCorrect ? 'bg-green-500' : (question.selectedAnswer ? 'bg-red-500' : 'bg-gray-500')}`}>
                            {result.questions.indexOf(question) + 1}
                          </span>
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-gray-900 mb-3" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                            {question.questionImage && (
                              <img src={question.questionImage} alt="Question" className="max-h-64 rounded border mb-3 shadow-sm" />
                            )}
                          </div>
                          <span className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${question.isCorrect ? 'bg-green-600 text-white' : (question.selectedAnswer ? 'bg-red-600 text-white' : 'bg-gray-600 text-white')}`}>
                            {question.isCorrect ? '✓ Correct' : (question.selectedAnswer ? '✗ Wrong' : '○ Unattempted')}
                          </span>
                        </div>

                        {renderAnswer(question)}

                        {question.explanation && (
                          <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 text-xl">💡</span>
                              <div>
                                <div className="font-semibold text-blue-900 mb-1">Explanation:</div>
                                <div className="text-blue-800 text-sm">{question.explanation}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No questions found for this filter.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard/student")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Back to Test
          </button>
          {result.isLocal && (
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          )}
        </div>

        {result.isLocal && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 This is a practice test result. For official records, please log in and take the exam again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}