"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const BlogDetail = ({ slug }) => {
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchAllData = async () => {
      try {
        // ✅ Parallel fetch - much faster than sequential
        const [blogRes, recentRes] = await Promise.all([
          fetch(`/api/blogs/slug/${slug}?status=publish`, {
            next: { revalidate: 60 }, // Cache for 1 minute
          }),
          fetch(`/api/blogs?limit=5`, {
            next: { revalidate: 60 }, // Cache for 1 minute
          }),
        ]);

        const [blogData, recentData] = await Promise.all([
          blogRes.json(),
          recentRes.json(),
        ]);

        // Set blog data
        if (blogData?.data) {
          setBlog(blogData.data);

          // ✅ Fetch category name if needed (in parallel with setting state)
          if (blogData.data.category) {
            fetch(`/api/blog-categories/${blogData.data.category}`, {
              next: { revalidate: 60 }, // Cache categories for 1 minute
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.data?.name) {
                  setCategoryName(data.data.name);
                }
              })
              .catch(() => setCategoryName("Blog Article"));
          }
        }

        // Set recent blogs
        if (recentData?.data) {
          setRecentBlogs(recentData.data.filter((b) => b.slug !== slug));
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [slug]);

  // ✨ Optimized Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        {/* Skeleton Hero */}
        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
            <div className="h-6 bg-white/30 rounded-full w-24 mb-4"></div>
            <div className="h-12 bg-white/30 rounded-lg w-3/4"></div>
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
            <svg
              className="w-20 h-20 mx-auto text-gray-300 mb-4"
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
            <p className="text-2xl font-bold text-gray-800 mb-2">
              Blog not found
            </p>
            <p className="text-gray-500 mb-6">
              The blog post you're looking for doesn't exist
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Hero Banner with Image - Responsive & Optimized */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {blog.imageUrl && (
          <>
            <img
              src={blog.imageUrl}
              alt={blog.title || blog.sectionName}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </>
        )}
        <div className="relative max-w-5xl  mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
          <div className="flex flex-wrap pt-20 items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
              {categoryName || " Blog Article"}
            </span>
            <div className="flex items-center text-white/90 text-xs sm:text-sm">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
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
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            {blog.title || blog.sectionName}
          </h1>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Blog Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12">
              {blog.metaDescription && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed italic">
                    {blog.metaDescription}
                  </p>
                </div>
              )}

              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-h1:text-xl sm:prose-h1:text-2xl md:prose-h1:text-3xl
                  prose-h2:text-lg sm:prose-h2:text-xl md:prose-h2:text-2xl
                  prose-h3:text-base sm:prose-h3:text-lg md:prose-h3:text-xl
                  prose-p:leading-relaxed prose-p:text-gray-700 prose-p:text-sm sm:prose-p:text-base
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:break-words
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-4 sm:prose-ul:pl-5
                  prose-li:text-gray-700 prose-li:marker:text-blue-600 prose-li:text-sm sm:prose-li:text-base
                  prose-img:rounded-lg sm:prose-img:rounded-xl prose-img:shadow-md prose-img:w-full prose-img:h-auto
                  prose-code:bg-gray-100 prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-code:break-words
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-3 sm:prose-blockquote:px-4 prose-blockquote:text-sm sm:prose-blockquote:text-base
                  prose-table:text-xs sm:prose-table:text-sm prose-table:overflow-x-auto prose-table:block sm:prose-table:table
                  break-words overflow-wrap-anywhere"
                dangerouslySetInnerHTML={{
                  __html: blog.content || blog.Description,
                }}
              />

              {/* Share & Back Button - Responsive */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/blogs"
                  className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-full transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Blogs
                </Link>
                <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>5 min read</span>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Responsive */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4 sm:space-y-6">
              {/* Related Blogs */}
              {recentBlogs.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg pt-4 sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    Related Posts
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {recentBlogs.slice(0, 5).map((b, index) => (
                      <Link key={b._id} href={`/blog/${b.slug}`}>
                        <div className="group p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                          {/* Full-width image on top */}
                          {b.imageUrl ? (
                            <div className="w-full overflow-hidden rounded-lg">
                              <img
                                src={b.imageUrl}
                                alt={b.title || b.sectionName}
                                className="w-full h-28 sm:h-32 md:h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-28 sm:h-32 md:h-36 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                          )}

                          {/* Title below image */}
                          <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors leading-snug mb-1">
                              {b.title || b.sectionName}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
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
                              {new Date(b.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Card - Responsive */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                  Need Help?
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Get expert guidance and support for your certification journey
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors text-sm sm:text-base"
                >
                  Contact Us
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
