"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    status: "Ready",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("Failed to load categories");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      status: category.status || "Ready",
      image: null,
    });
    setPreviewImage(category.image);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      status: "Ready",
      image: null,
    });
    setPreviewImage("");
    setCurrentCategory(null);
  };

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

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError("");

  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("status", formData.status);

    if (formData.image) {
      data.append("image", formData.image);
    }

    let res;
    if (modalMode === "add") {
      res = await axios.post("/api/product-categories", data);
    } else {
      res = await axios.put(`/api/product-categories/${currentCategory._id}`, data);
    }

    if (res.status === 200 || res.status === 201) {
      await fetchCategories();
      setIsModalOpen(false);
      resetForm();
    }
  } catch (error) {
    setError(error.response?.data?.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};


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

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full border border-gray-300 rounded px-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
          <p>
            {search
              ? "No matching categories found"
              : "No categories available. Add your first category!"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status === "Publish"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === "add" ? "Add" : "Edit"} Category
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Category Name"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="Ready">Ready</option>
                    <option value="Publish">Publish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image
                  </label>
                  {previewImage && (
                    <div className="mb-3">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full p-2 border rounded"
                    onChange={handleChange}
                    required={modalMode === "add"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {modalMode === "edit" &&
                      "Leave empty to keep current image"}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        {modalMode === "add" ? "Adding..." : "Updating..."}
                      </span>
                    ) : modalMode === "add" ? (
                      "Add Category"
                    ) : (
                      "Update Category"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategories;
