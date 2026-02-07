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
      <div className=" pt-10 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-600">
              Select a category to explore specialized content
            </p>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
          lg:grid-cols-5 gap-6 mb-16 justify-items-center place-items-center"
          >
            {categories.map((cat) => (
              <Link
                key={cat._id ?? cat.category}
                href={`/blogs/${cat.slug || cat.category}`}
              >
                <div
                  className="group relative bg-white rounded-2xl shadow-md
                 transition-transform duration-200 hover:scale-105 
                 overflow-hidden border border-gray-100 cursor-pointer h-48"
                >
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

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[88%]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium">
                    Loading amazing content...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <p className="text-red-600 text-lg font-semibold">
                      {error}
                    </p>
                  </div>
                </div>
              ) : !Array.isArray(blogs) || blogs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <svg
                      className="w-24 h-24 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-800 text-xl font-bold mb-2">
                      No blogs found
                    </p>
                    <p className="text-gray-500 text-sm">
                      Check back later for new content
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {blogs.map((blog, idx) => (
                    <Link
                      key={blog._id ?? blog.slug ?? idx}
                      href={`/blog/${blog.slug}`}
                      className="block"
                    >
                      <article className="bg-white h-full flex flex-col rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2">
                        {/* Image Section */}
                        {blog.imageUrl && (
                          <div className="relative h-48 w-full overflow-hidden">
                            <img
                              src={blog.imageUrl}
                              alt={
                                blog.title || blog.sectionName || "Blog image"
                              }
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        )}

                        {/* Content Section */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {(typeof blog.category === "string"
                                ? blog.category
                                : "") || "Article"}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                            {blog.title || blog.sectionName || "Untitled"}
                          </h2>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <svg
                              className="w-3.5 h-3.5 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {blog.createdAt
                              ? new Date(blog.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : ""}
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                            {blog.metaDescription ||
                              blog.description ||
                              "Discover more about this topic..."}
                          </p>

                          <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 mt-auto">
                            <span className="mr-1">Read More</span>
                            <svg
                              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
