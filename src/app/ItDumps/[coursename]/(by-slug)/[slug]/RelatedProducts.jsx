"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaChevronLeft, FaShoppingCart } from "react-icons/fa";

async function fetchAllProducts(limit = 12) {
  try {
    const response = await fetch(`/api/products?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function RelatedProducts({ currentSlug, maxProducts = 10 }) {
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const allProducts = await fetchAllProducts(maxProducts + 2); // Fetch a few extra
      const filtered = allProducts
        .filter((p) => p.slug !== currentSlug)
        .slice(0, maxProducts);
      setRelatedProducts(filtered);
      setIsLoading(false);
    }

    if (currentSlug) {
      loadProducts();
    }
  }, [currentSlug, maxProducts]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [relatedProducts]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Related Products
          </h2>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full transition-all ${
                canScrollLeft
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full transition-all ${
                canScrollRight
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {relatedProducts.slice(0, maxProducts).map((product) => (
              <div
                key={product._id}
                className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18%] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/product/${product.slug}`)}
              >
                <div className="p-3 md:p-4 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-2 md:p-3 mb-2 md:mb-3 group-hover:scale-105 transition-transform">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-24 sm:h-28 md:h-32 w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {/* Product Title */}
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[32px] sm:min-h-[40px] group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  {/* Price Section */}
                  <div className="flex items-baseline gap-1 md:gap-2 mb-2 flex-wrap">
                    <p className="text-sm sm:text-base font-bold text-blue-600">
                      ₹{product.dumpsPriceInr}
                    </p>
                    {product.dumpsMrpInr > product.dumpsPriceInr && (
                      <p className="text-xs text-gray-500 line-through">
                        ₹{product.dumpsMrpInr}
                      </p>
                    )}
                  </div>
                  {/* Discount Badge */}
                  {product.dumpsMrpInr > product.dumpsPriceInr && (
                    <div className="inline-block bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mb-2">
                      {Math.round(
                        ((product.dumpsMrpInr - product.dumpsPriceInr) /
                          product.dumpsMrpInr) *
                          100,
                      )}
                      % OFF
                    </div>
                  )}

                  {/* Mobile: Show arrow */}
                  <div className="md:hidden flex items-center justify-end mt-auto pt-2">
                    <FaChevronRight className="text-blue-600 text-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show more link */}
        {relatedProducts.length > maxProducts && (
          <div className="text-center mt-6 md:mt-8">
            <button
              onClick={() => router.push("/ItDumps")}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base transition-colors"
            >
              View All Products
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
