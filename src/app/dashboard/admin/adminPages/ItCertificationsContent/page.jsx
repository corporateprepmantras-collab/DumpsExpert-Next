"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // ✅ Load Quill CSS

// Dynamically import to avoid SSR issues in Next.js
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

export default function ItCertificationsContentEditor() {
  const [upperPara, setUpperPara] = useState("");
  const [lowerPara, setLowerPara] = useState("");
  const [contentId, setContentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch existing content when page loads
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/itcertifications-content");
        const data = await res.json();

        if (data && data.upperPara && data.lowerPara) {
          setUpperPara(data.upperPara);
          setLowerPara(data.lowerPara);
          setContentId(data._id); // ✅ store ID so we can update
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // ✅ Save or update content
  const handleSave = async () => {
    setSaving(true);
    try {
      const method = contentId ? "PUT" : "POST"; // ✅ use PUT if existing
      const res = await fetch(
        `/api/itcertifications-content${contentId ? `/${contentId}` : ""}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upperPara, lowerPara }),
        },
      );

      const data = await res.json();
      if (data.success) {
        alert("Content saved successfully!");
        if (data.data._id) setContentId(data.data._id); // in case it was a new record
      } else {
        alert("Failed to save content.");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white pt-20 p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-20 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Edit IT Certifications Content
      </h2>

      {/* Upper Paragraph Editor */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upper Paragraph (Introduction - shown at top)
        </label>
        <div className="border border-gray-300 rounded-lg">
          <ReactQuill
            value={upperPara}
            onChange={setUpperPara}
            theme="snow"
            placeholder="Write the introductory paragraph here..."
            modules={modules}
            formats={formats}
            className="bg-white"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This content will appear at the top of the IT Certifications page,
          after the heading.
        </p>
      </div>

      {/* Lower Paragraph Editor */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Lower Paragraph (Detailed Content - shown after cards)
        </label>
        <div className="border border-gray-300 rounded-lg">
          <ReactQuill
            value={lowerPara}
            onChange={setLowerPara}
            theme="snow"
            placeholder="Write the detailed content here..."
            modules={modules}
            formats={formats}
            className="bg-white"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This content will appear at the bottom of the IT Certifications page,
          after all the certification cards.
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg`}
      >
        {saving ? "Saving..." : "Save Content"}
      </button>
    </div>
  );
}
