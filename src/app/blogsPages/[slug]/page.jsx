import React from "react";
import BlogClient from "./BlogClient";

/* ===========================
   ✅ Helper to get base URL
   =========================== */
function getBaseUrl() {
  if (typeof window === "undefined") {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    return "http://localhost:3000";
  }
  return "";
}

/* ===========================
   ✅ Fetch Blog Data (SSR) with error handling
   =========================== */
async function fetchData(categorySlug) {
  const baseUrl = getBaseUrl();

  console.log("🔍 Fetching blog data for:", categorySlug || "all blogs");

  try {
    const [blogsRes, categoriesRes] = await Promise.all([
      categorySlug
        ? fetch(`${baseUrl}/api/blogs/blog-categories/${categorySlug}`, {
            cache: "no-store",
          }).catch((err) => {
            console.error("❌ Blogs fetch failed:", err.message);
            return null;
          })
        : fetch(`${baseUrl}/api/blogs`, {
            cache: "no-store",
          }).catch((err) => {
            console.error("❌ Blogs fetch failed:", err.message);
            return null;
          }),
      fetch(`${baseUrl}/api/blogs/blog-categories`, {
        cache: "no-store",
      }).catch((err) => {
        console.error("❌ Categories fetch failed:", err.message);
        return null;
      }),
    ]);

    let blogs = [];
    let categories = [];

    // Handle blogs response
    if (blogsRes && blogsRes.ok) {
      const contentType = blogsRes.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const blogsData = await blogsRes.json();
          blogs = blogsData.blogs || blogsData.data || [];
          console.log("✅ Blogs loaded:", blogs.length);
        } catch (parseError) {
          console.error("❌ Blogs JSON parse error:", parseError.message);
        }
      } else {
        const text = await blogsRes.text();
        console.error(
          "❌ Blogs API returned non-JSON:",
          text.substring(0, 200)
        );
      }
    } else if (blogsRes) {
      console.error("❌ Blogs API failed - Status:", blogsRes.status);
      const errorText = await blogsRes.text();
      console.error("❌ Response:", errorText.substring(0, 500));
    }

    // Handle categories response
    if (categoriesRes && categoriesRes.ok) {
      const contentType = categoriesRes.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const categoriesData = await categoriesRes.json();
          categories = categoriesData.data || categoriesData.blogs || [];
          console.log("✅ Categories loaded:", categories.length);
        } catch (parseError) {
          console.error("❌ Categories JSON parse error:", parseError.message);
        }
      } else {
        const text = await categoriesRes.text();
        console.error(
          "❌ Categories API returned non-JSON:",
          text.substring(0, 200)
        );
      }
    } else if (categoriesRes) {
      console.error("❌ Categories API failed - Status:", categoriesRes.status);
      const errorText = await categoriesRes.text();
      console.error("❌ Response:", errorText.substring(0, 500));
    }

    return {
      blogs,
      categories,
    };
  } catch (error) {
    console.error("❌ Fatal error in fetchData:", error.message);
    return {
      blogs: [],
      categories: [],
    };
  }
}

/* ===========================
   ✅ Dynamic SEO Metadata with error handling
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
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/blogs/blog-categories/${categorySlug}`;

    console.log("🔍 Fetching metadata from:", url);

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("❌ Metadata fetch failed - Status:", res.status);
      throw new Error(`Failed to fetch metadata: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("❌ Metadata API returned non-JSON");
      const text = await res.text();
      console.error("❌ Response:", text.substring(0, 500));
      throw new Error("Non-JSON response");
    }

    const data = await res.json();
    const category = data?.category || data?.blogs?.[0];

    console.log("✅ Metadata loaded for:", category?.category || categorySlug);

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
        images: category?.imageUrl
          ? [
              {
                url: category.imageUrl,
                alt: category.category,
              },
            ]
          : [],
      },
    };
  } catch (err) {
    console.error("❌ Metadata generation error:", err.message);
    return {
      title: `${categorySlug} Blogs | PrepMantras`,
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
