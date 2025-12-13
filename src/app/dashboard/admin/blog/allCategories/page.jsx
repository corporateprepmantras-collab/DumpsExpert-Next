"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const CategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    sectionName: "",
    slug: "",
    language: "",
    category: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    schema: "",
    openGraphTitle: "",
    openGraphDescription: "",
    openGraphImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/blog-categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure to delete this category?")) return;
    try {
      await axios.delete(`/api/blog-categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setSelectedCategories((prev) => prev.filter((cid) => cid !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select categories to delete");
      return;
    }
    if (!confirm(`Delete ${selectedCategories.length} selected categories?`))
      return;

    try {
      await Promise.all(
        selectedCategories.map((id) =>
          axios.delete(`/api/blog-categories/${id}`)
        )
      );
      toast.success(
        `${selectedCategories.length} categories deleted successfully!`
      );
      setCategories((prev) =>
        prev.filter((c) => !selectedCategories.includes(c._id))
      );
      setSelectedCategories([]);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting categories");
    }
  };

  // Filtered (derived)
  const filtered = categories.filter((p) =>
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  // Toggle Selection
  const toggleSelection = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedCategories.length === filtered.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filtered.map((c) => c._id));
    }
  };

  const handleEdit = (category) => {
    if (!category) return;
    setIsAdd(false);
    setSelectedCategory(category);
    setFormData({
      sectionName: category.sectionName || "",
      slug: category.slug || "",
      language: category.language || "",
      category: category.category || "",
      metaTitle: category.metaTitle || "",
      metaKeywords: category.metaKeywords || "",
      metaDescription: category.metaDescription || "",
      schema: category.schema || "",
      openGraphTitle: category.openGraphTitle || "",
      openGraphDescription: category.openGraphDescription || "",
      openGraphImage: category.openGraphImage || "",
      twitterTitle: category.twitterTitle || "",
      twitterDescription: category.twitterDescription || "",
      twitterImage: category.twitterImage || "",
    });
    setPreview(category.imageUrl || null);
    setImageFile(null);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setSelectedCategory(null);
    setFormData({
      sectionName: "",
      slug: "",
      language: "",
      category: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      schema: "",
      openGraphTitle: "",
      openGraphDescription: "",
      openGraphImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
    });
    setPreview(null);
    setImageFile(null);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key] ?? "");
      });
      if (imageFile) data.append("image", imageFile);

      let res;
      if (isAdd) {
        res = await axios.post("/api/blog-categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCategories((prev) => [...prev, res.data.data]);
        toast.success("Category added");
      } else {
        if (!selectedCategory?._id) {
          toast.error("No category selected");
          return;
        }
        res = await axios.put(
          `/api/blog-categories/${selectedCategory._id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setCategories((prev) =>
          prev.map((c) => (c._id === selectedCategory._id ? res.data.data : c))
        );
        toast.success("Category updated");
      }
      setOpenModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save category");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container pt-20 mx-auto p-6 bg-white min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Category Management
        </h1>
        <p className="text-gray-600">
          Manage blog categories, SEO metadata, and images
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <input
          type="text"
          className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          onClick={handleAdd}
        >
          + Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-2xl font-bold text-blue-600">
            {categories.length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-green-600">{filtered.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Selected</p>
          <p className="text-2xl font-bold text-purple-600">
            {selectedCategories.length}
          </p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCategories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedCategories.length} category(ies) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedCategories([])}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedCategories.length === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="cursor-pointer w-4 h-4"
                    aria-label="select all categories"
                  />
                </th>
                <th className="p-3 border text-left">#</th>
                <th className="p-3 border text-left">Image</th>
                <th className="p-3 border text-left">Section</th>
                <th className="p-3 border text-left">Category</th>
                <th className="p-3 border text-left">Language</th>
                <th className="p-3 border text-left">Meta Title</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((category, i) => (
                  <tr
                    key={category._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedCategories.includes(category._id)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="p-3 border">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => toggleSelection(category._id)}
                        className="cursor-pointer w-4 h-4"
                        aria-label={`select category ${category.category}`}
                      />
                    </td>
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          className="h-14 w-14 object-cover rounded-lg shadow-sm"
                          alt={category.category || "category image"}
                        />
                      ) : (
                        <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-3 border font-medium text-gray-700">
                      {category.sectionName || "-"}
                    </td>
                    <td className="p-3 border font-semibold text-gray-800">
                      {category.category || "-"}
                    </td>
                    <td className="p-3 border">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {(category.language || "").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 border text-sm text-gray-600">
                      {category.metaTitle || "-"}
                    </td>
                    <td className="p-3 border">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          onClick={() => handleDelete(category._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          onClick={() =>
                            router.push(`/dashboard/admin/blog/${category._id}`)
                          }
                        >
                          Manage blog
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-500 border"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isAdd ? "Add New Category" : "Edit Category"}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Section Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., IT Certification"
                  value={formData.sectionName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sectionName: e.target.value,
                    }))
                  }
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., AWS Certification"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  placeholder="e.g., aws-certification"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border border-gray-300 p-3 rounded-lg w-full"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover mt-3 rounded-lg shadow-md"
                  />
                )}
              </div>

              {/* SEO Section */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-semibold text-gray-700 mb-3">
                  SEO Metadata
                </h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Meta Title"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="Meta Keywords"
                    value={formData.metaKeywords}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        metaKeywords: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                  <textarea
                    placeholder="Meta Description"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full h-20"
                  />
                  <textarea
                    placeholder="JSON Schema"
                    value={formData.schema}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        schema: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full h-20"
                  />
                </div>
              </div>

              {/* Open Graph */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Open Graph (Facebook)
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="OG Title"
                    value={formData.openGraphTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        openGraphTitle: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                  <textarea
                    placeholder="OG Description"
                    value={formData.openGraphDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        openGraphDescription: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full h-16"
                  />
                  <input
                    type="text"
                    placeholder="OG Image URL"
                    value={formData.openGraphImage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        openGraphImage: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                </div>
              </div>

              {/* Twitter Card */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Twitter Card
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Twitter Title"
                    value={formData.twitterTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        twitterTitle: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                  <textarea
                    placeholder="Twitter Description"
                    value={formData.twitterDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        twitterDescription: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full h-16"
                  />
                  <input
                    type="text"
                    placeholder="Twitter Image URL"
                    value={formData.twitterImage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        twitterImage: e.target.value,
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={handleSubmit}
              >
                {isAdd ? "Add Category" : "Update Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
