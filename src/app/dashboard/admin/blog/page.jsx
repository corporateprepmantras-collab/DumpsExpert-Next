// app/admin/blog/page.jsx
"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BlogAdminPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    category: "",
    status: "unpublish",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    schema: "{}",
    image: null,
  });

  const [categoryForm, setCategoryForm] = useState({
    sectionName: "",
    category: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    schema: "{}",
    image: null,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.data || []);
      } else {
        setError("Failed to load blogs");
      }
    } catch (err) {
      setError("Failed to load blogs");
      console.error("Blog fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/blog-categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  // Blog CRUD operations
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlogs(blogs.filter((b) => b._id !== blogId));
        toast.success("Blog deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(blogForm).forEach((key) => {
        if (blogForm[key] !== null) {
          formData.append(key, blogForm[key]);
        }
      });

      const url = editingBlog ? `/api/blogs/${editingBlog._id}` : "/api/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingBlog
            ? "Blog updated successfully"
            : "Blog created successfully"
        );
        setIsBlogModalOpen(false);
        setEditingBlog(null);
        setBlogForm({
          title: "",
          content: "",
          category: "",
          status: "unpublish",
          metaTitle: "",
          metaKeywords: "",
          metaDescription: "",
          schema: "{}",
          image: null,
        });
        fetchBlogs();
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(`Save failed: ${err.message}`);
    }
  };

  // Category CRUD operations
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== categoryId));
        toast.success("Category deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(categoryForm).forEach((key) => {
        if (categoryForm[key] !== null) {
          formData.append(key, categoryForm[key]);
        }
      });

      const url = editingCategory
        ? `/api/blog-categories/${editingCategory._id}`
        : "/api/blog-categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryForm({
          sectionName: "",
          category: "",
          metaTitle: "",
          metaKeywords: "",
          metaDescription: "",
          schema: "{}",
          image: null,
        });
        fetchCategories();
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(`Save failed: ${err.message}`);
    }
  };

  // Open modals with data for editing
  const openEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      status: blog.status,
      metaTitle: blog.metaTitle,
      metaKeywords: blog.metaKeywords,
      metaDescription: blog.metaDescription,
      schema: blog.schema,
      image: null,
    });
    setIsBlogModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      sectionName: category.sectionName,
      category: category.category,
      metaTitle: category.metaTitle,
      metaKeywords: category.metaKeywords,
      metaDescription: category.metaDescription,
      schema: category.schema,
      image: null,
    });
    setIsCategoryModalOpen(true);
  };

  // Filter data based on search
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      blog.content.toLowerCase().includes(blogSearch.toLowerCase()) ||
      blog.category.toLowerCase().includes(blogSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(
    (category) =>
      category.sectionName
        .toLowerCase()
        .includes(categorySearch.toLowerCase()) ||
      category.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}.{" "}
              <button
                onClick={() => window.location.reload()}
                className="font-medium text-red-700 hover:text-red-600 underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-bold mb-8 ">Blog Admin Panel</h1>

      {/* Blog Posts Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Blog Posts</h2>
          <button
            onClick={() => {
              setEditingBlog(null);
              setBlogForm({
                title: "",
                content: "",
                category: "",
                status: "unpublish",
                metaTitle: "",
                metaKeywords: "",
                metaDescription: "",
                schema: "{}",
                image: null,
              });
              setIsBlogModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add New Blog
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search blogs..."
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
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
              {filteredBlogs.map((blog) => (
                <tr key={blog._id}>
                  {/* Image column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>

                  {/* Title column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {blog.title}
                    </div>
                  </td>

                  {/* Category column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{blog.category}</div>
                  </td>

                  {/* Status column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.status === "publish"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditBlog(blog)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Categories</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({
                sectionName: "",
                category: "",
                metaTitle: "",
                metaKeywords: "",
                metaDescription: "",
                schema: "{}",
                image: null,
              });
              setIsCategoryModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add New Category
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.sectionName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {category.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>

              <form onSubmit={handleSaveBlog}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, title: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content *
                    </label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, content: e.target.value })
                      }
                      rows={6}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={blogForm.category}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, category: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status *
                    </label>
                    <select
                      value={blogForm.status}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, status: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="unpublish">Unpublished</option>
                      <option value="publish">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image {!editingBlog && "*"}
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, image: e.target.files[0] })
                      }
                      className="w-full p-2 border rounded"
                      accept="image/*"
                      required={!editingBlog}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Title *
                    </label>
                    <input
                      type="text"
                      value={blogForm.metaTitle}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, metaTitle: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Keywords *
                    </label>
                    <input
                      type="text"
                      value={blogForm.metaKeywords}
                      onChange={(e) =>
                        setBlogForm({
                          ...blogForm,
                          metaKeywords: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Description *
                    </label>
                    <textarea
                      value={blogForm.metaDescription}
                      onChange={(e) =>
                        setBlogForm({
                          ...blogForm,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Schema (JSON)
                    </label>
                    <textarea
                      value={blogForm.schema}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, schema: e.target.value })
                      }
                      rows={4}
                      className="w-full p-2 border rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsBlogModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    {editingBlog ? "Update" : "Create"} Blog
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>

              <form onSubmit={handleSaveCategory}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.sectionName}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          sectionName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.category}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image {!editingCategory && "*"}
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          image: e.target.files[0],
                        })
                      }
                      className="w-full p-2 border rounded"
                      accept="image/*"
                      required={!editingCategory}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Title *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.metaTitle}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          metaTitle: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Keywords *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.metaKeywords}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          metaKeywords: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Description *
                    </label>
                    <textarea
                      value={categoryForm.metaDescription}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Schema (JSON)
                    </label>
                    <textarea
                      value={categoryForm.schema}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          schema: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full p-2 border rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    {editingCategory ? "Update" : "Create"} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
