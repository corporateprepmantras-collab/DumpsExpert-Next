"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export default function BlogSection({ blogs = [], categories = [] }) {
  return (
    <section className="py-20 px-4 md:px-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Latest Exam Tips &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Insights
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay updated with the latest certification guides, study tips, and
            industry insights
          </p>
        </motion.div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
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
                className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Tag className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="capitalize text-sm font-medium text-gray-700 group-hover:text-orange-500 transition-colors">
                  {cat.category}
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {!blogs || blogs.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">No blogs found.</p>
            </div>
          ) : (
            blogs
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
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <a
                    href={`/blogsPages/blog/${blog.slug || blog._id}`}
                    className="block h-full"
                  >
                    {blog.imageUrl && (
                      <div className="relative h-56 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title || blog.sectionName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-orange-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Featured
                        </div>
                      </div>
                    )}

                    <div className="p-6 flex flex-col h-[calc(100%-14rem)]">
                      {blog.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="w-4 h-4 text-orange-500" />
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

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2 min-h-[56px]">
                        {blog.title || blog.sectionName}
                      </h3>

                      <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-4">
                        {blog.metaDescription ||
                          "Discover expert insights and tips to ace your certification exams."}
                      </p>

                      <div className="flex items-center gap-2 text-orange-500 font-semibold text-sm group-hover:gap-3 transition-all duration-300 pt-3 border-t border-gray-100">
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
              ))
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
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#1f424b] to-[#2f5058] hover:from-[#2f5058] hover:to-[#1f424b] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>Explore All Blogs</span>
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
