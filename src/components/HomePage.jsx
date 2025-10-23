"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import axios from "axios"; // ✅ add this

import banner from "@/assets/landingassets/banner.webp";
import ExamDumpsSlider from "@/landingpage/ExamDumpsSlider";
import UnlockGoals from "@/landingpage/UnlockGoals";
import GeneralFAQs from "@/landingpage/GeneralFAQs";
import ContentDumpsFirst from "@/landingpage/ContentBoxFirst";
import ContentDumpsSecond from "@/landingpage/ContentBoxSecond";
import Testimonial from "@/landingpage/Testimonial";

export default function HomePage() {
  const [seo, setSeo] = useState({});
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dumps, setDumps] = useState([]); // ✅ Added missing state

  // ✅ Fetch trending dumps
  const getDumps = async () => {
    try {
      const res = await axios.get("/api/trending");
      setDumps(res.data);
    } catch (error) {
      console.error("Error fetching dumps:", error);
    }
  };

  useEffect(() => {
    getDumps();
  }, []);

  useEffect(() => {
    getDumps();
  }, []);

  /* ---------- Cache Helpers ---------- */
  function getCacheItem(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function setCacheItem(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  /* ---------- Smart Fetch With Cache ---------- */
  async function fetchWithSmartCache(key, url, setState, normalize = (d) => d) {
    const cached = getCacheItem(key);
    if (cached) setState(normalize(cached));

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      const normalized = normalize(data);

      if (JSON.stringify(normalize(cached)) !== JSON.stringify(normalized)) {
        setCacheItem(key, normalized);
        setState(normalized);
      }

      return normalized;
    } catch (err) {
      console.error(`❌ Fetch failed for ${key}:`, err);
      return cached || null;
    }
  }

  /* ---------- Fetch All Data ---------- */
  useEffect(() => {
    async function loadAll() {
      try {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_BASE_URL || "";

        await Promise.all([
          // ✅ SEO
          fetchWithSmartCache(
            "seo_home",
            `${baseUrl}/api/seo/home`,
            setSeo,
            (d) => d.data || d
          ),

          // ✅ Blog Categories
          fetchWithSmartCache(
            "blog_categories",
            `${baseUrl}/api/blogs/blog-categories`,
            setCategories,
            (d) =>
              Array.isArray(d)
                ? d
                : Array.isArray(d?.data)
                ? d.data
                : Array.isArray(d?.categories)
                ? d.categories
                : []
          ),

          // ✅ Blogs (handles all API formats)
          fetchWithSmartCache(
            "blogs_data",
            `${baseUrl}/api/blogs`,
            setBlogs,
            (d) =>
              Array.isArray(d)
                ? d
                : Array.isArray(d?.blogs)
                ? d.blogs
                : Array.isArray(d?.data)
                ? d.data
                : []
          ),
        ]);

        // ✅ Announcement
        try {
          const res = await fetch(`${baseUrl}/api/announcement`, {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            setAnnouncement(data);

            if (data?.active) {
              const lastShown = localStorage.getItem("announcementShownAt");
              const now = Date.now();
              const oneHour = 60 * 60 * 1000;

              if (!lastShown || now - parseInt(lastShown, 10) > oneHour) {
                setTimeout(() => {
                  setShowModal(true);
                  localStorage.setItem("announcementShownAt", now.toString());
                }, parseFloat(data.delay || "1.00") * 1000);
              }
            }
          }
        } catch (err) {
          console.error("❌ Announcement fetch failed:", err);
        }
      } catch (err) {
        console.error("❌ Main data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  /* ---------- Loading Screen ---------- */
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mb-4"></div>
        <p className="text-sm font-medium">Loading content, please wait...</p>
      </div>
    );
  }

  /* ---------- Render Page ---------- */
  return (
    <>
      <Head>
        <title>{seo.title || "Prepmantras – #1 IT Exam Prep Provider"}</title>
        <meta
          name="description"
          content={
            seo.description ||
            "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras."
          }
        />
      </Head>

      {/* ---------- Announcement Modal ---------- */}
      {showModal && announcement?.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            {announcement?.imageUrl && (
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                className="w-full h-auto rounded mb-4"
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

      {/* ---------- Hero Section ---------- */}
      <div className="p-2">
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
              {[
                "100% Verified & Up-to-Date Prepmantras",
                "100% Money Back Guarantee",
                "24/7 Expert Support",
                "Free Updates for 3 Months",
                "Realistic Practice Test Interface",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="bg-[#7aa93c] rounded-full p-1.5 flex items-center justify-center w-7 h-7">
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
            />
          </div>
        </section>

        {/* ---------- Popular Dumps ---------- */}
        {/* ---------- Trending Dumps ---------- */}
        <section className="py-16 px-4 md:px-12 bg-white">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Top Trending Certification Dumps
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {dumps.length > 0 ? (
              dumps.map((dump) => (
                <Button
                  key={dump._id}
                  variant="secondary"
                  className="text-xs sm:text-sm md:text-base bg-[#113d48] text-white hover:bg-[#1a2e33] px-4 py-2"
                >
                  {dump.title}
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Loading dumps...</p>
            )}
          </div>
        </section>

        {/* ---------- Blog Section ---------- */}
        <section className="py-20 px-4 md:px-20 bg-white">
          <h2 className="text-4xl font-bold mb-14 text-center text-gray-800">
            Latest Exam Tips & Insights
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories?.map((cat) => (
              <Button
                key={cat._id || cat.category}
                variant="outline"
                asChild
                className="capitalize rounded-full"
              >
                <Link href={`/blogsPages/${cat.category}`}>{cat.category}</Link>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {!blogs || blogs.length === 0 ? (
              <p className="text-center text-gray-500 col-span-full">
                No blogs found.
              </p>
            ) : (
              blogs
                .slice()
                .reverse()
                .slice(0, 6)
                .map((blog) => (
                  <motion.div
                    key={blog._id}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0px 0px 30px rgba(255, 145, 0, 0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 180, damping: 12 }}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all"
                  >
                    <Link href={`/blogsPages/blog/${blog.slug || blog._id}`}>
                      {blog.imageUrl && (
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title || blog.sectionName}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      )}

                      <div className="p-5 flex flex-col justify-between h-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">
                          {blog.title || blog.sectionName}
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString()
                            : ""}
                        </p>

                        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
                          {blog.metaDescription || "No description available."}
                        </p>

                        <p className="text-orange-500 mt-4 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                          Read More →
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))
            )}
          </div>

          <div className="mt-10 text-center">
            <Button
              asChild
              className="bg-[#1f424b] hover:bg-[#2f5058] text-white"
            >
              <Link href="blogsPages/blog-categories">See All Blogs</Link>
            </Button>
          </div>
        </section>

        <ExamDumpsSlider />
        <ContentDumpsFirst />
        <UnlockGoals />
        <ContentDumpsSecond />
        <Testimonial />
        <GeneralFAQs />
      </div>
    </>
  );
}
