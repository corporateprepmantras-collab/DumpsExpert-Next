"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function BlogSection({ blogs = [], categories = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesPerView = 4;

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + slidesPerView >= blogs.length ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(blogs.length - slidesPerView, 0) : prev - 1,
    );
  };

  const visibleBlogs = blogs
    .slice()
    .reverse()
    .slice(currentIndex, currentIndex + slidesPerView);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6900] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF6900] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Latest Exam Tips &{" "}
            <span className="bg-gradient-to-r from-[#FF6900] to-[#FF8C42] bg-clip-text text-transparent">
              Insights
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay updated with the latest certification guides, study tips, and
            industry insights
          </p>
        </motion.div>

        {/* Categories */}
        {categories?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full border-2 border-[#FF6900] text-[#FF6900] hover:bg-[#FF6900] hover:text-white transition-all duration-300 font-medium"
              >
                <Link href={`/blogs/${cat.slug}`}>{cat.category}</Link>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Blog Carousel */}
        <div className="relative">
          {blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No blogs found.</p>
            </div>
          ) : (
            <>
              {/* Navigation */}
              {blogs.length > slidesPerView && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white hover:bg-[#FF6900] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white hover:bg-[#FF6900] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Blog Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {visibleBlogs.map((blog, index) => {
                    const blogUrl = `/blog/${encodeURIComponent(
                      blog.slug || blog.title,
                    )}`;

                    return (
                      <Link
                        key={blog.id || index}
                        href={blogUrl}
                        className="block"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 hover:border-[#FF6900]/30 cursor-pointer"
                        >
                          {blog.imageUrl && (
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-gray-50">
                              <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}

                          <div className="p-6">
                            {blog.createdAt && (
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4 mr-2 text-[#FF6900]" />
                                {new Date(blog.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            )}

                            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#FF6900] transition">
                              {blog.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                              {blog.metaDescription ||
                                "Discover expert insights and tips to ace your certification exams."}
                            </p>

                            <div className="flex items-center text-[#FF6900] font-semibold">
                              Read Article
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/blogs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6900] to-[#FF8C42] text-white px-8 py-4 rounded-full font-semibold shadow-lg"
            >
              Explore All Blogs
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
