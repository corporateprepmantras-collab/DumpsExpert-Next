"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import RichTextEditor from "@/components/public/RichTextEditor";

const AllBlogsPage = () => {
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // Filter by category
  const [filterStatus, setFilterStatus] = useState(""); // Filter by status

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    content: " ",
    slug: "",
    imageFile: null,
    status: "unpublish",
    category: "",
    schema: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
  });

  // Fetch all categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/blog-categories");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch ALL blogs (no category filter)
  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/blogs"); // Get all blogs
      const data = res.data?.data || [];
      setBlogs(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllBlogs();
  }, []);

  // Filter blogs based on search, category, and status
  const filtered = blogs.filter((blog) => {
    const matchesSearch = (blog.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = filterCategory
      ? blog.category?._id === filterCategory
      : true;
    const matchesStatus = filterStatus ? blog.status === filterStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-convert slug: spaces to hyphens, uppercase to lowercase
    if (name === "slug") {
      const formattedSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
      setForm((prev) => ({ ...prev, [name]: formattedSlug }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, imageFile: file }));
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      content: " ",
      slug: "",
      imageFile: null,
      status: "unpublish",
      category: "",
      schema: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
    });
    setPreviewImage(null);
    setEditMode(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "imageFile" && value) {
          formData.append("image", value);
        } else {
          formData.append(key, value ?? "");
        }
      });

      if (editMode && editingId) {
        await axios.put(`/api/blogs/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog updated successfully ✅");
      } else {
        await axios.post("/api/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog created successfully 🎉");
      }

      resetForm();
      setShowModal(false);
      fetchAllBlogs();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      await axios.delete(`/api/blogs/${id}`);
      fetchAllBlogs();
      toast.success("Blog deleted successfully 🗑️");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete blog");
    }
  };

  const handleEdit = (blog) => {
    if (!blog) return;
    setForm({
      title: blog.title || "",
      content: blog.content || " ",
      slug: blog.slug || "",
      imageFile: null,
      status: blog.status || "unpublish",
      category: blog.category?._id || "",
      schema: blog.schema || "",
      metaTitle: blog.metaTitle || "",
      metaKeywords: blog.metaKeywords || "",
      metaDescription: blog.metaDescription || "",
    });
    setPreviewImage(blog.imageUrl || null);
    setEditMode(true);
    setEditingId(blog._id);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 pt-20 space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Blogs</h1>
          <p className="text-gray-600 mt-1">
            Manage all your blog posts from all categories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Blog
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-600">Total Blogs</p>
          <p className="text-2xl font-bold text-gray-800">{blogs.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {blogs.filter((b) => b.status === "publish").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-600">Unpublished</p>
          <p className="text-2xl font-bold text-orange-600">
            {blogs.filter((b) => b.status === "unpublish").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-blue-600">
            {categories.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Blogs
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="publish">Published</option>
              <option value="unpublish">Unpublished</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filtered.length} of {blogs.length} blogs
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editMode ? "Edit Blog" : "Add New Blog"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter blog title"
                  value={form.title}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Content Editor */}
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                <RichTextEditor
                  label="Content"
                  name="content"
                  value={form.content}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, content: value }))
                  }
                  error={""}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  placeholder="blog-post-url-slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the title (e.g., my-blog-post)
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                />
                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-40 w-auto rounded-lg border border-gray-200 shadow"
                    />
                  </div>
                )}
                {editMode &&
                  !previewImage &&
                  blogs.find((b) => b._id === editingId)?.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={blogs.find((b) => b._id === editingId)?.imageUrl}
                        alt="Current"
                        className="h-40 w-auto rounded-lg border border-gray-200 shadow"
                      />
                    </div>
                  )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                </select>
              </div>

              {/* SEO Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  SEO Settings
                </h3>

                {/* Meta Title */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    placeholder="SEO title for search engines"
                    value={form.metaTitle}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={form.metaKeywords}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Meta Description */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    placeholder="Brief description for search engines (150-160 characters)"
                    value={form.metaDescription}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Schema */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schema (JSON-LD)
                  </label>
                  <textarea
                    name="schema"
                    placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                    value={form.schema}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg w-full font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter structured data markup for better SEO (optional)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Saving...</span>
                    </>
                  ) : editMode ? (
                    "Update Blog"
                  ) : (
                    "Create Blog"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((blog, i) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="h-16 w-24 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            No image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {blog.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {blog.category?.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {blog.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          blog.status === "publish"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {blog.status === "publish" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          onClick={() => handleEdit(blog)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          onClick={() => handleDelete(blog._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-gray-500 text-lg mb-2">
                        No blogs found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {search || filterCategory || filterStatus
                          ? "Try adjusting your filters"
                          : "Create your first blog post to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBlogsPage;
