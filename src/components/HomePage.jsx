"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, ArrowUp } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import banner from "@/assets/landingassets/banner.webp";

// ✅ Lazy load heavy components with priority and no SSR for faster initial load
const LoadingBox = () => (
  <div className="py-8 px-4">
    <div className="h-48 bg-gray-100 rounded-lg animate-pulse max-w-7xl mx-auto"></div>
  </div>
);

// Critical: Load first
const ExamDumpsSlider = dynamic(() => import("@/landingpage/ExamDumpsSlider"), {
  ssr: true, // Keep this one for initial content
  loading: () => <LoadingBox />,
});

// Load after viewport
const BlogSection = dynamic(() => import("@/landingpage/BlogSection"), {
  ssr: false,
  loading: () => <LoadingBox />,
});
const UnlockGoals = dynamic(() => import("@/landingpage/UnlockGoals"), {
  ssr: false,
  loading: () => <LoadingBox />,
});
const GeneralFAQs = dynamic(() => import("@/landingpage/GeneralFAQs"), {
  ssr: false,
  loading: () => <LoadingBox />,
});
const ContentDumpsFirst = dynamic(
  () => import("@/landingpage/ContentBoxFirst"),
  { ssr: false, loading: () => <LoadingBox /> },
);
const ContentDumpsSecond = dynamic(
  () => import("@/landingpage/ContentBoxSecond"),
  { ssr: false, loading: () => <LoadingBox /> },
);
const Testimonial = dynamic(() => import("@/landingpage/Testimonial"), {
  ssr: false,
  loading: () => <LoadingBox />,
});

const BENEFITS = [
  "100% Verified & Up-to-Date Prepmantras",
  "100% Money Back Guarantee",
  "24/7 Expert Support",
  "Free Updates for 3 Months",
  "Realistic Practice Test Interface",
];

// ✅ Safe storage wrapper with fallback
const safeStorage = {
  get: (key) => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem failed:", e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn("localStorage.setItem failed:", e);
      return false;
    }
  },
  clear: () => {
    try {
      if (typeof window === "undefined") return false;
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (e) {
      console.warn("Storage clear failed:", e);
      return false;
    }
  },
};

