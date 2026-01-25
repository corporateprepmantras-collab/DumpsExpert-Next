"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";
import axios from "axios";
import Head from "next/head";

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
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // ✅ Fetch SEO data
        const seoRes = await axios.get("/api/seo/blog");
        setSeoData(seoRes.data);

        // ✅ Fetch blogs
        const blogsRes = await axios.get("/api/blogs");
        const normalizedBlogs = normalizeBlogs(blogsRes.data);
        setBlogs(normalizedBlogs);

        const recent = [...normalizedBlogs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setRecentPosts(recent);

        // ✅ Fetch categories
        const categoriesRes = await axios.get("/api/blogs/blog-categories");
        const normalizedCategories = normalizeBlogs(categoriesRes.data);
        setCategories(normalizedCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Check console or network tab.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* ✅ SEO Head Section */}
      {seoData && (
        <Head>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords} />
          <link rel="canonical" href={seoData.canonicalurl} />

          {/* Open Graph / Facebook */}
          <meta property="og:title" content={seoData.ogtitle} />
          <meta property="og:description" content={seoData.ogdescription} />
          <meta property="og:image" content={seoData.ogimage} />
          <meta property="og:url" content={seoData.ogurl} />
          <meta property="og:type" content="website" />

          {/* Twitter */}
          <meta
            name="twitter:card"
            content={seoData.twittercard || "summary_large_image"}
          />
          <meta name="twitter:title" content={seoData.twittertitle} />
          <meta
            name="twitter:description"
            content={seoData.twitterdescription}
          />
          <meta name="twitter:image" content={seoData.twitterimage} />

          {/* JSON-LD Schema */}
          {seoData.schema && (
            <script type="application/ld+json">{seoData.schema}</script>
          )}
        </Head>
      )}

      {/* ✅ Blog Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-10 pt-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-600">
              Select a category to explore specialized content
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16 justify-items-center place-items-center">
            {categories.map((cat) => (
              <Link
                key={cat._id ?? cat.category}
                href={`/blogs/${cat.slug || cat.category}`}
              >
                <div className="group relative bg-white rounded-2xl shadow-md transition-transform duration-200 hover:scale-105 overflow-hidden border border-gray-100 cursor-pointer h-48">
                  {/* Image */}
                  {cat.imageUrl ? (
                    <div className="w-full h-32 overflow-hidden">
                      <img
                        src={cat.imageUrl}
                        alt={cat.category}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <span className="text-5xl font-bold text-blue-600 opacity-20">
                        {cat.category?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Category Name */}
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {cat.category}
                    </h3>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200 flex items-end justify-center pb-6">
                    <span className="text-blue-600 font-semibold text-sm group-hover:block hidden">
                      Explore {cat.category} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-10">
          {/* Latest Blogs Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Latest Articles
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-3/4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-center text-gray-500 col-span-full">
                  Loading blogs...
                </p>
              ) : error ? (
                <p className="text-center text-red-500 col-span-full">
                  {error}
                </p>
              ) : !Array.isArray(blogs) || blogs.length === 0 ? (
                <p className="text-gray-600 italic col-span-full">
                  No blogs found.
                </p>
              ) : (
                blogs.map((blog, idx) => (
                  <Link href={`/blog/${blog.slug}`} className="block">
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
                  </Link>
                ))
              )}
            </div>

            <div className="w-full lg:w-1/4">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-xl font-bold mb-4 text-gray-900">
                    Recent Posts
                  </h4>
                  <ul className="space-y-3">
                    {recentPosts.map((post) => (
                      <li
                        key={post._id ?? post.slug}
                        className="border-b border-gray-100 pb-3 last:border-0"
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline block transition-colors"
                        >
                          <span className="text-sm font-medium line-clamp-2">
                            {post.title}
                          </span>
                        </Link>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
