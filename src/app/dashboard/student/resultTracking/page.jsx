// app/student/result-history/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ResultHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudentAndHistory = async () => {
      try {
        // Fetch current student data
        const studentRes = await axios.get('/api/user/me');
        console.log("👤 Student API response:", studentRes.data);
        const studentData = studentRes.data;
        setStudent(studentData);

        if (studentData && studentData.id) {
          // Fetch result history using student ID
          const historyRes = await axios.get(`/api/results?studentId=${studentData.id}`);
          console.log("📊 History API response:", historyRes.data);
          
          if (historyRes.data.success) {
            setHistory(historyRes.data.data || []);
          } else {
            console.error("Failed to fetch history:", historyRes.data.message);
          }
        } else {
          console.error("No student ID found");
        }
      } catch (err) {
        console.error('Failed to fetch result history:', err);
        // Try alternative API endpoint
        try {
          const altRes = await axios.get('/api/results/history');
          if (altRes.data.success) {
            setHistory(altRes.data.data || []);
          }
        } catch (altErr) {
          console.error('Alternative history fetch failed:', altErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndHistory();
  }, []);

  const handleViewResult = (result) => {
    if (result.isTempStudent || result._id.startsWith('temp_')) {
      // For temporary results, use local result page
      router.push(`/student/result/local?correct=${result.correct}&total=${result.totalQuestions}&attempted=${result.attempted}`);
    } else {
      // For saved results, use the detail page with ID
      router.push(`/student/result/${result._id}`);
    }
  };

  const handleViewLocalResult = () => {
    // If you want to view a specific local result, you can pass parameters
    router.push('/student/result/local');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Result History
          </h1>
          <p className="text-gray-600">
            View your past exam performances and results
          </p>
        </div>

        {/* Stats Summary */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{history.length}</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {history.filter(r => r.percentage >= 60).length}
              </div>
              <div className="text-sm text-gray-600">Passed Exams</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {history.length > 0 ? 
                  (history.reduce((acc, curr) => acc + curr.percentage, 0) / history.length).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {history.reduce((acc, curr) => acc + curr.correct, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Correct</div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
              {/* <button
                onClick={handleViewLocalResult}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Practice Results
              </button> */}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg mb-4">No exam results found</p>
                <p className="text-gray-500 mb-4">
                  You haven't taken any exams yet. Start by taking a practice test or enrolled exam.
                </p>
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((result, index) => (
                  <div
                    key={result._id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <p className="font-semibold text-blue-700">
                            Attempt #{result.attempt || 1}
                          </p>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full ${
                              result.percentage >= 60
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {result.percentage >= 60 ? 'Pass' : 'Fail'}
                          </span>
                          {result.isTempStudent && (
                            <span className="inline-block text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              Practice
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Exam Code:</span>
                            <p className="font-medium">{result.examCode || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <p className="font-medium">{result.percentage}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Correct:</span>
                            <p className="font-medium">{result.correct}/{result.totalQuestions}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium">
                              {Math.floor(result.duration / 60)}m {result.duration % 60}s
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500">
                          Date: {new Date(result.completedAt || result.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
                        <button
                          onClick={() => handleViewResult(result)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {history.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 Click "View Details" to see detailed analysis of each attempt
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultHistoryPage;