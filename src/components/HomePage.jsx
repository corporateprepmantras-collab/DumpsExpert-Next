"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Wifi, WifiOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import banner from "@/assets/landingassets/banner.webp";

// ✅ Lazy load components ONLY after data loads
const BlogSection = dynamic(() => import("@/landingpage/BlogSection"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />,
  ssr: false,
});
//update homepage check

const ExamDumpsSlider = dynamic(() => import("@/landingpage/ExamDumpsSlider"), {
  loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />,
  ssr: false,
});

const UnlockGoals = dynamic(() => import("@/landingpage/UnlockGoals"), {
  ssr: false,
});

const GeneralFAQs = dynamic(() => import("@/landingpage/GeneralFAQs"), {
  ssr: false,
});

const ContentDumpsFirst = dynamic(
  () => import("@/landingpage/ContentBoxFirst"),
  { ssr: false }
);

const ContentDumpsSecond = dynamic(
  () => import("@/landingpage/ContentBoxSecond"),
  { ssr: false }
);

const Testimonial = dynamic(() => import("@/landingpage/Testimonial"), {
  ssr: false,
});

const BENEFITS = [
  "100% Verified & Up-to-Date Prepmantras",
  "100% Money Back Guarantee",
  "24/7 Expert Support",
  "Free Updates for 3 Months",
  "Realistic Practice Test Interface",
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [dataSource, setDataSource] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // ✅ Check if all data is loaded
  useEffect(() => {
    // Wait for all critical data
    const hasAllData =
      Object.keys(seo).length > 0 &&
      dumps.length > 0 &&
      categories.length > 0 &&
      blogs.length > 0 &&
      faqs.length > 0;

    if (hasAllData) {
      console.log("✅ ALL DATA LOADED - Showing page");
      setIsLoading(false);
    } else {
      console.log("⏳ Waiting for data...", {
        seo: Object.keys(seo).length,
        dumps: dumps.length,
        categories: categories.length,
        blogs: blogs.length,
        faqs: faqs.length,
      });
      // Don't set loading to true if already showing something
      if (isLoading) {
        setIsLoading(true);
      }
    }
  }, [seo, dumps, categories, blogs, faqs, isLoading]);

  // ✅ Detect data source
  useEffect(() => {
    const checkDataSource = () => {
      const hasCachedSEO = localStorage.getItem("pm_seo");
      const hasCachedDumps = localStorage.getItem("pm_dumps");

      if (hasCachedSEO || hasCachedDumps) {
        try {
          const seoCache = JSON.parse(localStorage.getItem("pm_seo") || "{}");
          const now = Date.now();
          const cacheAge = now - (seoCache.timestamp || 0);

          if (cacheAge < 5 * 60 * 1000) {
            setDataSource("cache");
            console.log("📦 Data from CACHE");
          } else {
            setDataSource("api");
            console.log("🌐 Data from API (cache expired)");
          }
        } catch {
          setDataSource("api");
          console.log("🌐 Data from API (cache error)");
        }
      } else {
        setDataSource("api");
        console.log("🌐 Data from API (no cache)");
      }
    };

    checkDataSource();
  }, []);

  // ✅ Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ✅ Show announcement on mount
  useEffect(() => {
    if (announcement?.active) {
      const lastShown = localStorage.getItem("announcementShownAt");
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (!lastShown || now - parseInt(lastShown, 10) > oneHour) {
        setTimeout(() => {
          setShowModal(true);
          localStorage.setItem("announcementShownAt", now.toString());
        }, parseFloat(announcement.delay || "1.00") * 1000);
      }
    }
  }, [announcement]);

  const closeModal = () => setShowModal(false);

  const clearAllCache = () => {
    if (confirm("Clear cache and reload?")) {
      localStorage.removeItem("pm_seo");
      localStorage.removeItem("pm_dumps");
      localStorage.removeItem("pm_categories");
      localStorage.removeItem("pm_blogs");
      localStorage.removeItem("pm_faqs");
      localStorage.removeItem("pm_content1");
      localStorage.removeItem("pm_content2");
      localStorage.removeItem("pm_products");
      localStorage.removeItem("pm_announcement");
      console.log("🧹 Cache cleared!");
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        clearAllCache();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "B") {
        e.preventDefault();
        setShowDebug(!showDebug);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showDebug]);

  // ✅ SHOW LOADING SCREEN UNTIL ALL DATA LOADS
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600 mb-4">
            Preparing your certification prep materials
          </p>

          {/* Show what's loading */}
          <div className="text-sm text-gray-500 max-w-md mx-auto">
            <div className="mb-2">
              {Object.keys(seo).length > 0 ? "✓" : "⏳"} SEO Data
            </div>
            <div className="mb-2">
              {dumps.length > 0 ? "✓" : "⏳"} Certification Dumps
            </div>
            <div className="mb-2">
              {categories.length > 0 ? "✓" : "⏳"} Blog Categories
            </div>
            <div className="mb-2">
              {blogs.length > 0 ? "✓" : "⏳"} Blog Posts
            </div>
            <div className="mb-2">{faqs.length > 0 ? "✓" : "⏳"} FAQs</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ---------- Debug Panel (Ctrl+Shift+B) ---------- */}
      {showDebug && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-md text-xs font-mono">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
            <h3 className="font-bold text-sm">Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">SEO Data:</span>
              <span
                className={
                  seo && Object.keys(seo).length > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {seo && Object.keys(seo).length > 0
                  ? `✓ ${Object.keys(seo).length} keys`
                  : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Dumps:</span>
              <span
                className={
                  dumps?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {dumps?.length > 0 ? `✓ ${dumps.length} items` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Categories:</span>
              <span
                className={
                  categories?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {categories?.length > 0
                  ? `✓ ${categories.length} items`
                  : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Blogs:</span>
              <span
                className={
                  blogs?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {blogs?.length > 0 ? `✓ ${blogs.length} items` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">FAQs:</span>
              <span
                className={faqs?.length > 0 ? "text-green-400" : "text-red-400"}
              >
                {faqs?.length > 0 ? `✓ ${faqs.length} items` : "✗ Empty"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Products:</span>
              <span
                className={
                  products?.length > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {products?.length > 0
                  ? `✓ ${products.length} items`
                  : "✗ Empty"}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Cache Status:</span>
                <span className="text-blue-400">{dataSource || "Unknown"}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400 text-[10px]">
            Press Ctrl+Shift+B to close
          </div>
        </div>
      )}

      {/* ---------- Data Source Indicator ---------- */}
      {dataSource && (
        <div className="fixed top-4 left-4 z-40 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 text-xs">
          {dataSource === "cache" ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Cached</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Fresh</span>
            </>
          )}
        </div>
      )}

      {/* ---------- Developer Controls ---------- */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors flex items-center gap-2"
            title="Show debug info (Ctrl+Shift+B)"
          >
            <AlertCircle size={16} />
            Debug
          </button>

          <button
            onClick={clearAllCache}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors flex items-center gap-2"
            title="Clear cache (Ctrl+Shift+D)"
          >
            <X size={16} />
            Clear Cache
          </button>
        </div>
      )}

      {/* ---------- Offline Indicator ---------- */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff size={16} />
          <span className="text-sm font-medium">Offline - cached content</span>
        </div>
      )}

      {/* ---------- Announcement Modal ---------- */}
      {showModal && announcement?.active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            {announcement?.imageUrl && (
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                className="w-full h-auto rounded mb-4"
                loading="lazy"
              />
            )}
            {announcement?.message && (
              <p className="text-gray-700 text-center">
                {announcement.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-2">
        {/* ---------- Hero Section ---------- */}
        <section className="w-full bg-white pt-24 px-4 sm:px-6 lg:px-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
          <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Pass Your IT Certification Exam{" "}
              <span className="text-[#13677c]">On the First Try</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6">
              Prepmantras offers industry-validated study materials, real exam
              Prep, and browser-based practice tests to help you get certified
              faster — and smarter.
            </p>

            <ul className="space-y-3 text-gray-700 mb-6 text-sm sm:text-base">
              {BENEFITS.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="bg-[#7aa93c] rounded-full p-1.5 flex items-center justify-center w-7 h-7 flex-shrink-0">
                    <Check className="text-white w-4 h-4" />
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
              className="w-full max-w-[600px] h-auto object-contain"
              placeholder="blur"
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            />
          </div>
        </section>

        {/* ---------- Trending Dumps ---------- */}
        <section className="py-14 px-4 md:px-12 bg-white">
          <h2 className="text-3xl pb-4 font-bold text-center mb-10 text-gray-900">
            Top Trending Certification Dumps
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {dumps && dumps.length > 0 ? (
              dumps.map((dump) => (
                <Button
                  key={dump._id}
                  variant="secondary"
                  className="text-xs sm:text-sm md:text-base bg-[#113d48] text-white hover:bg-[#1a2e33] px-4 py-2 transition-colors"
                >
                  {dump.title}
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No dumps available</p>
            )}
          </div>
        </section>

        {/* ---------- Lazy Loaded Sections ---------- */}
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
    </>
  );
}
