// components/admin/ExamList.jsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

const ExamList = ({ exams, onDelete, onEdit, onManageQuestions, onAddNew }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">All Exams</h2>
        <button
          onClick={onAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium shadow"
        >
          + Add Exam
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse shadow-sm rounded-md overflow-hidden text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 border-b text-left">Code</th>
              <th className="p-3 border-b text-left">Name</th>
              <th className="p-3 border-b text-left">Duration (min)</th>
              <th className="p-3 border-b text-left"># Questions</th>
              <th className="p-3 border-b text-left">Category</th>
              <th className="p-3 border-b text-left">Price</th>
              <th className="p-3 border-b text-left">Status</th>
              <th className="p-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {exams.map((exam) => (
              <tr
                key={exam._id}
                className="hover:bg-gray-50 border-b transition"
              >
                <td className="p-3 font-medium">{exam.code}</td>
                <td className="p-3">{exam.name}</td>
                <td className="p-3">{exam.duration} min</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600">
                      {exam.actualQuestionCount ?? 0}
                    </span>
                    {exam.numberOfQuestions !==
                      (exam.actualQuestionCount ?? 0) && (
                      <span className="text-xs text-gray-500">
                        / {exam.numberOfQuestions} configured
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  {exam.examCategory?.name || exam.examCategoryName || "-"}
                </td>
                <td className="p-3">
                  <div>${exam.priceUSD}</div>
                  <div className="text-sm">₹{exam.priceINR}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {exam.status === "published" ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => onEdit(exam._id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onManageQuestions(exam._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => onDelete(exam._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No exams found. Create your first exam!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamList;
