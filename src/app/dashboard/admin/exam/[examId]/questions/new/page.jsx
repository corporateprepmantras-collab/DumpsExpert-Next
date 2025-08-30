'use client';
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { examId } = useParams();

  useEffect(() => {
    if (!examId) return;
    console.log("Loaded examId:", examId);
  }, [examId]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newQuestion = { question, options, answer, examId };

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (res.ok) {
        alert("Question added successfully!");
        setQuestion("");
        setOptions(["", "", "", ""]);
        setAnswer("");
        router.push(`/dashboard/admin/exam/${examId}/questions`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add question");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Question:</label>
        <ReactQuill value={question} onChange={setQuestion} />
      </div>

      <div>
        <label className="block mb-2">Options:</label>
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
        ))}
      </div>

      <div>
        <label className="block mb-2">Answer:</label>
        <input
          type="text"
          placeholder="Correct Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}

export default function QuestionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create New Question</h1>
      <QuestionForm />
    </div>
  );
}
