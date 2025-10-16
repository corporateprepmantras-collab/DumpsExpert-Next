import React from "react";
import BlogClient from "./BlogClient";

/* ===========================
   ✅ Fetch Blog Data (SSR)
   =========================== */
async function fetchData(categorySlug) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com";

  const [blogsRes, categoriesRes] = await Promise.all([
    categorySlug
      ? fetch(`${baseUrl}/api/blogs/blog-categories/${categorySlug}`, {
          cache: "no-store",
        })
      : fetch(`${baseUrl}/api/blogs`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/blogs/blog-categories`, { cache: "no-store" }),
  ]);

  const blogsData = await blogsRes.json();
  const categoriesData = await categoriesRes.json();

  return {
    blogs: blogsData.blogs || blogsData.data || [],
    categories: categoriesData.data || categoriesData.blogs || [],
  };
}

/* ===========================
   ✅ Dynamic SEO Metadata
   =========================== */
export async function generateMetadata({ params }) {
  const categorySlug = params?.slug;

  if (!categorySlug) {
    return {
      title: "PrepMantras Blogs | Certification Updates & Tips",
      description:
        "Explore PrepMantras blogs on certification exams, preparation tips, dumps, and guides for IT certifications.",
      keywords: "prepmantras blogs, certification, exam dumps, IT training",
    };
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com";
    const res = await fetch(
      `${baseUrl}/api/blogs/blog-categories/${categorySlug}`,
      {
        cache: "no-store",
      }
    );
    const data = await res.json();
    const category = data?.category || data?.blogs?.[0];

    return {
      title: category?.metaTitle || `${categorySlug} Blogs | PrepMantras`,
      description:
        category?.metaDescription ||
        `Read latest articles about ${categorySlug} certifications, dumps, and resources.`,
      keywords:
        category?.metaKeywords ||
        `${categorySlug}, certification, exam dumps, prepmantras`,
      openGraph: {
        title: category?.metaTitle || `${categorySlug} Blogs | PrepMantras`,
        description:
          category?.metaDescription ||
          `Learn more about ${categorySlug} certification resources.`,
        images: [
          {
            url: category?.imageUrl,
            alt: category?.category,
          },
        ],
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: "PrepMantras Blogs",
      description:
        "Explore all blogs on certifications and IT exam preparation.",
    };
  }
}

/* ===========================
   ✅ Page Component (SSR)
   =========================== */
const BlogPage = async ({ params }) => {
  const categorySlug = params?.slug ?? null;
  const { blogs, categories } = await fetchData(categorySlug);

  return (
    <BlogClient
      categorySlug={categorySlug}
      blogs={blogs}
      categories={categories}
    />
  );
};

export default BlogPage;
