"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaChevronRight,
  FaChevronLeft,
  FaShoppingCart,
  FaEye,
} from "react-icons/fa";
import { useCartStore } from "@/store/useCartStore";
import { toast, Toaster } from "react-hot-toast";

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

// Helper function to convert string values to numbers
const toNum = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// Helper function to check if product is available
const isProductAvailable = (product) => {
  if (!product) return false;
  return product.mainPdfUrl && product.mainPdfUrl.trim() !== "";
};

export default function RelatedProducts({ currentSlug, maxProducts = 10 }) {
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Add to cart function
  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent card click

    const productAvailable = isProductAvailable(product);

    if (!productAvailable) {
      toast.error("⚠️ This product is currently unavailable (PDF not found)");
      return;
    }

    // Check if item already exists in cart
    const cartStore = useCartStore.getState();
    const existingItem = cartStore.cartItems.find(
      (item) => item._id === product._id && item.type === "regular",
    );

    if (existingItem) {
      toast.info("ℹ️ This item is already in your cart");
      return;
    }

    let item = {
      _id: product._id,
      productId: product._id,
      courseId: product._id,
      type: "regular",
      title: `${product.title} [PDF]`,
      name: `${product.title} [PDF]`,
      mainPdfUrl: product.mainPdfUrl || "",
      samplePdfUrl: product.samplePdfUrl || "",
      dumpsPriceInr: toNum(product.dumpsPriceInr),
      dumpsPriceUsd: toNum(product.dumpsPriceUsd),
      dumpsMrpInr: toNum(product.dumpsMrpInr),
      dumpsMrpUsd: toNum(product.dumpsMrpUsd),
      comboPriceInr: toNum(product.comboPriceInr),
      comboPriceUsd: toNum(product.comboPriceUsd),
      comboMrpInr: toNum(product.comboMrpInr),
      comboMrpUsd: toNum(product.comboMrpUsd),
      examPriceInr: 0,
      examPriceUsd: 0,
      examMrpInr: 0,
      examMrpUsd: 0,
      imageUrl: product.imageUrl || "",
      slug: product.slug,
      category: product.category,
      sapExamCode: product.sapExamCode,
      code: product.code || product.sapExamCode,
      sku: product.sku,
      duration: product.duration || "",
      numberOfQuestions: product.numberOfQuestions || 0,
      passingScore: product.passingScore || "",
      mainInstructions: product.mainInstructions || "",
      sampleInstructions: product.sampleInstructions || "",
      Description: product.Description || "",
      longDescription: product.longDescription || "",
      status: product.status || "active",
      action: product.action || "",
      metaTitle: product.metaTitle || "",
      metaKeywords: product.metaKeywords || "",
      metaDescription: product.metaDescription || "",
      schema: product.schema || "",
      price: toNum(product.dumpsPriceInr),
      priceINR: toNum(product.dumpsPriceInr),
      priceUSD: toNum(product.dumpsPriceUsd),
    };

    useCartStore.getState().addToCart(item);
    toast.success(`✅ Added ${item.title} to cart!`);
  };

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const allProducts = await fetchAllProducts(maxProducts + 5); // Fetch more to account for filtering
      const filtered = allProducts
        .filter((p) => p.slug !== currentSlug) // Only exclude current product
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
            {relatedProducts.slice(0, maxProducts).map((product) => {
              return (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18%] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/ItDumps/${product.category || "sap"}/${product.slug}`,
                    )
                  }
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

                    {/* View Details Button */}
                    <div className="mt-auto pt-2">
                      <button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-medium rounded transition-colors">
                        <FaEye className="text-[8px] sm:text-[10px]" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

      <Toaster />

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
