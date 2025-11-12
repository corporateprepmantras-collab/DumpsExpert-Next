// ============================================
// FILE: app/page.jsx (SIMPLIFIED)
// ============================================

import HomePage from "@/components/HomePage";

// ✅ Data fetchers with direct API calls
async function fetchSEO() {
  try {
    const response = await fetch("/api/seo/home", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return {};

    const data = await response.json();
    const seoData = data?.data || data || {};
    return JSON.parse(JSON.stringify(seoData));
  } catch (error) {
    console.error("❌ fetchSEO failed:", error);
    return {};
  }
}

async function fetchDumps() {
  try {
    const response = await fetch("/api/trending", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    let dumps = [];
    if (Array.isArray(data)) dumps = data;
    else if (Array.isArray(data?.data)) dumps = data.data;
    else if (Array.isArray(data?.dumps)) dumps = data.dumps;

    return JSON.parse(JSON.stringify(dumps));
  } catch (error) {
    console.error("❌ fetchDumps failed:", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch("/api/blogs/blog-categories", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const categories = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("❌ fetchCategories failed:", error);
    return [];
  }
}

async function fetchBlogs() {
  try {
    const response = await fetch("/api/blogs", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    let blogs = [];
    if (Array.isArray(data)) blogs = data;
    else if (Array.isArray(data?.blogs)) blogs = data.blogs;
    else if (Array.isArray(data?.data)) blogs = data.data;
    else if (data?.data && Array.isArray(data.data?.blogs))
      blogs = data.data.blogs;

    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error("❌ fetchBlogs failed:", error);
    return [];
  }
}

async function fetchFAQs() {
  try {
    const response = await fetch("/api/general-faqs", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const faqs = Array.isArray(data) ? [...data].reverse() : [];
    return JSON.parse(JSON.stringify(faqs));
  } catch (error) {
    console.error("❌ fetchFAQs failed:", error);
    return [];
  }
}

async function fetchContent1() {
  try {
    const response = await fetch("/api/content1", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return "";

    const data = await response.json();
    return typeof data?.html === "string" ? data.html : "";
  } catch (error) {
    console.error("❌ fetchContent1 failed:", error);
    return "";
  }
}

async function fetchContent2() {
  try {
    const response = await fetch("/api/content2", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return "";

    const data = await response.json();
    return typeof data?.html === "string" ? data.html : "";
  } catch (error) {
    console.error("❌ fetchContent2 failed:", error);
    return "";
  }
}

async function fetchProducts() {
  try {
    const response = await fetch("/api/products", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const products = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("❌ fetchProducts failed:", error);
    return [];
  }
}

async function fetchAnnouncement() {
  try {
    const response = await fetch("/api/announcement", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (error) {
    console.error("❌ fetchAnnouncement failed:", error);
    return null;
  }
}

// ✅ Metadata generation
export async function generateMetadata() {
  const seo = await fetchSEO();

  const {
    title,
    description,
    canonicalurl,
    keywords,
    ogtitle,
    ogdescription,
    ogimage,
    ogurl,
    twittertitle,
    twitterdescription,
    twitterimage,
    schema,
  } = seo;

  const defaultTitle = "Prepmantras – #1 IT Exam Prep Provider";
  const defaultDescription =
    "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras.";

  return {
    title: title || defaultTitle,
    description: description || defaultDescription,
    keywords:
      keywords || "IT certification, exam dumps, prepmantras, practice tests",
    alternates: {
      canonical: canonicalurl || "https://prepmantras.com/",
    },
    openGraph: {
      title: ogtitle || title || defaultTitle,
      description: ogdescription || description || defaultDescription,
      url: ogurl || canonicalurl || "https://prepmantras.com/",
      images: [
        {
          url: ogimage || "/default-og.jpg",
          width: 1200,
          height: 630,
          alt: title || "Prepmantras Exam Prep",
        },
      ],
      siteName: "Prepmantras",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: twittertitle || title || defaultTitle,
      description: twitterdescription || description || defaultDescription,
      images: [twitterimage || ogimage || "/default-og.jpg"],
      creator: "@prepmantras",
    },
    ...(schema && {
      other: {
        "application/ld+json": JSON.stringify(JSON.parse(schema)),
      },
    }),
  };
}

// ✅ Main Page Component
export default async function Page() {
  const startTime = Date.now();

  // ✅ Fetch all APIs in parallel
  const [
    seo,
    dumps,
    categories,
    blogs,
    faqs,
    content1,
    content2,
    products,
    announcement,
  ] = await Promise.all([
    fetchSEO(),
    fetchDumps(),
    fetchCategories(),
    fetchBlogs(),
    fetchFAQs(),
    fetchContent1(),
    fetchContent2(),
    fetchProducts(),
    fetchAnnouncement(),
  ]);

  const buildTime = Date.now() - startTime;

  console.log(`✅ Page loaded in ${buildTime}ms`);
  console.log(
    `📊 Dumps: ${dumps?.length || 0}, Blogs: ${blogs?.length || 0}, FAQs: ${
      faqs?.length || 0
    }`
  );

  return (
    <HomePage
      seo={seo}
      dumps={dumps}
      categories={categories}
      blogs={blogs}
      faqs={faqs}
      content1={content1}
      content2={content2}
      products={products}
      announcement={announcement}
    />
  );
}
