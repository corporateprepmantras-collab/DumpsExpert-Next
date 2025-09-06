"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ExamForm({ exam }) {
  const router = useRouter();
  const isEditing = Boolean(exam);
  console.log(isEditing, exam);

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    eachQuestionMark: "",
    duration: "",
    sampleDuration: "",
    passingScore: "",
    code: "",
    numberOfQuestions: "",
    priceUSD: "",
    priceINR: "",
    mrpUSD: "",
    mrpINR: "",
    status: "unpublished",
    mainInstructions: "",
    sampleInstructions: "",
    lastUpdatedBy: "",
    productId: "",
  });

  const [products, setProducts] = useState([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/get");
        const data = await res.json();
        setProducts(data.data);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (exam) {
      setFormData({
        ...formData,
        name: exam.name || "",
        eachQuestionMark: exam.eachQuestionMark || "",
        duration: exam.duration || "",
        sampleDuration: exam.sampleDuration || "",
        passingScore: exam.passingScore || "",
        code: exam.code || "",
        numberOfQuestions: exam.numberOfQuestions || "",
        priceUSD: exam.priceUSD || "",
        priceINR: exam.priceINR || "",
        mrpUSD: exam.mrpUSD || "",
        mrpINR: exam.mrpINR || "",
        status: exam.status || "unpublished",
        mainInstructions: exam.mainInstructions || "",
        sampleInstructions: exam.sampleInstructions || "",
        lastUpdatedBy: exam.lastUpdatedBy || "",
        productId: exam.productId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  if (!mounted) return null; // prevent SSR errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      code: formData.code.trim(),
      duration: Number(formData.duration),
      eachQuestionMark: Number(formData.eachQuestionMark),
      lastUpdatedBy: formData.lastUpdatedBy.trim(),
      mainInstructions: formData.mainInstructions.trim(),
      mrpINR: Number(formData.mrpINR),
      mrpUSD: Number(formData.mrpUSD),
      name: formData.name.trim(),
      numberOfQuestions: Number(formData.numberOfQuestions),
      passingScore: Number(formData.passingScore),
      priceINR: Number(formData.priceINR),
      priceUSD: Number(formData.priceUSD),
      productId: formData.productId,
      sampleDuration: Number(formData.sampleDuration),
      sampleInstructions: formData.sampleInstructions.trim(),
      status: formData.status || "unpublished",
     
    };

    try {
      if (isEditing) {
        await fetch(`/api/exams/${exam._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
             router.push("/dashboard/admin/exam");
      } else {
        await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
             router.push("/dashboard/admin/exam");
      }
 
    } catch (err) {
      console.error("Error saving exam:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
        {isEditing ? "Edit Exam" : "Add New Exam"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow p-6 md:p-10 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[
            { name: "name", label: "Exam Name", type: "text" },
            {
              name: "eachQuestionMark",
              label: "Each Question Mark",
              type: "number",
            },
            { name: "duration", label: "Duration (Minutes)", type: "number" },
            {
              name: "sampleDuration",
              label: "Sample Duration",
              type: "number",
            },
            {
              name: "passingScore",
              label: "Passing Score (%)",
              type: "number",
            },
            { name: "code", label: "Exam Code", type: "text" },
            {
              name: "numberOfQuestions",
              label: "Number of Questions",
              type: "number",
            },
            { name: "priceUSD", label: "Price ($)", type: "number" },
            { name: "priceINR", label: "Price (₹)", type: "number" },
            { name: "mrpUSD", label: "MRP ($)", type: "number" },
            { name: "mrpINR", label: "MRP (₹)", type: "number" },
            { name: "lastUpdatedBy", label: "Updated By", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
                required
                min={field.type === "number" ? 0 : undefined}
              />
            </div>
          ))}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
            >
              <option value="unpublished">Unpublished</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Product Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam For Product
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
              required
            >
              <option value="">Select a product</option>
              {Array.isArray(products) &&
                products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Custom Rich Text Editors */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Instructions
            </label>
            <RichTextEditor
              value={formData.mainInstructions}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, mainInstructions: val }))
              }
              placeholder="Enter main exam instructions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Instructions
            </label>
            <RichTextEditor
              value={formData.sampleInstructions}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, sampleInstructions: val }))
              }
              placeholder="Enter sample exam instructions..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow"
          >
            {isEditing ? "Update Exam" : "Save Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Custom Rich Text Editor Component
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const editorRef = useRef(null);

  // Toolbar buttons configuration
  const toolbarButtons = [
    { format: "bold", icon: "B", title: "Bold" },
    { format: "italic", icon: "I", title: "Italic" },
    { format: "underline", icon: "U", title: "Underline" },
    { format: "strike", icon: "S", title: "Strikethrough" },
    { separator: true },
    { format: "blockquote", icon: "❝", title: "Blockquote" },
    { format: "code-block", icon: "</>", title: "Code Block" },
    { separator: true },
    { format: "link", icon: "🔗", title: "Insert Link" },
    { separator: true },
    { format: "ordered", icon: "1.", title: "Ordered List" },
    { format: "bullet", icon: "•", title: "Bullet List" },
    { separator: true },
    { format: "align", value: "left", icon: "≡", title: "Align Left" },
    { format: "align", value: "center", icon: "≡", title: "Align Center" },
    { format: "align", value: "right", icon: "≡", title: "Align Right" },
    { format: "align", value: "justify", icon: "≡", title: "Justify" },
  ];

  // Handle format changes
  const handleFormat = (format, value = null) => {
    if (format === "link") {
      setShowLinkInput(true);
      return;
    }

    if (format === "heading") {
      document.execCommand("formatBlock", false, `<h${value}>`);
      onChange(editorRef.current.innerHTML);
      return;
    }

    document.execCommand(format, false, value);
    onChange(editorRef.current.innerHTML);
  };

  // Handle link insertion
  const handleAddLink = () => {
    if (linkUrl) {
      document.execCommand("createLink", false, linkUrl);
      onChange(editorRef.current.innerHTML);
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  // Handle editor content changes
  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 p-2 flex flex-wrap gap-1 border-b border-gray-300">
        {/* Headings dropdown */}
        <select
          className="p-1 rounded border mr-1 text-sm"
          onChange={(e) => handleFormat("heading", e.target.value)}
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {/* Format buttons */}
        {toolbarButtons.map((button, index) =>
          button.separator ? (
            <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              title={button.title}
              className={`p-1 rounded min-w-[2rem] text-sm hover:bg-gray-200`}
              onClick={() => handleFormat(button.format, button.value)}
            >
              {button.icon}
            </button>
          )
        )}

        {/* Color pickers */}
        <input
          type="color"
          className="w-8 h-8 p-0 border-0 cursor-pointer"
          onChange={(e) => handleFormat("foreColor", e.target.value)}
          title="Text Color"
        />
        <input
          type="color"
          className="w-8 h-8 p-0 border-0 cursor-pointer"
          onChange={(e) => handleFormat("backColor", e.target.value)}
          title="Background Color"
        />
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] focus:outline-none bg-white"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        placeholder={placeholder}
      />

      {/* Link input dialog */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-80">
            <h3 className="font-medium mb-2">Insert Link</h3>
            <input
              type="url"
              className="border p-2 w-full mb-2 rounded"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => setShowLinkInput(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={handleAddLink}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
