"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ExamDumpsSlider({ products = [] }) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);

  // Responsive visible cards
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

  // Intersection Observer for scroll reveal
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(
              (prev) => new Set([...prev, entry.target.dataset.index]),
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Auto slide
  useEffect(() => {
    if (!products.length || products.length <= visibleCards) return;

    const interval = setInterval(() => {
      setStartIndex((prev) =>
        prev + visibleCards < products.length ? prev + visibleCards : 0,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length, visibleCards]);

  // Navigation callbacks
  const nextSlide = useCallback(() => {
    setStartIndex((prev) =>
      prev + visibleCards < products.length ? prev + visibleCards : 0,
    );
  }, [products.length, visibleCards]);

  const prevSlide = useCallback(() => {
    setStartIndex((prev) =>
      prev - visibleCards >= 0
        ? prev - visibleCards
        : Math.max(0, products.length - visibleCards),
    );
  }, [products.length, visibleCards]);

  // Drag handlers
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

  // Memoize visible products
  const visibleProducts = useMemo(() => {
    return products.slice(startIndex, startIndex + visibleCards);
  }, [products, startIndex, visibleCards]);

  // Memoize pagination
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
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Most Popular IT Certification{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Dumps
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Get certified with our premium exam preparation materials
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={prevSlide}
            className="bg-white border-2 border-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-50 transition-all hover:scale-105 active:scale-95"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6 text-orange-500" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-orange-500 border-2 border-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
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
          <div
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${dragDelta}px)` }}
          >
            {visibleProducts.map((product, index) => {
              const slug = encodeURIComponent(product.slug || product.title);
              return (
                <div
                  key={product._id}
                  data-index={index}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full opacity-0 translate-y-8"
                  style={{
                    opacity: visibleItems.has(String(index)) ? 1 : 0,
                    transform: visibleItems.has(String(index))
                      ? "translateY(0)"
                      : "translateY(2rem)",
                    transition:
                      "opacity 0.5s ease-out, transform 0.5s ease-out",
                  }}
                >
                  <a
                    href={`/ItDumps/sap/${slug}`}
                    className="block flex flex-col h-full"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden flex-shrink-0">
                      <img
                        src={product.imageUrl || "/placeholder.png"}
                        alt={product.title}
                        className="w-full h-full object-contain object-center p-4 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                        Popular
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow pointer-events-none">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
                        {product.sapExamCode || product.title}
                      </h3>

                      <p className="text-gray-600 text-xs mb-3 line-clamp-2 min-h-[36px] flex-grow leading-relaxed">
                        {product.Description?.replace(/<[^>]+>/g, "") ||
                          "Comprehensive exam preparation material with real practice questions."}
                      </p>

                      <div className="flex items-center gap-1 mb-2">
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
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg font-bold text-orange-500">
                            ₹{product.dumpsPriceInr?.trim() || "N/A"}
                          </span>
                          <span className="text-sm font-semibold text-orange-500">
                            ${product.dumpsPriceUsd?.trim() || "N/A"}
                          </span>
                        </div>
                        {product.dumpsMrpInr && (
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="line-through text-gray-400">
                              ₹{product.dumpsMrpInr}
                            </span>
                            <span className="line-through text-gray-400">
                              ${product.dumpsMrpUsd}
                            </span>
                            <span className="font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                              Save{" "}
                              {Math.round(
                                ((product.dumpsMrpInr - product.dumpsPriceInr) /
                                  product.dumpsMrpInr) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Button */}
                      <button
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 px-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs mt-auto pointer-events-auto hover:scale-[1.02] active:scale-[0.98]"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        View Details →
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300" />
                  </a>
                </div>
              );
            })}
          </div>
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
