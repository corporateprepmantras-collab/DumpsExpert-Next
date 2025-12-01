"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ExamDumpsSlider({ products = [] }) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);

  // ✅ Responsive visible cards - 4 on desktop, 2 on tablet, 1 on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(4);
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

  // ✅ Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragDelta(e.clientX - dragStart);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (Math.abs(dragDelta) > 50) {
      if (dragDelta > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    setDragDelta(0);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setDragDelta(e.touches[0].clientX - dragStart);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragDelta) > 50) {
      if (dragDelta > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    setDragDelta(0);
  };

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
      <div className="max-w-[1400px] mx-auto">
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

        {/* Product Cards - Draggable Slider */}
        <div
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: dragDelta, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ 
                duration: isDragging ? 0 : 0.5, 
                ease: "easeOut" 
              }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                  >
                    <a href={`/ItDumps/sap/by-slug/${slug}`} className="block flex flex-col h-full">
                      {/* Image Container - Fixed Height & Width */}
                      <div className="relative w-full h-56 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden flex-shrink-0">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Popular
                        </div>
                      </div>

                      {/* Content - Flexible Height */}
                      <div className="p-5 flex flex-col flex-grow pointer-events-none">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
                          {product.sapExamCode || product.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px] flex-grow">
                          {product.Description?.replace(/<[^>]+>/g, "") ||
                            "Comprehensive exam preparation material with real practice questions."}
                        </p>

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 fill-orange-400 text-orange-400"
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            (4.8)
                          </span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 mb-3"></div>

                        {/* Pricing */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xl font-bold text-orange-500">
                              ₹{product.dumpsPriceInr?.trim() || "N/A"}
                            </span>
                            <span className="text-base font-semibold text-orange-500">
                              ${product.dumpsPriceUsd?.trim() || "N/A"}
                            </span>
                          </div>
                          {product.dumpsMrpInr && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="line-through text-xs text-gray-400">
                                ₹{product.dumpsMrpInr}
                              </span>
                              <span className="line-through text-xs text-gray-400">
                                ${product.dumpsMrpUsd}
                              </span>
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
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

                        {/* Button - Stays at Bottom */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm mt-auto pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
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