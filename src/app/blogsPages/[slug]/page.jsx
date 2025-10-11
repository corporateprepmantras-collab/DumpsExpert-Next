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
  const params = useParams(); // get slug from URL
  const categorySlug = params?.slug ?? null; // assume route is /blogs/[slug]

  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        let normalizedBlogs = [];
        if (categorySlug) {
          // ✅ fetch by slug
          const res = await axios.get(
            `/api/blogs/blog-categories/${categorySlug}`
          );
          normalizedBlogs = normalizeBlogs(res.data.blogs);
        } else {
          // ✅ fetch all blogs
          const blogsRes = await axios.get("/api/blogs");
          normalizedBlogs = normalizeBlogs(blogsRes.data);
        }

        setFilteredBlogs(normalizedBlogs);

        // recent posts
        const recent = [...normalizedBlogs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setRecentPosts(recent);

        // categories (still global)
        const categoriesRes = await axios.get("/api/blogs/blog-categories");
        setCategories(normalizeBlogs(categoriesRes.data));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Check console or network tab.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-white">
      <div
        className="w-full h-80 bg-cover bg-center py-14 px-4 text-white"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/03/16/91/28/360_F_316912806_RCeHVmUx5LuBMi7MKYTY5arkE4I0DcpU.jpg)",
        }}
      >
        <h1 className="text-4xl pt-24 font-bold text-center mb-6">OUR BLOGS</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {/* All */}
          <Link href="/blogsPages/blog-categories">
            <button className={`px-4 py-1 rounded-full border `}>All</button>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id ?? cat.category}
              href={`/blogsPages/${cat.category}`}
              className={`px-4 py-1 rounded-full border border-white ${
                categorySlug === cat.category.toLowerCase()
                  ? "bg-white text-black"
                  : "bg-transparent"
              }`}
            >
              {cat.category}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-3/4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-center text-gray-500 col-span-full">
              Loading blogs...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 col-span-full">{error}</p>
          ) : filteredBlogs.length === 0 ? (
            <p className="text-gray-600 italic col-span-full">
              No blogs found.
            </p>
          ) : (
            filteredBlogs.map((blog, idx) => (
              <BlogCard
                key={blog._id ?? blog.slug ?? idx}
                slug={blog.slug}
                title={blog.title}
                description={blog.metaDescription}
                date={
                  blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString()
                    : ""
                }
                imageUrl={blog.imageUrl}
              />
            ))
          )}
        </div>

        <div className="w-full lg:w-1/4 space-y-8">
          <input
            type="text"
            placeholder="Search blog..."
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />

          <div>
            <h4 className="text-lg font-semibold mb-2">Recent Posts</h4>
            <ul className="text-sm space-y-2">
              {recentPosts.map((post) => (
                <li key={post._id ?? post.slug}>
                  <Link
                    href={`/blogsPages/${post.categories}`}
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
