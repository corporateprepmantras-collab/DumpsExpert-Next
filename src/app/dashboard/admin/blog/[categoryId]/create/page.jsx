"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import RichTextEditor from "@/components/public/RichTextEditor";

const CreateEditBlogPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    content: " ",
    slug: "",
    imageFile: null,
    status: "unpublish",
    category: categoryId || "",
    schema: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
  });

  const isEditMode = !!editId;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/blog-categories");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch blog for editing
  const fetchBlogForEdit = async () => {
    if (!editId) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/blogs/${editId}`);
      const blog = res.data?.data || res.data;

      setForm({
        title: blog.title || "",
        content: blog.content || " ",
        slug: blog.slug || "",
        imageFile: null,
        status: blog.status || "unpublish",
        category: blog.category?._id || categoryId || "",
        schema: blog.schema || "",
        metaTitle: blog.metaTitle || "",
        metaKeywords: blog.metaKeywords || "",
        metaDescription: blog.metaDescription || "",
      });
      setPreviewImage(blog.imageUrl || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (editId) {
      fetchBlogForEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, imageFile: file }));
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      if (isEditMode) {
        await axios.put(`/api/blogs/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog updated successfully ✅");
      } else {
        await axios.post("/api/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog created successfully 🎉");
      }

      // Navigate back to the category page
      router.push(`/dashboard/admin/blog/${form.category}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/admin/blog/${categoryId}`)}
              className="text-gray-600 hover:text-black font-medium"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Blog" : "Create New Blog"}
            </h1>
          </div>

          <button
            type="submit"
            form="blog-form"
            disabled={saving}
            className={`bg-green-600 text-white px-6 py-2 rounded-lg font-semibold ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </span>
            ) : isEditMode ? (
              "Update Blog"
            ) : (
              "Publish Blog"
            )}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter blog title..."
                  value={form.title}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <RichTextEditor
                  label="Content"
                  name="content"
                  value={form.content}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, content: value }))
                  }
                  error=""
                />
              </div>

              {/* SEO Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      placeholder="Meta title for SEO..."
                      value={form.metaTitle}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      name="metaKeywords"
                      placeholder="keyword1, keyword2, keyword3..."
                      value={form.metaKeywords}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      placeholder="Brief description for search engines..."
                      value={form.metaDescription}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Schema (JSON-LD)
                    </label>
                    <textarea
                      name="schema"
                      placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                      value={form.schema}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter structured data markup for SEO (optional)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Category & Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="publish">Publish</option>
                      <option value="unpublish">Unpublish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      placeholder="blog-url-slug"
                      value={form.slug}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL-friendly version of the title
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-lg w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditBlogPage;
