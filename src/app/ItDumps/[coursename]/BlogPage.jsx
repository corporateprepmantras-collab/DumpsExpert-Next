"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "../BlogCard";
import axios from "axios";
import { useParams } from "next/navigation";

const normalizeBlogs = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.blogs)) return data.blogs;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (typeof data === "object") {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) return data[key];
    }
    return Object.values(data);
  }
  return [];
};

const BlogPage = () => {
  const params = useParams();
  const categorySlug = params?.slug ?? null;

  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com";

        let normalizedBlogs = [];

        if (categorySlug) {
          // ✅ Fetch blogs by category
          const res = await axios.get(
            `${baseUrl}/api/blogs/blog-categories/${categorySlug}`
          );
          normalizedBlogs = normalizeBlogs(res.data.blogs);
        } else {
          // ✅ Fetch all blogs
          const blogsRes = await axios.get(`${baseUrl}/api/blogs`);
          normalizedBlogs = normalizeBlogs(blogsRes.data);
        }

        setBlogs(normalizedBlogs);
        setFilteredBlogs(normalizedBlogs);

        // ✅ Sort recent posts
        const recent = [...normalizedBlogs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setRecentPosts(recent);

        // ✅ Fetch categories
        const catRes = await axios.get(`${baseUrl}/api/blogs/blog-categories`);
        setCategories(normalizeBlogs(catRes.data));
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to fetch blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  // ✅ Search filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredBlogs(blogs);
      return;
    }

    const filtered = blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(term) ||
        blog.metaDescription?.toLowerCase().includes(term)
    );
    setFilteredBlogs(filtered);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ================= Header Section ================= */}
      <div
        className="w-full h-80 bg-cover bg-center py-14 px-4 text-white"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/03/16/91/28/360_F_316912806_RCeHVmUx5LuBMi7MKYTY5arkE4I0DcpU.jpg)",
        }}
      >
        <h1 className="text-4xl pt-24 font-bold text-center mb-6">
          OUR BLOGS
        </h1>

        {/* ================= Categories Filter ================= */}
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/blogsPages/blog-categories">
            <button
              className={`px-4 py-1 rounded-full border ${
                !categorySlug ? "bg-white text-black" : "bg-transparent"
              }`}
            >
              All
            </button>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat._id ?? cat.category}
              href={`/blogsPages/${cat.category?.toLowerCase()}`}
            >
              <button
                className={`px-4 py-1 rounded-full border border-white ${
                  categorySlug === cat.category?.toLowerCase()
                    ? "bg-white text-black"
                    : "bg-transparent"
                }`}
              >
                {cat.category}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* ================= Main Content ================= */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">
        {/* ================= Blog List ================= */}
        <div className="w-full lg:w-3/4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-center text-gray-500 col-span-full">
              Loading blogs...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 col-span-full">{error}</p>
          ) : filteredBlogs.length === 0 ? (
            <p className="text-gray-600 italic col-span-full">No blogs found.</p>
          ) : (
            filteredBlogs.map((blog, idx) => (
              <Link
                key={blog._id ?? idx}
                href={`/blogsPages/by-slug/${blog.slug}`}
              >
                <BlogCard
                  title={blog.title}
                  description={blog.metaDescription}
                  date={
                    blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : ""
                  }
                  imageUrl={blog.imageUrl}
                />
              </Link>
            ))
          )}
        </div>

        {/* ================= Sidebar ================= */}
        <div className="w-full lg:w-1/4 space-y-8">
          {/* Search box */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search blog..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          />

          {/* Recent posts */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Recent Posts</h4>
            <ul className="text-sm space-y-2">
              {recentPosts.map((post) => (
                <li key={post._id ?? post.slug}>
                  <Link
                    href={`/blogsPages/by-slug/${post.slug}`}
                    className="text-blue-600 hover:underline block"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
