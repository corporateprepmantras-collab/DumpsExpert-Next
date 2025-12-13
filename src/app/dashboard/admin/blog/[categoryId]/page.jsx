"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import RichTextEditor from "@/components/public/RichTextEditor";

const BlogPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ For category dropdown
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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
    category: categoryId || "", // ✅ Category field
    schema: "", // ✅ Schema field
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
  });

  // ✅ Fetch all categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/blog-categories");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // fetch blogs
  const fetchBlogs = async () => {
    if (!categoryId) {
      setBlogs([]);
      setCategoryName("");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/blogs?category=${categoryId}`);
      const data = res.data?.data || [];
      setBlogs(data);
      // If backend returns category object with every blog item, grab name from first item
      const nameFromFirst = data?.[0]?.category?.category;
      setCategoryName(nameFromFirst || "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch blogs");
      setBlogs([]);
      setCategoryName("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(); // ✅ Load categories on mount
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // ✅ Update form category when categoryId changes
  useEffect(() => {
    if (categoryId && !editMode) {
      setForm((prev) => ({ ...prev, category: categoryId }));
    }
  }, [categoryId, editMode]);

  const filtered = blogs.filter((b) =>
    (b.title || "").toLowerCase().includes(search.toLowerCase())
  );

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

  const resetForm = () => {
    setForm({
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
    setPreviewImage(null);
    setEditMode(false);
    setEditingId(null);
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

      // ✅ If category changed, navigate to new category page
      if (form.category !== categoryId) {
        router.push(`/admin/blogs/${form.category}`);
      } else {
        fetchBlogs();
      }
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
      fetchBlogs();
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
      category: blog.category?._id || categoryId || "",
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

  if (loading) return <p className="p-6 pt-20">Loading...</p>;

  return (
    <div className="p-6 pt-20 space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold">
        Blogs for Category {categoryName || "—"}
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* Button to open modal */}
      <button
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add Blog
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative my-10">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Blog" : "Add New Blog"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 max-h-[75vh] overflow-y-auto pr-2"
            >
              {/* ✅ Category Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  classNadme="border p-2 rounded w-full"
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
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div className="max-h-96 overflow-y-scroll">
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

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  placeholder="Slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {editMode && blogs.find((b) => b._id === editingId)?.image && (
                  <img
                    src={blogs.find((b) => b._id === editingId)?.image}
                    alt="preview"
                    className="mt-2 h-24 w-24 object-cover rounded"
                  />
                )}
              </div>

              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-auto rounded border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                </select>
              </div>

              {/* ✅ Schema Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Schema (JSON-LD)
                </label>
                <textarea
                  name="schema"
                  placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                  value={form.schema}
                  onChange={handleChange}
                  className="border p-2 rounded w-full font-mono text-sm"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter structured data markup for SEO (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  placeholder="Meta Title"
                  value={form.metaTitle}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  placeholder="Meta Keywords"
                  value={form.metaKeywords}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  placeholder="Meta Description"
                  value={form.metaDescription}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center ${
                  saving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {saving ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : editMode ? (
                  "Update Blog"
                ) : (
                  "Save Blog"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Blogs List */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">#</th>
            <th className="border px-3 py-2">Image</th>
            <th className="border px-3 py-2">Title</th>
            <th className="border px-3 py-2">Slug</th>
            <th className="border px-3 py-2">Category</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((blog, i) => (
            <tr key={blog._id}>
              <td className="border px-3 py-2">{i + 1}</td>
              <td className="border px-3 py-2">
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="h-12 w-auto rounded"
                  />
                ) : (
                  "No image"
                )}
              </td>
              <td className="border px-3 py-2">{blog.title}</td>
              <td className="border px-3 py-2">{blog.slug}</td>
              <td className="border px-3 py-2">
                {blog.category?.category || "N/A"}
              </td>
              <td className="border px-3 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    blog.status === "publish"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {blog.status}
                </span>
              </td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(blog._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4">
                No blogs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BlogPage;