export default function HomePage({
  seo = {},
  dumps = [],
  categories = [],
  blogs = [],
  faqs = [],
  content1 = "",
  content2 = "",
  products = [],
  announcement = null,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ✅ Fetch trending items
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending");
        const data = await res.json();
        console.log("📊 Trending items fetched:", data);
        setTrendingItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch trending items:", error);
      }
    };

    const fetchTrendingCategories = async () => {
      try {
        const res = await fetch("/api/trending-categories");
        const data = await res.json();
        console.log("📊 Trending categories fetched:", data);
        setTrendingCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch trending categories:", error);
      }
    };

    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch("/api/trending-products");
        const data = await res.json();
        console.log("📊 Trending products fetched:", data);
        setTrendingProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      }
    };

    if (mounted) {
      fetchTrending();
      fetchTrendingCategories();
      fetchTrendingProducts();
    }
  }, [mounted]);

  // ✅ Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
    // Immediate render - no delay
    setIsInitialLoad(false);
  }, []);

  // ✅ Show/hide scroll to top button
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // ✅ Show announcement modal with safe storage
  useEffect(() => {
    if (!mounted || !announcement?.active) return;

    const lastShown = safeStorage.get("announcementShownAt");
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Only show if not shown in the last hour
    const shouldShow = !lastShown || now - parseInt(lastShown, 10) > oneHour;

    if (shouldShow) {
      const delay = parseFloat(announcement.delay || "1.00") * 1000;
      const timer = setTimeout(() => {
        setShowModal(true);
        safeStorage.set("announcementShownAt", now.toString());
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [announcement, mounted]);

  // ✅ Keyboard shortcuts with safe handlers
  useEffect(() => {
    if (!mounted) return;

    const handleKeyPress = (e) => {
      // Ctrl+Shift+B - Toggle debug
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "B") {
        e.preventDefault();
        setShowDebugInfo((prev) => !prev);
      }

      // Ctrl+Shift+D - Clear cache
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        if (confirm("Clear all cached data and reload?")) {
          const cleared = safeStorage.clear();
          if (cleared) {
            window.location.reload();
          } else {
            alert(
              "Failed to clear cache. Please clear manually via browser settings.",
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [mounted]);

  const closeModal = useCallback(() => setShowModal(false), []);

  const handleClearCache = useCallback(() => {
    if (confirm("Clear all cache and reload?")) {
      const cleared = safeStorage.clear();
      if (cleared) {
        window.location.reload();
      } else {
        alert(
          "Failed to clear cache. Please clear manually via browser settings.",
        );
      }
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // ✅ Check for data issues
  const hasDataIssues =
    dumps.length === 0 || blogs.length === 0 || faqs.length === 0;

  // Don't render until mounted (prevents hydration issues)
  if (!mounted || isInitialLoad) {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal Hero Section Skeleton - Faster LCP */}
        <section className="w-full bg-white pt-20 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
            <div className="w-full lg:w-1/2 space-y-3">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-5/6"></div>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <div className="w-full max-w-[500px] h-[300px] bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      {/* ========== Warning Banner ========== */}
      {hasDataIssues && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">
            Some content may be incomplete
          </span>
        </div>
      )}

      {/* ========== Debug Info Panel ========== */}
      {showDebugInfo && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-sm text-xs font-mono">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
            <h3 className="font-bold text-sm">Debug Info</h3>
            <button
              onClick={() => setShowDebugInfo(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close debug panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">SEO Data:</span>
              <span
                className={
                  Object.keys(seo).length > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {Object.keys(seo).length > 0
                  ? `✓ ${Object.keys(seo).length} keys`
                  : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Dumps:</span>
              <span
                className={
                  dumps?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {dumps?.length > 0 ? `✓ ${dumps.length}` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Blogs:</span>
              <span
                className={
                  blogs?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {blogs?.length > 0 ? `✓ ${blogs.length}` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">FAQs:</span>
              <span
                className={faqs?.length > 0 ? "text-green-400" : "text-red-400"}
              >
                {faqs?.length > 0 ? `✓ ${faqs.length}` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Products:</span>
              <span
                className={
                  products?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {products?.length > 0 ? `✓ ${products.length}` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Categories:</span>
              <span
                className={
                  categories?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {categories?.length > 0 ? `✓ ${categories.length}` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Mounted:</span>
              <span className="text-green-400">✓ Yes</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400 text-[10px]">
            <div>Press Ctrl+Shift+B to close</div>
            <div>Press Ctrl+Shift+D to clear cache</div>
          </div>
        </div>
      )}

      {/* ========== Floating Action Buttons (Dev Only) ========== */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
            title="Toggle Debug Info (Ctrl+Shift+B)"
          >
            <AlertCircle size={16} />
            Debug
          </button>

          <button
            onClick={handleClearCache}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
            title="Clear Cache (Ctrl+Shift+D)"
          >
            <X size={16} />
            Clear Cache
          </button>
        </div>
      )}

      {/* ========== Scroll to Top Button ========== */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Scroll to top"
          style={{
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* ========== Announcement Modal ========== */}
      {showModal && announcement?.active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Close announcement"
            >
              <X size={24} />
            </button>

            {announcement?.imageUrl && (
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                className="w-full h-auto rounded-lg mb-4"
                loading="lazy"
              />
            )}

            {announcement?.message && (
              <p className="text-gray-700 text-center text-lg">
                {announcement.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-2">
        {/* ========== Hero Section ========== */}
        <section className="w-full bg-white pt-20 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
            <div className="w-full lg:w-1/2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                Pass Your IT Certification Exam{" "}
                <span className="text-[#13677c]">On the First Try</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-4">
                Prepmantras offers industry-validated study materials, real exam
                Prep, and browser-based practice tests to help you get certified
                faster — and smarter.
              </p>

              <ul className="space-y-2 text-gray-700 mb-5 text-sm sm:text-base">
                {BENEFITS.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="bg-[#7aa93c] rounded-full p-1.5 flex items-center justify-center w-6 h-6 flex-shrink-0">
                      <Check className="text-white w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <Image
                src={banner}
                alt="Professional IT certification preparation"
                className="w-full max-w-[500px] h-auto object-contain"
                placeholder="blur"
                priority
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            </div>
          </div>
        </section>

        {/* ========== Trending Certifications ========== */}
        <section className="py-8 px-4 sm:py-12 sm:px-6 lg:px-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">
                  Trending Now
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Popular Certification Exam Prep
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Most popular certifications professionals are pursuing this
                month
              </p>
            </div>

            {/* Certifications Grid */}
            {trendingItems && trendingItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {trendingItems.map((item, index) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      if (item.link) {
                        window.location.href = `/${item.link}`;
                      }
                    }}
                    className="group relative bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-white border-2 border-gray-200 hover:border-orange-500 rounded-xl px-2 py-1 sm:px-5 sm:py-4 text-left transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                  >
                    {/* Badge Number */}
                    <div className="absolute -top-2 -left-2 bg-orange-500 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex items-start gap-3">
                      {/* Category Image */}
                      {item.categoryImage && (
                        <img
                          src={item.categoryImage}
                          alt={item.categoryName || item.title || "Category"}
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {item.categoryName || item.title || "Certification"}
                        </h3>
                        {item.text && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.text}
                          </p>
                        )}
                        <p className="text-sm text-orange-500 font-medium mt-1.5">
                          View Details →
                        </p>
                      </div>
                    </div>

                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300 rounded-b-xl" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  No trending certifications available
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Check back soon for trending certifications
                </p>
              </div>
            )}

            {/* View All Button */}
            {trendingItems && trendingItems.length > 0 && (
              <div className="text-center mt-8 sm:mt-12">
                <Link href="/itcertifications">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base">
                    View All Certifications
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ========== Trending Categories & Products ========== */}
        {trendingCategories && trendingCategories.length > 0 && (
          <section className="py-8 px-4 sm:py-12 sm:px-6 lg:px-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  Trending Categories & Products
                </h2>
                <p className="text-gray-600 text-base max-w-3xl mx-auto">
                  Explore the most popular categories and their top-rated
                  products
                </p>
              </div>

              {/* Categories Grid - Side by Side Layout */}
              <div className="space-y-10">
                {trendingCategories.map((category, catIndex) => {
                  const categoryProducts = trendingProducts.filter(
                    (p) => p.trendingCategoryId === category._id,
                  );

                  return (
                    <div
                      key={category._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Split Layout: Left 30% Category, Right 70% Products */}
                      <div className="flex flex-col lg:flex-row">
                        {/* Left: Category Section (30% width) */}
                        <div className="lg:w-[30%] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                          {/* Category Image - Large */}
                          {category.image && (
                            <div className="w-full max-w-md mx-auto mb-6 aspect-video bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center">
                              <img
                                src={category.image}
                                alt={category.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}

                          {/* Category Title */}
                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 text-center">
                            {category.title}
                          </h3>

                          {/* Category Description */}
                          {category.description && (
                            <p className="text-base sm:text-lg text-gray-600 mb-6 text-center max-w-2xl mx-auto">
                              {category.description}
                            </p>
                          )}

                          {/* View All Button */}
                          <div className="text-center">
                            <Link href={`/${category.redirectLink}`}>
                              <button className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors shadow-md hover:shadow-lg">
                                View All {category.title}
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Right: Products Section (70% width) */}
                        <div className="lg:w-[70%] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200">
                          {categoryProducts.length > 0 ? (
                            <div className="p-4 sm:p-6 h-full overflow-y-auto max-h-[600px]">
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                                Popular Products ({categoryProducts.length})
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                {categoryProducts
                                  .slice(0, 10)
                                  .map((product) => (
                                    <Link
                                      key={product._id}
                                      href={`/${product.redirectLink}`}
                                    >
                                      <div className="bg-white border border-gray-200 rounded-lg p-2 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group">
                                        {/* Small Product Image */}
                                        {product.image ? (
                                          <div className="w-full aspect-square bg-white border border-gray-100 rounded p-1.5 flex items-center justify-center mb-2">
                                            <img
                                              src={product.image}
                                              alt={product.title}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full aspect-square bg-gray-100 border border-gray-200 rounded flex items-center justify-center mb-2">
                                            <svg
                                              className="w-6 h-6 text-gray-400"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                              />
                                            </svg>
                                          </div>
                                        )}

                                        {/* Product Info */}
                                        <div>
                                          <h5 className="font-semibold text-xs text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2rem]">
                                            {product.title}
                                          </h5>
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 h-full flex items-center justify-center">
                              <div className="text-center">
                                <svg
                                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  No products yet
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========== Lazy Loaded Sections ========== */}
        {blogs.length > 0 && (
          <BlogSection blogs={blogs} categories={categories} />
        )}

        {products.length > 0 && <ExamDumpsSlider products={products} />}

        {content1 && <ContentDumpsFirst content={content1} />}

        <UnlockGoals />

        {content2 && <ContentDumpsSecond content={content2} />}

        <Testimonial />

        {faqs.length > 0 && <GeneralFAQs faqs={faqs} />}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
