'use client';
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import "react-quill/dist/quill.snow.css";

const InputWrapper = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const QuestionForm = () => {
  const router = useRouter();
  const params = useParams();
  const { examId, questionId } = params || {};

  const [exam, setExam] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [options, setOptions] = useState([
    { text: "", image: "" },
    { text: "", image: "" },
    { text: "", image: "" },
    { text: "", image: "" },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState([false, false, false, false]);
  const [isSample, setIsSample] = useState(false);
  const [type, setType] = useState("radio");
  const [status, setStatus] = useState("publish");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [difficulty, setDifficulty] = useState("Easy");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  // Fetch exam & question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (examId) {
          const examRes = await fetch(`/api/exams/${examId}`);
          if (!examRes.ok) throw new Error("Failed to fetch exam");
          const examData = await examRes.json();
          setExam(examData);
        }

        if (questionId) {
          const qRes = await fetch(`/api/questions/${questionId}`);
          if (!qRes.ok) throw new Error("Failed to fetch question");
          const qData = await qRes.json();
          setQuestion(qData);

          setQuestionText(qData.questionText || "");
          setQuestionImage(qData.questionImage || "");
          setOptions(
            qData.options?.map((o) => ({ text: o.text, image: o.image || "" })) || [
              { text: "", image: "" },
              { text: "", image: "" },
              { text: "", image: "" },
              { text: "", image: "" },
            ]
          );
          setCorrectAnswers(["A", "B", "C", "D"].map((label) => qData.correctAnswers?.includes(label)));
          setIsSample(qData.isSample || false);
          setType(qData.questionType || "radio");
          setStatus(qData.status || "publish");
          setMarks(qData.marks || 1);
          setNegativeMarks(qData.negativeMarks || 0);
          setDifficulty(qData.difficulty || "Easy");
          setExplanation(qData.explanation || "");
          setTags(qData.tags?.join(", ") || "");
          setSubject(qData.subject || "");
          setTopic(qData.topic || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, questionId]);

  const toggleCorrectAnswer = (index) => {
    const updated = [...correctAnswers];
    updated[index] = !updated[index];
    setCorrectAnswers(updated);
    const count = updated.filter(Boolean).length;
    setType(count > 1 ? "checkbox" : "radio");
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/questions/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  const handleOptionImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      const updated = [...options];
      updated[index].image = url;
      setOptions(updated);
    }
  };

  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setQuestionImage(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exam) return;

    const payload = {
      examId: exam._id,
      questionText,
      questionImage,
      questionType: type,
      difficulty,
      marks,
      negativeMarks,
      subject,
      topic,
      tags: tags.split(",").map((tag) => tag.trim()),
      explanation,
      options: options.map((opt, i) => ({ label: "ABCD"[i], text: opt.text, image: opt.image })),
      correctAnswers: correctAnswers.map((c, i) => (c ? "ABCD"[i] : null)).filter(Boolean),
      isSample,
      status,
    };

    try {
      if (questionId) {
        await fetch(`/api/questions/${questionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      router.push(`/admin/exams/${exam._id}/questions`);
    } catch (err) {
      console.error("Error saving question:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6 bg-white rounded-md shadow-md border">
      <button
        onClick={() => router.push(`/admin/exams/${exam._id}/questions`)}
        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm rounded shadow"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-semibold text-gray-800">
        {questionId ? "Edit" : "Add"} Question
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWrapper label="Exam Code">
            <input type="text" value={exam?.code || ""} disabled className="input-style" />
          </InputWrapper>

          <InputWrapper label="Question Type (auto)">
            <input className="input-style" type="text" value={type} readOnly />
          </InputWrapper>

          <InputWrapper label="Marks">
            <input className="input-style" type="number" value={marks} onChange={(e) => setMarks(+e.target.value)} />
          </InputWrapper>

          <InputWrapper label="Negative Marks">
            <input className="input-style" type="number" value={negativeMarks} onChange={(e) => setNegativeMarks(+e.target.value)} />
          </InputWrapper>

          <InputWrapper label="Difficulty">
            <select className="input-style" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </InputWrapper>

          <InputWrapper label="Status">
            <select className="input-style" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="publish">Publish</option>
              <option value="draft">Draft</option>
            </select>
          </InputWrapper>

          <InputWrapper label="Subject">
            <input className="input-style" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </InputWrapper>

          <InputWrapper label="Topic">
            <input className="input-style" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </InputWrapper>

          <InputWrapper label="Tags (comma separated)">
            <input className="input-style" value={tags} onChange={(e) => setTags(e.target.value)} />
          </InputWrapper>

          <InputWrapper label="Add to Sample">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isSample} onChange={() => setIsSample(!isSample)} />
              Yes
            </label>
          </InputWrapper>
        </section>

        <InputWrapper label="Question Text">
          <ReactQuill theme="snow" modules={quillModules} value={questionText} onChange={setQuestionText} />
        </InputWrapper>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium shadow">
            {questionId ? "Update Question" : "Save Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
import QuestionForm from "../../../questionManage/QuestionForm";
export default function QuestionPage() {
  return (
    <div>
      <h1>Create New Question</h1>
      <QuestionForm />
    </div>
  );
}
