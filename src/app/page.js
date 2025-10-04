"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

import banner from "@/assets/landingassets/banner.webp";

// Sections
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

  const dumps = [
    { _id: "d1", name: "AWS Certified Solutions Architect" },
    { _id: "d2", name: "Microsoft Azure Fundamentals" },
    { _id: "d3", name: "Google Cloud Digital Leader" },
    { _id: "d4", name: "Cisco CCNA 200-301" },
    { _id: "d5", name: "CompTIA Security+" },
    { _id: "d6", name: "PMP Project Management Professional" },
    { _id: "d7", name: "Salesforce Administrator (ADM-201)" },
  ];

  // ✅ Fetch announcement and trigger modal with delay from API
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`/api/announcement`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setAnnouncement(data);

        // inside useEffect after fetching announcement
        if (data?.active) {
          const delaySeconds = parseFloat(data.delay || "1.00") * 10;

          // Show modal after delay
          setTimeout(() => {
            setShowModal(true);

            // Auto-close modal after the same delay
          }, delaySeconds);
        }
      } catch (err) {
        console.error("Error fetching announcement:", err);
      }
    };
    fetchAnnouncement();
  }, []);

  // ✅ Fetch SEO
  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await fetch(`/api/seo/home`, { cache: "no-store" });
        const data = await res.json();
        setSeo(data);
      } catch (error) {
        console.error("SEO fetch error:", error);
      }
    };
    fetchSeo();
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/blogs/blog-categories`, {
          cache: "no-store",
        });
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`/api/blogs`, { cache: "no-store" });
        const data = await res.json();
        setBlogs(data?.data || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

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

      {/* ✅ Announcement Modal */}
      {showModal && announcement?.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            {/* Image */}
            {announcement?.imageUrl && (
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                className="w-full h-auto rounded mb-4"
              />
            )}

            {/* Message */}
            {announcement?.message && (
              <p className="text-gray-700 text-center">
                {announcement.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- Homepage ---- */}
      <div className="p-2">
        {/* Hero Section */}
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

        {/* Other Sections */}
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
