'use client';
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
=======


import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ correct import
import ExamForm from "../examComps/ExamForm";

const ExamForm = () => {
  const router = useRouter();
  const params = useParams();
  const examId = params?.examId;

  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(Boolean(examId));
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(exam);

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

  // Fetch exam if editing
  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) throw new Error("Failed to fetch exam");
        const data = await res.json();
        setExam(data);
        setFormData((prev) => ({ ...prev, ...data, status: data.status || "unpublished" }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExam();
  }, [examId]);
export default function ExamFormWrapper() {
  const params = useParams();
  const examId = params.examId; // App Router me jo folder name hai use params se milega

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) {
        // Add mode
        setExam(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/exams/${examId}`);
        const data = await res.json();
        setExam(data); // Edit mode
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      eachQuestionMark: Number(formData.eachQuestionMark) || 0,
      duration: Number(formData.duration) || 0,
      sampleDuration: Number(formData.sampleDuration) || 0,
      passingScore: Number(formData.passingScore) || 0,
      numberOfQuestions: Number(formData.numberOfQuestions) || 0,
      priceUSD: Number(formData.priceUSD) || 0,
      priceINR: Number(formData.priceINR) || 0,
      mrpUSD: Number(formData.mrpUSD) || 0,
      mrpINR: Number(formData.mrpINR) || 0,
    };

    try {
      const url = isEditing ? `/api/exams/${examId}` : "/api/exams";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


    fetchExam();
  }, [examId]);

      router.push("/admin/exams");
    } catch (err) {
      console.error("Error saving exam:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const fields = [
    { name: "name", label: "Exam Name", type: "text", required: true },
    { name: "eachQuestionMark", label: "Each Question Mark", type: "number" },
    { name: "duration", label: "Duration (Minutes)", type: "number", required: true },
    { name: "sampleDuration", label: "Sample Duration (Minutes)", type: "number" },
    { name: "passingScore", label: "Passing Score (%)", type: "number" },
    { name: "code", label: "Exam Code", type: "text" },
    { name: "numberOfQuestions", label: "Number of Questions", type: "number", required: true },
    { name: "priceUSD", label: "Price ($)", type: "number" },
    { name: "priceINR", label: "Price (₹)", type: "number" },
    { name: "mrpUSD", label: "MRP ($)", type: "number" },
    { name: "mrpINR", label: "MRP (₹)", type: "number" },
    { name: "lastUpdatedBy", label: "Updated By", type: "text", required: true },
  ];
=======
  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>
  );

  if (loadingExam) return <p>Loading exam...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push("/admin/exams")}
          type="button"
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {isEditing ? "Edit Exam" : "Add New Exam"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow p-6 md:p-10 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map(({ name, label, type, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                placeholder={`Enter ${label}`}
                className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
                required={required}
                min={type === "number" ? 0 : undefined}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam For Product</label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm shadow-sm"
            required
            disabled={loadingProducts}
          >
            <option value="">{loadingProducts ? "Loading products..." : "Select a product"}</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.title} - {product.sapExamCode}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Exam Instructions</label>
            <ReactQuill
              theme="snow"
              modules={quillModules}
              placeholder="Enter main exam instructions..."
              value={formData.mainInstructions || ""}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, mainInstructions: content }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Exam Instructions</label>
            <ReactQuill
              theme="snow"
              modules={quillModules}
              placeholder="Enter sample exam instructions..."
              value={formData.sampleInstructions || ""}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, sampleInstructions: content }))
              }
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditing ? "Update Exam" : "Save Exam"}
          </button>
        </div>
      </form>
    </div>


      <ExamForm exam={exam} />
   
  );
}
