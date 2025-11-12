"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, WifiOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import banner from "@/assets/landingassets/banner.webp";

// ✅ Lazy load components
const BlogSection = dynamic(() => import("@/landingpage/BlogSection"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />,
  ssr: false,
});

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
  const [showModal, setShowModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // 🔥 FIX: Normalize data immediately, not in useEffect
  // This ensures consistent rendering on server and client
  const normalizedDumps = Array.isArray(dumps)
    ? dumps.filter((d) => d && (d._id || d.id) && (d.title || d.name))
    : [];

  const normalizedBlogs = Array.isArray(blogs) ? blogs : [];
  const normalizedProducts = Array.isArray(products) ? products : [];
  const normalizedFaqs = Array.isArray(faqs) ? faqs : [];
  const normalizedCategories = Array.isArray(categories) ? categories : [];

  // ✅ Debug logging (only in browser)
  useEffect(() => {
    console.group("🏠 HomePage Data Check");
    console.log("Dumps received:", dumps);
    console.log("Dumps normalized:", normalizedDumps);
    console.log("Normalized length:", normalizedDumps.length);
    if (normalizedDumps.length > 0) {
      console.log("First dump:", normalizedDumps[0]);
    }
    console.groupEnd();
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

  return (
    <>
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

          {/* 🔥 FIXED: Consistent rendering without conditional mounting */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 min-h-[100px]">
            {normalizedDumps.length > 0 ? (
              normalizedDumps.map((dump, index) => {
                const displayText = dump.title || dump.name || "Unnamed Dump";
                const uniqueKey = dump._id || dump.id || `dump-${index}`;

                return (
                  <Button
                    key={uniqueKey}
                    variant="secondary"
                    className="text-xs sm:text-sm md:text-base bg-[#113d48] text-white hover:bg-[#1a2e33] px-4 py-2 transition-colors"
                  >
                    {displayText}
                  </Button>
                );
              })
            ) : (
              <div className="text-center py-8 w-full">
                <p className="text-gray-500">No dumps available</p>
                <p className="text-xs text-gray-400 mt-2">
                  Dumps data: {JSON.stringify(dumps)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ---------- Lazy Loaded Sections ---------- */}
        {normalizedBlogs.length > 0 && (
          <BlogSection
            blogs={normalizedBlogs}
            categories={normalizedCategories}
          />
        )}
        {normalizedProducts.length > 0 && (
          <ExamDumpsSlider products={normalizedProducts} />
        )}
        {content1 && <ContentDumpsFirst content={content1} />}
        <UnlockGoals />
        {content2 && <ContentDumpsSecond content={content2} />}
        <Testimonial />
        {normalizedFaqs.length > 0 && <GeneralFAQs faqs={normalizedFaqs} />}
      </div>
    </>
  );
}
