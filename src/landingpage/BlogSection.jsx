"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export default function BlogSection({ blogs = [], categories = [] }) {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">
            Latest Exam Tips &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Insights
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Stay updated with the latest certification guides, study tips, and
            industry insights
          </p>
        </motion.div>

        {/* Categories - Responsive Grid */}
        {categories && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 sm:mb-10 md:mb-12"
          >
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat, index) => (
                <motion.a
                  key={cat._id || cat.category}
                  href={`/blogsPages/${cat.category}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="capitalize text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange-500 transition-colors">
                    {cat.category}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blog Grid - Fully Responsive */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          {!blogs || blogs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <p className="text-gray-500 text-base sm:text-lg">
                No blogs found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {blogs
                .slice()
                .reverse()
                .slice(0, 6)
                .map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
                  >
                    <a
                      href={`/blogsPages/blog/${blog.slug || blog._id}`}
                      className="flex flex-col h-full"
                    >
                      {blog.imageUrl && (
                        <div className="relative h-48 sm:h-52 md:h-56 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden flex-shrink-0">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title || blog.sectionName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-orange-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Featured
                          </div>
                        </div>
                      )}

                      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                        {blog.createdAt && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
                          {blog.title || blog.sectionName}
                        </h3>

                        <p className="text-gray-600 text-sm sm:text-base flex-grow line-clamp-3 mb-3 sm:mb-4">
                          {blog.metaDescription ||
                            "Discover expert insights and tips to ace your certification exams."}
                        </p>

                        <div className="flex items-center gap-2 text-orange-500 font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all duration-300 pt-3 border-t border-gray-100 mt-auto">
                          <span>Read Article</span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                        </div>
                      </div>

                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </a>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.a
            href="/blogsPages/blog-categories"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#1f424b] to-[#2f5058] hover:from-[#2f5058] hover:to-[#1f424b] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
            <span>Explore All Blogs</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
