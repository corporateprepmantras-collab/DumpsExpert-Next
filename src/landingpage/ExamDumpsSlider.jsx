"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductSlider() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Responsive visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else setVisibleCards(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto slide
  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => nextSlide(), 4000);
    return () => clearInterval(interval);
  }, [products, startIndex, visibleCards]);

  // ✅ Navigation
  const nextSlide = () =>
    setStartIndex((prev) =>
      prev + visibleCards < products.length ? prev + visibleCards : 0
    );

  const prevSlide = () =>
    setStartIndex((prev) =>
      prev - visibleCards >= 0
        ? prev - visibleCards
        : Math.max(0, products.length - visibleCards)
    );

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!products.length)
    return <p className="text-center text-gray-500">No products found.</p>;

  return (
    <div className="w-full py-12 flex flex-col items-center bg-white text-gray-900">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Most Popular IT Certification{" "}
        <span className="text-orange-500">Dumps</span>
      </h2>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 mb-6">
        <button
          onClick={prevSlide}
          className="bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md transition"
        >
          <ChevronLeft className="w-6 h-6 text-orange-400" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md transition"
        >
          <ChevronRight className="w-6 h-6 text-orange-400" />
        </button>
      </div>

      {/* Product Cards */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={startIndex}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`grid gap-8 grid-cols-1 md:grid-cols-${visibleCards}`}
          >
            {products
              .slice(startIndex, startIndex + visibleCards)
              .map((product) => {
                const slug = encodeURIComponent(product.slug || product.title);
                return (
                  <motion.div
                    key={product._id}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 8px 24px rgba(255, 145, 0, 0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 180, damping: 12 }}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  >
                    <Link href={`/ItDumps/sap/by-slug/${slug}`}>
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.title}
                          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-500 transition-colors duration-300">
                          {product.sapExamCode || product.title}
                        </h3>

                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {product.Description?.replace(/<[^>]+>/g, "") ||
                            "No description available."}
                        </p>

                        <div className="mt-4">
                          <p className="text-orange-500 font-bold text-lg">
                            ₹{product.dumpsPriceInr?.trim() || "N/A"}/ $
                            {product.dumpsPriceUsd?.trim() || "N/A"}
                          </p>

                          {product.dumpsMrpInr && (
                            <div className="flex gap-1 items-center">
                            <p className="line-through text-sm text-gray-400">
                              ₹{product.dumpsMrpInr}/
                            </p>
                             <p className="line-through text-sm text-gray-400">
                              ${product.dumpsMrpUsd}
                            </p>
                            </div>
                          )}
                        </div>
                    

                        <span className="mt-5 bg-orange-500 text-white text-center font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300">
                          View More
                        </span>
                      </div>

                      {/* Animated bottom line */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-[3px] bg-orange-500"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </Link>
                  </motion.div>
                );
              })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
