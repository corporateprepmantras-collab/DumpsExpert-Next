"use client";

import React, { useEffect, useState } from "react";

const ContentBoxFirst = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/content1");

        if (!res.ok) throw new Error("Failed to fetch content");

        const data = await res.json();
        setContent(data?.html || "");
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <section className="bg-white text-black p-6 md:p-10 rounded-lg shadow-md space-y-8">
      <div
        style={{
          lineHeight: "1.6",
        }}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />

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
  );
};

export default ContentBoxFirst;
