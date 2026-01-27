"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Searchable Select Component
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get selected option label
  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm text-left bg-white flex justify-between items-center"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                    value === option.value ? "bg-blue-100 font-medium" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No products found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ExamForm({ exam }) {
  const router = useRouter();
  const isEditing = Boolean(exam);

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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
    examCategory: "",
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(null);
  const [questionCountLoading, setQuestionCountLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/product-categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (exam) {
      setFormData({
        ...formData,
        name: exam.name || "",
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
        examCategory:
          exam.examCategory?._id ||
          exam.examCategory ||
          exam.examCategoryId ||
          "",
      });

      // Fetch question count only when editing
      const loadQuestionCount = async () => {
        try {
          setQuestionCountLoading(true);
          const res = await fetch(`/api/questions/byExam/${exam._id}`);
          const data = await res.json();
          if (data?.success && Array.isArray(data.data)) {
            setQuestionCount(data.data.length);
          } else {
            setQuestionCount(0);
          }
        } catch (err) {
          console.error("Failed to fetch question count:", err);
          setQuestionCount(null);
        } finally {
          setQuestionCountLoading(false);
        }
      };

      loadQuestionCount();
    }
  }, [exam]);

  if (!mounted) return null;

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
      mainInstructions: formData.mainInstructions.trim(),
      mrpINR: Number(formData.mrpINR),
      mrpUSD: Number(formData.mrpUSD),
      name: formData.name.trim(),
      numberOfQuestions: Number(formData.numberOfQuestions),
      passingScore: Number(formData.passingScore),
      priceINR: Number(formData.priceINR),
      priceUSD: Number(formData.priceUSD),
      productId: formData.productId,
      examCategory: formData.examCategory || undefined,
      sampleDuration: Number(formData.sampleDuration),
      sampleInstructions: formData.sampleInstructions.trim(),
      status: formData.status || "unpublished",
    };

    console.log("📤 Submitting exam with payload:", payload);
    console.log("📦 examCategory value:", formData.examCategory);

    try {
      if (isEditing) {
        const response = await fetch(`/api/exams/${exam._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log("✅ Update response:", result);
        router.push("/dashboard/admin/exam");
      } else {
        const response = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log("✅ Create response:", result);
        router.push("/dashboard/admin/exam");
      }
    } catch (err) {
      console.error("Error saving exam:", err);
    }
  };
//this is test cahnges
  // Convert products to options format
  const productOptions = Array.isArray(products)
    ? products.map((p) => ({ value: p._id, label: p.sapExamCode }))
    : [];

  const categoryOptions = Array.isArray(categories)
    ? categories.map((c) => ({ value: c._id, label: c.name }))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
        {isEditing ? "Edit Exam" : "Add New Exam"}
      </h2>

      {isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Questions present</div>
            <div className="text-2xl font-semibold text-gray-800">
              {questionCountLoading ? "…" : (questionCount ?? "--")}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">
              Configured question limit
            </div>
            <div className="text-2xl font-semibold text-gray-800">
              {formData.numberOfQuestions || "--"}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow p-6 md:p-10 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[
            { name: "name", label: "Exam Name", type: "text" },
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

          {/* Searchable Product Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam For Product
            </label>
            <SearchableSelect
              options={productOptions}
              value={formData.productId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, productId: value }))
              }
              placeholder="Select a product"
            />
          </div>

          {/* Exam Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Category
            </label>
            <select
              name="examCategory"
              value={formData.examCategory}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
            >
              <option value="">Select category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const toolbarButtons = [
    { format: "bold", icon: "B", title: "Bold" },
    { format: "italic", icon: "I", title: "Italic" },
    { format: "underline", icon: "U", title: "Underline" },
    { format: "strikeThrough", icon: "S", title: "Strikethrough" },
    { separator: true },
    {
      format: "formatBlock",
      value: "blockquote",
      icon: "❝",
      title: "Blockquote",
    },
    { format: "formatBlock", value: "pre", icon: "</>", title: "Code Block" },
    { separator: true },
    { format: "link", icon: "🔗", title: "Insert Link" },
    { separator: true },
    { format: "insertOrderedList", icon: "1.", title: "Ordered List" },
    { format: "insertUnorderedList", icon: "•", title: "Bullet List" },
    { separator: true },
    { format: "justifyLeft", icon: "≡", title: "Align Left" },
    { format: "justifyCenter", icon: "≡", title: "Align Center" },
    { format: "justifyRight", icon: "≡", title: "Align Right" },
    { format: "justifyFull", icon: "≡", title: "Justify" },
  ];

  const handleFormat = (format, value = null) => {
    if (format === "link") {
      setShowLinkInput(true);
      return;
    }
    document.execCommand(format, false, value);
    onChange(editorRef.current.innerHTML);
  };

  const handleAddLink = () => {
    if (linkUrl) {
      document.execCommand("createLink", false, linkUrl);
      onChange(editorRef.current.innerHTML);
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden relative">
      <div className="bg-gray-100 p-2 flex flex-wrap gap-1 border-b border-gray-300">
        <select
          className="p-1 rounded border mr-1 text-sm"
          onChange={(e) => handleFormat("formatBlock", `h${e.target.value}`)}
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {toolbarButtons.map((btn, i) =>
          btn.separator ? (
            <div key={i} className="w-px h-6 bg-gray-300 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              title={btn.title}
              className="p-1 rounded min-w-[2rem] text-sm hover:bg-gray-200"
              onClick={() => handleFormat(btn.format, btn.value)}
            >
              {btn.icon}
            </button>
          ),
        )}

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

      <div className="relative">
        {(!value || value === "<br>") && (
          <div className="absolute left-4 top-4 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="p-4 min-h-[200px] focus:outline-none bg-white relative z-10"
          contentEditable
          onInput={handleInput}
        />
      </div>

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
