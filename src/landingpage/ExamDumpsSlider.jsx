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

  // Fetch products
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

  // Change visible cards count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1); // Mobile
      } else {
        setVisibleCards(3); // Desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide every 4s
  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [products, startIndex, visibleCards]);

  // Navigation
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

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!products.length) return <p className="text-center">No products found.</p>;

  return (
    <div className="w-full py-12 flex flex-col items-center">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Most Popular IT Certification{" "}
        <span className="text-orange-500">Dumps</span>
      </h2>

      {/* Buttons */}
      <div className="flex justify-between gap-4 mb-6">
        <button
          onClick={prevSlide}
          className="bg-white shadow-md rounded-full p-2 hover:bg-gray-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white shadow-md rounded-full p-2 hover:bg-gray-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Cards with Animation */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={startIndex} // re-renders on change
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`grid gap-6 grid-cols-1 md:grid-cols-${visibleCards}`}
          >
            {products
              .slice(startIndex, startIndex + visibleCards)
              .map((product) => {
                const slug = encodeURIComponent(product.slug || product.title); // safe slug
                return (
                  <Link
                    key={product._id}
                    href={`/ItDumps/sap/by-slug/${slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
                  >
                    <img
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {product.sapExamCode || product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {product.Description?.replace(/<[^>]+>/g, "") ||
                          "No description available."}
                      </p>
                      <div className="mt-4">
                        <p className="text-orange-500 font-bold">
                          ₹{product.dumpsPriceInr?.trim() || "N/A"}
                        </p>
                        {product.dumpsMrpInr && (
                          <p className="line-through text-sm text-gray-400">
                            ₹{product.dumpsMrpInr}
                          </p>
                        )}
                      </div>
                      <span className="mt-4 bg-orange-500 text-white text-center font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition">
                        View More
                      </span>
                    </div>
                  </Link>
                );
              })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
