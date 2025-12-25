"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RichTextEditor from "@/components/public/RichTextEditor";
import FileUploader from "@/components/public/FileUploader";

const ProductForm = ({ mode }) => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState({
    sapExamCode: "",
    title: "",
    price: "",
    category: "",
    status: "",
    action: "",
    image: null,
    samplePdf: null,
    mainPdf: null,
    dumpsPriceInr: "",
    dumpsPriceUsd: "",
    dumpsMrpInr: "",
    dumpsMrpUsd: "",
    comboPriceInr: "",
    comboPriceUsd: "",
    comboMrpInr: "",
    comboMrpUsd: "",
    sku: "",
    longDescription: "",
    Description: "",
    slug: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    schema: "",
    // New exam information fields
    examCode: "",
    examName: "",
    totalQuestions: "",
    passingScore: "",
    duration: "",
    examLastUpdated: Date.now(),
  });

  const [existingFiles, setExistingFiles] = useState({
    imageUrl: "",
    samplePdfUrl: "",
    mainPdfUrl: "",
  });

  const [removedFiles, setRemovedFiles] = useState({
    imageUrl: false,
    samplePdfUrl: false,
    mainPdfUrl: false,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/product-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (mode === "edit" && id) {
      fetch(`/api/products?id=${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch product");
          return res.json();
        })
        .then((res) => {
          if (res.data) {
            const p = res.data;
            setForm((prev) => ({
              ...prev,
              ...p,
              image: null,
              samplePdf: null,
              mainPdf: null,
              examLastUpdated: p.examLastUpdated
                ? new Date(p.examLastUpdated).toISOString().split("T")[0]
                : "",
            }));
            setExistingFiles({
              imageUrl: p.imageUrl || "",
              samplePdfUrl: p.samplePdfUrl || "",
              mainPdfUrl: p.mainPdfUrl || "",
            });
            setRemovedFiles({
              imageUrl: false,
              samplePdfUrl: false,
              mainPdfUrl: false,
            });
          }
        })
        .catch((err) => {
          console.error("Product load error:", err);
          setError("Failed to load product data");
        });
    }
  }, [mode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveExistingFile = (field) => {
    setExistingFiles((prev) => ({ ...prev, [field]: "" }));
    setRemovedFiles((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.sapExamCode || !form.slug || !form.category) {
      setError("Please fill in all required fields");
      return;
    }

    if (mode === "add" && !form.image) {
      setError("Product image is required");
      return;
    }

    if (mode === "edit" && !form.image && !existingFiles.imageUrl) {
      setError("Product image is required");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "image" && key !== "samplePdf" && key !== "mainPdf") {
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      }
    });

    if (form.image) {
      formData.append("image", form.image);
    } else if (removedFiles.imageUrl) {
      formData.append("imageUrl", "");
      formData.append("removeImage", "true");
    } else if (existingFiles.imageUrl) {
      formData.append("imageUrl", existingFiles.imageUrl);
    }

    if (form.samplePdf) {
      formData.append("samplePdf", form.samplePdf);
    } else if (removedFiles.samplePdfUrl) {
      formData.append("samplePdfUrl", "");
      formData.append("removeSamplePdf", "true");
    } else if (existingFiles.samplePdfUrl) {
      formData.append("samplePdfUrl", existingFiles.samplePdfUrl);
    }

    if (form.mainPdf) {
      formData.append("mainPdf", form.mainPdf);
    } else if (removedFiles.mainPdfUrl) {
      formData.append("mainPdfUrl", "");
      formData.append("removeMainPdf", "true");
    } else if (existingFiles.mainPdfUrl) {
      formData.append("mainPdfUrl", existingFiles.mainPdfUrl);
    }

    try {
      const url = mode === "add" ? "/api/products" : `/api/products?id=${id}`;
      const method = mode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Operation failed");
      }

      router.push("/dashboard/admin/product/list");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred during submission");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Delete operation failed");
      }

      router.push("/dashboard/admin/product/list");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl pt-20 mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">
        {mode === "add" ? "Add New Product" : "Edit Product"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              SAP Exam Code*
            </label>
            <input
              type="text"
              name="sapExamCode"
              value={form.sapExamCode}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Slug*
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">SKU*</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Exam Information Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Exam Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700">Exam Code</label>
              <input
                name="examCode"
                value={form.examCode}
                onChange={handleChange}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Exam Name</label>
              <input
                name="examName"
                value={form.examName}
                onChange={handleChange}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">
                Total Questions
              </label>
              <input
                name="totalQuestions"
                type="number"
                value={form.totalQuestions}
                onChange={handleChange}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Passing Score</label>
              <input
                name="passingScore"
                value={form.passingScore}
                onChange={handleChange}
                placeholder="e.g., 70% or 700/1000"
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g., 90 minutes"
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          
          </div>
        </div>

        {/* Dumps Pricing */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Dumps Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "dumpsPriceInr", label: "Price (INR)" },
              { name: "dumpsPriceUsd", label: "Price (USD)" },
              { name: "dumpsMrpInr", label: "MRP (INR)" },
              { name: "dumpsMrpUsd", label: "MRP (USD)" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 text-gray-700">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={form[field.name]}
                  onChange={handleChange}
                  className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Combo Pricing */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Combo Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "comboPriceInr", label: "Price (INR)" },
              { name: "comboPriceUsd", label: "Price (USD)" },
              { name: "comboMrpInr", label: "MRP (INR)" },
              { name: "comboMrpUsd", label: "MRP (USD)" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 text-gray-700">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={form[field.name]}
                  onChange={handleChange}
                  className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Category*
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Status*
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Action
            </label>
            <select
              name="action"
              value={form.action}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Action</option>
              <option value="edit">Edit</option>
              <option value="review">Review</option>
            </select>
          </div>
        </div>

        {/* File Uploads */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            File Uploads
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Product Image*
              </label>
              <FileUploader
                onFileSelect={(f) => setForm((p) => ({ ...p, image: f }))}
                onRemoveExisting={() => handleRemoveExistingFile("imageUrl")}
                existingUrl={existingFiles.imageUrl}
                existingLabel="Current Product Image"
                accept="image/*"
                label="product image"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Sample PDF
              </label>
              <FileUploader
                onFileSelect={(f) => setForm((p) => ({ ...p, samplePdf: f }))}
                onRemoveExisting={() =>
                  handleRemoveExistingFile("samplePdfUrl")
                }
                existingUrl={existingFiles.samplePdfUrl}
                existingLabel="Current Sample PDF"
                accept="application/pdf"
                label="sample PDF"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Main PDF
              </label>
              <FileUploader
                onFileSelect={(f) => setForm((p) => ({ ...p, mainPdf: f }))}
                onRemoveExisting={() => handleRemoveExistingFile("mainPdfUrl")}
                existingUrl={existingFiles.mainPdfUrl}
                existingLabel="Current Main PDF"
                accept="application/pdf"
                label="main PDF"
              />
            </div>
          </div>
        </div>

        {/* Rich Text Editors */}
        <RichTextEditor
          label="Description"
          value={form.Description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, Description: value }))
          }
          error={""}
        />

        <RichTextEditor
          label="Long Description"
          value={form.longDescription}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, longDescription: value }))
          }
          error={""}
        />

        {/* SEO Settings */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Meta Title
              </label>
              <input
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Meta Keywords
              </label>
              <textarea
                name="metaKeywords"
                value={form.metaKeywords}
                onChange={handleChange}
                rows={2}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                rows={3}
                className="border border-gray-300 w-full px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Schema Markup
              </label>
              <textarea
                name="schema"
                value={form.schema}
                onChange={handleChange}
                rows={4}
                className="border border-gray-300 w-full px-4 py-2 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-[150px] transition"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              `${mode === "add" ? "Create" : "Update"} Product`
            )}
          </button>

          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 min-w-[100px] transition"
            >
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/product/list")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 min-w-[100px] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
