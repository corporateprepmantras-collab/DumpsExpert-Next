// app/page.jsx
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import banner from "@/assets/landingassets/banner.webp";

// Corrected folder name
import ExamDumpsSlider from "@/landingpage/ExamDumpsSlider";
import UnlockGoals from "@/landingpage/UnlockGoals";
import GeneralFAQs from "@/landingpage/GeneralFAQs";
import ContentDumpsFirst from "@/landingpage/ContentBoxFirst";
import ContentDumpsSecond from "@/landingpage/ContentBoxSecond";
import Testimonial from "@/landingpage/Testimonial";

export const metadata = {
  title: "Dumpsxpert – #1 IT Exam Dumps Provider",
  description:
    "Pass your IT certifications in first attempt with trusted exam dumps, practice tests & PDF guides by Dumpsxpert.",
};

// Server Component
export default async function HomePage() {
  // ✅ Use a proper production URL from env
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dumpsxpert-next.vercel.app";

  // fetch categories
  const categoriesRes = await fetch(`${baseUrl}/api/blogs/blog-categories`, {
    cache: "no-store",
  });
  const categories = await categoriesRes.json();

  // fetch blogs
  const blogsRes = await fetch(`${baseUrl}/api/blogs`, { cache: "no-store" });
  const blogsData = await blogsRes.json();
  const blogs = blogsData?.data || [];

  // static dumps
  const dumps = [
    { _id: "d1", name: "AWS Certified Solutions Architect" },
    { _id: "d2", name: "Microsoft Azure Fundamentals" },
    { _id: "d3", name: "Google Cloud Digital Leader" },
    { _id: "d4", name: "Cisco CCNA 200-301" },
    { _id: "d5", name: "CompTIA Security+" },
    { _id: "d6", name: "PMP Project Management Professional" },
    { _id: "d7", name: "Salesforce Administrator (ADM-201)" },
  ];

  return (
    <div className="p-6">
      {/* Hero Section */}
      <section className="w-full bg-white pt-24 px-4 sm:px-6 lg:px-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Pass Your IT Certification Exam{" "}
            <span className="text-[#13677c]">On the First Try</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6">
            Dumpsxpert offers industry-validated study materials, real exam
            dumps, and browser-based practice tests to help you get certified
            faster — and smarter.
          </p>
          <ul className="space-y-3 text-gray-700 mb-6 text-sm sm:text-base">
            {[
              "100% Verified & Up-to-Date Dumps",
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
          <p className="text-sm sm:text-base text-gray-500">
            ⭐ Trusted by over <strong>50,000 IT professionals</strong>{" "}
            worldwide. Rated <strong>4.8/5</strong> by verified users.
          </p>
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

      {/* Popular Dumps */}
      <section className="py-16 px-4 md:px-12">
        <h2 className="text-3xl font-bold text-center mb-10">
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
                {dump.name}
              </Button>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">
              No categories found.
            </p>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-4 md:px-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Latest Exam Tips & Insights
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories?.map((cat) => (
            <Button
              key={cat._id}
              variant="outline"
              asChild
              className="capitalize rounded-full"
            >
              <Link
                href={`/?category=${encodeURIComponent(
                  cat.category.toLowerCase()
                )}`}
              >
                {cat.category}
              </Link>
            </Button>
          ))}
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No blogs found.
            </p>
          ) : (
            blogs
              .slice()
              .reverse()
              .slice(0, 6)
              .map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogsPages/blog/${blog.slug || blog._id}`}
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title || blog.sectionName}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-1">
                        {blog.title || blog.sectionName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                      <p className="text-gray-600 text-sm flex-grow line-clamp-3">
                        {blog.metaDescription}
                      </p>
                      <p className="text-blue-600 mt-4 text-sm font-medium hover:underline">
                        Read More →
                      </p>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </div>

        {/* See All Blogs Button */}
        <div className="mt-10 text-center">
          <Button
            asChild
            className="bg-[#1f424b] hover:bg-[#2f5058] text-white"
          >
            <Link href="/blogs">See All Blogs</Link>
          </Button>
        </div>
      </section>

      {/* Extra Sections */}
      <ExamDumpsSlider />
      <ContentDumpsFirst />
      <UnlockGoals />
      <ContentDumpsSecond />
      <Testimonial />
      <GeneralFAQs />
    </div>
  );
}
