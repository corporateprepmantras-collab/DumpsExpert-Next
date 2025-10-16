"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";

const BlogClient = ({ categorySlug, blogs, categories }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlogs = useMemo(() => {
    if (!searchTerm) return blogs;
    const term = searchTerm.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(term) ||
        blog.metaDescription?.toLowerCase().includes(term)
    );
  }, [searchTerm, blogs]);

  const recentPosts = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

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
        <h1 className="text-4xl pt-24 font-bold text-center mb-6">OUR BLOGS</h1>

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
              href={`/blogsPages/${cat.category.toLowerCase()}`}
            >
              <button
                className={`px-4 py-1 rounded-full border border-white ${
                  categorySlug === cat.category.toLowerCase()
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
          {filteredBlogs.length === 0 ? (
            <p className="text-gray-600 italic col-span-full">
              No blogs found.
            </p>
          ) : (
            filteredBlogs.map((blog, idx) => (
              <Link
                key={blog._id ?? idx}
                href={`/blogsPages/blog/${blog.slug}`}
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
                    {post.title || post.category}
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

export default BlogClient;
