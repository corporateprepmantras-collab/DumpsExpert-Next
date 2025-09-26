"use client";

import React, { useEffect, useState } from "react";

const GuaranteePage = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/guarantee");

        if (!res.ok) throw new Error("Failed to fetch guarantee content");

        const data = await res.json();
        setContent(data?.html || "");
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <main className="mt-20 px-4 md:px-8 lg:px-16">
      {/* ✅ Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Our Guarantee
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          We believe in building trust and delivering value. Here’s our
          commitment to you.
        </p>
      </section>

      {/* ✅ Content Section */}
      <section className="bg-white text-black p-6 md:p-10 rounded-lg shadow-md space-y-8">
        {loading ? (
          <p className="text-gray-500 italic">Loading guarantee content...</p>
        ) : (
          <div
            style={{ lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        <style jsx>{`
          div :global(h1) {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
          }
          div :global(h2) {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          div :global(h3) {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          div :global(h4) {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
          }
          div :global(p) {
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          div :global(li) {
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </section>
    </main>
  );
};

export default GuaranteePage;
