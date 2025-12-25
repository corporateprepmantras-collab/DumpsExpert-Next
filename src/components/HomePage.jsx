"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, ArrowUp } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import banner from "@/assets/landingassets/banner.webp";

// ✅ Lazy load heavy components
const BlogSection = dynamic(() => import("@/landingpage/BlogSection"), {
  ssr: false,
});
const ExamDumpsSlider = dynamic(() => import("@/landingpage/ExamDumpsSlider"), {
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

  // ✅ Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
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
              "Failed to clear cache. Please clear manually via browser settings."
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
          "Failed to clear cache. Please clear manually via browser settings."
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
  if (!mounted) {
    return null;
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

        {/* ========== Trending Certification Dumps ========== */}
        <section className="py-16 px-4 md:px-12 bg-white">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
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
              <p className="text-gray-500 text-sm">
                No certification dumps available
              </p>
            )}
          </div>
        </section>

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
