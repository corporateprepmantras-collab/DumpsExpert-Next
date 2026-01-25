"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const BlogPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const filtered = blogs.filter((b) =>
    (b.title || "").toLowerCase().includes(search.toLowerCase()),
  );

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

  if (loading)
    return (
      <p className="p-6 pt-20">
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </p>
    );

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
        onClick={() =>
          router.push(`/dashboard/admin/blog/${categoryId}/create`)
        }
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add Blog
      </button>

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
                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/blog/${categoryId}/create?edit=${blog._id}`,
                    )
                  }
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
