"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // Quill CSS

// Dynamically import ReactQuill (fix SSR issues in Next.js)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const COLORS = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#800080",
  "#808080",
  "#FFFFFF",
  "#FFD700",
  "#008080",
];

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: COLORS }, { background: COLORS }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "blockquote", "code-block"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "blockquote",
  "code-block",
  "color",
  "background",
];

export default function TermsEditor() {
  const [content, setContent] = useState("");
  const [contentId, setContentId] = useState(null);

  // ✅ Fetch Terms Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/terms");
        const data = await res.json();

        if (data && data.html) {
          setContent(data.html);
          setContentId(data._id); // ✅ store ID for update
        }
      } catch (error) {
        console.error("Error fetching terms content:", error);
      }
    };

    fetchContent();
  }, []);

  // ✅ Save or Update Terms Content
  const handleSave = async () => {
    try {
      const method = contentId ? "PUT" : "POST";
      const res = await fetch(`/api/terms${contentId ? `/${contentId}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: content }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Terms & Conditions content saved!");
        if (data._id) setContentId(data._id);
      } else {
        alert("Failed to save content.");
      }
    } catch (error) {
      console.error("Error saving terms content:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Terms & Conditions Page</h2>

      <ReactQuill
        value={content}
        onChange={setContent}
        theme="snow"
        placeholder="Write your terms & conditions content here..."
        modules={modules}
        formats={formats}
      />

      <button
        onClick={handleSave}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Save Terms & Conditions Content
      </button>
    </div>
  );
}
