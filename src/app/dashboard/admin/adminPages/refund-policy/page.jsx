"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

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

export default function RefundEditor() {
  const [content, setContent] = useState("");
  const [contentId, setContentId] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/refund-policy");
        const data = await res.json();
        if (data && data.html) {
          setContent(data.html);
          setContentId(data._id);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      const method = contentId ? "PUT" : "POST";
      const res = await fetch(
        `/api/refund-policy${contentId ? `/${contentId}` : ""}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: content }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Refund Policy content saved!");
        if (data._id) setContentId(data._id);
      } else {
        alert("Failed to save content.");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Refund Policy Page</h2>

      <ReactQuill
        value={content}
        onChange={setContent}
        theme="snow"
        placeholder="Write your Refund Policy here..."
        modules={modules}
        formats={formats}
      />

      <button
        onClick={handleSave}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Save Refund Policy
      </button>
    </div>
  );
}
