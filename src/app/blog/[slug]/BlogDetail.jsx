"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const BlogDetail = ({ slug }) => {
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        // ✅ Fetch single blog detail
        const res = await fetch(`/api/blogs/slug/${slug}?status=publish`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data?.data) setBlog(data.data);

        // ✅ Fetch recent blogs
        const recentRes = await fetch(`/api/blogs?limit=5`, {
          cache: "no-store",
        });
        const recentData = await recentRes.json();

        if (recentData?.data) {
          setRecentBlogs(recentData.data.filter((b) => b.slug !== slug));
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // ✨ Beautiful Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading your blog...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-3">
        <p className="text-2xl font-semibold text-gray-700">
          Blog not found 😕
        </p>
        <Link
          href="/blogsPages"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Go back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Blog Content */}
      <div className="md:col-span-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{blog.title}</h1>

        <div className="text-sm text-gray-500 mb-6">
          Published on{" "}
          {new Date(blog.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {blog.imageUrl && (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-80 object-cover rounded mb-6"
          />
        )}

        <div
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Other Blogs */}
      {recentBlogs.length > 0 && (
        <div className="md:col-span-1">
          <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Other Blogs</h2>
            <div className="space-y-6">
              {recentBlogs.slice(0, 3).map((b) => (
                <Link key={b._id} href={`/blogsPages/blog/${b.slug}`}>
                  <Card className="overflow-hidden transition-transform transform hover:scale-[1.02] duration-200 shadow-sm hover:shadow-md">
                    {b.imageUrl && (
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-36 object-cover"
                      />
                    )}
                    <CardContent className="p-3">
                      <h3 className="text-md font-semibold mb-1 line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <span className="text-sm text-blue-600 hover:underline">
                        Read more →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
