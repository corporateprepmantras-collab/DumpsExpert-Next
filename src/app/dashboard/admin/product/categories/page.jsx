
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // ✅ Quill CSS

// ✅ Quill Editor
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

export default function ProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    descriptionBelow: "",
    image: null,
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    remarks: "",
    status: "Ready",
    faqs: [{ question: "", answer: "" }],
  });
  const [previewImage, setPreviewImage] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  // ✅ Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/product-categories");
      setCategories(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ FAQ Handlers
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (index) => {
    const updatedFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = new FormData();

      // ✅ Append all normal fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "faqs") {
          data.append("faqs", JSON.stringify(value)); // store FAQs as JSON
        } else if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, value ?? "");
        }
      });

      // ✅ Append Quill values explicitly
      data.set("description", formData.description || "");
      data.set("descriptionBelow", formData.descriptionBelow || "");

      let res;
      if (editingCategory) {
        res = await axios.put(
          `/api/product-categories/${editingCategory._id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post("/api/product-categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.status === 200 || res.status === 201) {
        fetchCategories();
        resetForm();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      descriptionBelow: "",
      image: null,
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      remarks: "",
      status: "Ready",
      faqs: [{ question: "", answer: "" }],
    });
    setPreviewImage("");
    setEditingCategory(null);
  };

  // ✅ Edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      descriptionBelow: category.descriptionBelow || "",
      image: null,
      metaTitle: category.metaTitle || "",
      metaKeywords: category.metaKeywords || "",
      metaDescription: category.metaDescription || "",
      remarks: category.remarks || "",
      status: category.status || "Ready",
      faqs: category.faqs || [{ question: "", answer: "" }],
    });
    setPreviewImage(category.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Delete category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`/api/product-categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ✅ Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pt-20 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage Product Categories</h1>

      {/* ✅ Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4 mb-8"
      >
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        {/* Slug */}
        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Description */}
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          modules={modules}
          formats={formats}
          placeholder="Write description..."
        />

        {/* Description Below */}
        <ReactQuill
          theme="snow"
          value={formData.descriptionBelow}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, descriptionBelow: value }))
          }
          modules={modules}
          formats={formats}
          placeholder="Write description below..."
        />

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">FAQs</h2>
          {formData.faqs.map((faq, index) => (
            <div
              key={index}
              className="p-3 border rounded bg-gray-50 space-y-2"
            >
              <input
                type="text"
                placeholder="Question"
                value={faq.question}
                onChange={(e) =>
                  handleFaqChange(index, "question", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) =>
                  handleFaqChange(index, "answer", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
              />
              <button
                type="button"
                onClick={() => removeFaq(index)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            + Add FAQ
          </button>
        </div>

        {/* Image */}
        <div>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Meta */}
        <input
          type="text"
          name="metaTitle"
          placeholder="Meta Title"
          value={formData.metaTitle}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="metaKeywords"
          placeholder="Meta Keywords (comma separated)"
          value={formData.metaKeywords}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="metaDescription"
          placeholder="Meta Description"
          rows={2}
          value={formData.metaDescription}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Remarks */}
        <textarea
          name="remarks"
          placeholder="Remarks..."
          rows={2}
          value={formData.remarks}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Status */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Ready">Ready</option>
          <option value="Publish">Publish</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSubmitting
              ? "Saving..."
              : editingCategory
              ? "Update Category"
              : "Add Category"}
          </button>
        </div>
      </form>

      {/* ✅ Search */}
      <input
        type="text"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* ✅ Categories list */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredCategories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Image</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Slug</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    )}
                  </td>
                  <td className="p-3 border">{category.name}</td>
                  <td className="p-3 border">{category.slug}</td>
                  <td className="p-3 border">{category.status}</td>
                  <td className="p-3 border space-x-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
