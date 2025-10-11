"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function BlogPage() {
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const params = useParams();
  const pathname = usePathname();
  const selectedCategory = params?.slug || ""; // will be "" when on /blogsPages/blog-categories

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`/api/blogs/blog-categories`);
        const valid = res.data?.filter((c) => !!c.category);
        setCategories(valid);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch blogs (based on route)
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let res;

        if (pathname.includes("/blogsPages/blog-categories")) {
          // Fetch all blogs
          res = await axios.get(`/api/blogs`);
          setBlogs(res.data?.data || []);
        } else if (selectedCategory) {
          // Fetch by category slug
          res = await axios.get(`/api/blogsPages/${selectedCategory}`);
          setBlogs(res.data?.blogs || []);
        }

        // Top 10 recent posts
        const all = res?.data?.data || res?.data?.blogs || [];
        const recent = [...all]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);
        setRecentPosts(recent);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="w-full h-80 bg-cover bg-center py-14 px-4 text-white"
        style={{
          backgroundImage: `url(https://t3.ftcdn.net/jpg/03/16/91/28/360_F_316912806_RCeHVmUx5LuBMi7MKYTY5arkE4I0DcpU.jpg)`,
        }}
      >
        <h1 className="text-4xl pt-24 font-bold text-center mb-6">OUR BLOGS</h1>

        {/* ✅ Category Tabs */}
        {/* ✅ Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {/* All */}
          <Link href="/blogsPages/blog-categories">
            <button
              className={`px-4 py-1 rounded-full border ${
                pathname === "/blogsPages/blog-categories"
                  ? "bg-white text-black font-semibold"
                  : "bg-transparent border-white"
              }`}
            >
              All
            </button>
          </Link>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const slug = cat.category.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link key={cat._id} href={`/blogsPages/${slug}`}>
                <button
                  className={`px-4 py-1 rounded-full border ${
                    selectedCategory === slug
                      ? "bg-white text-black font-semibold"
                      : "bg-transparent border-white"
                  }`}
                >
                  {cat.category}
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Blog Cards + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">
        {/* Blogs */}
        <div className="w-full lg:w-3/4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-center text-gray-500 col-span-full">
              Loading blogs...
            </p>
          ) : blogs.length === 0 ? (
            <p className="text-gray-600 italic col-span-full">
              No blogs found.
            </p>
          ) : (
            blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogsPages/blog/${blog.slug || blog._id}`}
              >
                <div className="bg-gray-100 h-full flex flex-col justify-between rounded-xl shadow-md p-4 hover:shadow-lg transition">
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.sectionName}
                      className="w-full h-60 object-cover rounded mb-4"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {blog.sectionName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                      {blog.metaDescription}
                    </p>
                  </div>
                  <p className="text-blue-600 mt-4 text-sm font-medium hover:underline">
                    Read More →
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-8">
          {/* Search */}
          <input
            type="text"
            placeholder="Search blog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />

          {/* Recent Posts */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Recent Posts</h4>
            <ul className="text-sm space-y-2">
              {recentPosts.map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/blogsPages/blog/${post.slug || post._id}`}
                    className="text-blue-600 hover:underline block"
                  >
                    {post.sectionName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
