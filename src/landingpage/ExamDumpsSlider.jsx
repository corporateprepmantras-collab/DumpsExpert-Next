"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ExamDumpsSlider({ products = [] }) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // ✅ Responsive visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto slide
  useEffect(() => {
    if (!products.length || products.length <= visibleCards) return;

    const interval = setInterval(() => {
      setStartIndex((prev) =>
        prev + visibleCards < products.length ? prev + visibleCards : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length, visibleCards]);

  // ✅ Navigation callbacks
  const nextSlide = useCallback(() => {
    setStartIndex((prev) =>
      prev + visibleCards < products.length ? prev + visibleCards : 0
    );
  }, [products.length, visibleCards]);

  const prevSlide = useCallback(() => {
    setStartIndex((prev) =>
      prev - visibleCards >= 0
        ? prev - visibleCards
        : Math.max(0, products.length - visibleCards)
    );
  }, [products.length, visibleCards]);

  // ✅ Memoize visible products
  const visibleProducts = useMemo(() => {
    return products.slice(startIndex, startIndex + visibleCards);
  }, [products, startIndex, visibleCards]);

  // ✅ Memoize pagination
  const totalPages = useMemo(() => {
    return Math.ceil(products.length / visibleCards);
  }, [products.length, visibleCards]);

  const currentPage = useMemo(() => {
    return Math.floor(startIndex / visibleCards);
  }, [startIndex, visibleCards]);

  if (!products.length) {
    return (
      <div className="w-full py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <p className="text-center text-gray-500 py-10">No products found.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-3"
          >
            Most Popular IT Certification{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Dumps
            </span>
          </motion.h2>
          <p className="text-gray-600 text-lg">
            Get certified with our premium exam preparation materials
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            className="bg-white border-2 border-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-50 transition-all"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6 text-orange-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            className="bg-orange-500 border-2 border-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-600 transition-all"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Product Cards */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleProducts.map((product, index) => {
                const slug = encodeURIComponent(product.slug || product.title);
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <a href={`/ItDumps/sap/by-slug/${slug}`} className="block">
                      <div className="relative h-64 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Popular
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">
                          {product.sapExamCode || product.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                          {product.Description?.replace(/<[^>]+>/g, "") ||
                            "Comprehensive exam preparation material with real practice questions."}
                        </p>

                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-orange-400 text-orange-400"
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            (4.8)
                          </span>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mb-4"></div>

                        <div className="flex items-baseline gap-3 mb-5">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-orange-500">
                                ₹{product.dumpsPriceInr?.trim() || "N/A"}
                              </span>
                              <span className="text-lg font-semibold text-orange-500">
                                ${product.dumpsPriceUsd?.trim() || "N/A"}
                              </span>
                            </div>
                            {product.dumpsMrpInr && (
                              <div className="flex items-center gap-2">
                                <span className="line-through text-sm text-gray-400">
                                  ₹{product.dumpsMrpInr}
                                </span>
                                <span className="line-through text-sm text-gray-400">
                                  ${product.dumpsMrpUsd}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Save{" "}
                                  {Math.round(
                                    ((product.dumpsMrpInr -
                                      product.dumpsPriceInr) /
                                      product.dumpsMrpInr) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          View Details →
                        </motion.button>
                      </div>

                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </a>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStartIndex(idx * visibleCards)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentPage === idx
                  ? "w-8 bg-orange-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
