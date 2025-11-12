// ============================================
// FILE: app/page.jsx (RELATIVE PATHS VERSION)
// ============================================

import HomePage from "@/components/HomePage";

// ✅ Get the correct base URL for server-side fetches
function getBaseURL() {
  // Browser (client-side): use relative paths
  if (typeof window !== "undefined") {
    return "";
  }

  // Vercel production or preview
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Explicitly set production URL (RECOMMENDED)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // HARDCODED FALLBACK - Replace with your actual domain
  if (process.env.NODE_ENV === "production") {
    return "https://dumps-expert-next.vercel.app"; // ⚠️ CHANGE THIS!
  }

  // Local development
  return "http://localhost:3000";
}

// ✅ Fetch with proper URL handling
async function fetchWithHeaders(endpoint) {
  const baseURL = getBaseURL();
  const url = `${baseURL}${endpoint}`;

  try {
    console.log(`🔄 Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
      cache: "no-store", // Disable caching during development
    });

    console.log(`✅ Response: ${endpoint} - ${response.status}`);

    if (!response.ok) {
      console.error(`❌ API Error: ${endpoint} - ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`📦 Data received from ${endpoint}:`, data ? "OK" : "NULL");
    return data;
  } catch (error) {
    console.error(`❌ Fetch failed: ${endpoint}`, error.message);
    return null;
  }
}

// ✅ Data fetchers with fallbacks and serialization
async function fetchSEO() {
  const data = await fetchWithHeaders("/api/seo/home");
  const seoData = data?.data || data || {};
  return JSON.parse(JSON.stringify(seoData));
}

async function fetchDumps() {
  const data = await fetchWithHeaders("/api/trending");
  console.log("📦 Raw dumps data:", data);

  let dumps = [];

  // Try multiple possible data structures
  if (Array.isArray(data)) {
    dumps = data;
  } else if (Array.isArray(data?.data)) {
    dumps = data.data;
  } else if (Array.isArray(data?.dumps)) {
    dumps = data.dumps;
  } else if (Array.isArray(data?.products)) {
    dumps = data.products;
  } else if (data?.data?.data && Array.isArray(data.data.data)) {
    dumps = data.data.data;
  }

  console.log(`✅ Extracted ${dumps.length} dumps`);
  return JSON.parse(JSON.stringify(dumps));
}

async function fetchCategories() {
  const data = await fetchWithHeaders("/api/blogs/blog-categories");
  const categories = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  return JSON.parse(JSON.stringify(categories));
}

async function fetchBlogs() {
  const data = await fetchWithHeaders("/api/blogs");
  let blogs = [];
  if (Array.isArray(data)) blogs = data;
  else if (Array.isArray(data?.blogs)) blogs = data.blogs;
  else if (Array.isArray(data?.data)) blogs = data.data;
  else if (data?.data && Array.isArray(data.data?.blogs))
    blogs = data.data.blogs;
  return JSON.parse(JSON.stringify(blogs));
}

async function fetchFAQs() {
  const data = await fetchWithHeaders("/api/general-faqs");
  const faqs = Array.isArray(data) ? [...data].reverse() : [];
  return JSON.parse(JSON.stringify(faqs));
}

async function fetchContent1() {
  const data = await fetchWithHeaders("/api/content1");
  return typeof data?.html === "string" ? data.html : "";
}

async function fetchContent2() {
  const data = await fetchWithHeaders("/api/content2");
  return typeof data?.html === "string" ? data.html : "";
}

async function fetchProducts() {
  const data = await fetchWithHeaders("/api/products");
  const products = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
  return JSON.parse(JSON.stringify(products));
}

async function fetchAnnouncement() {
  const data = await fetchWithHeaders("/api/announcement");
  return data ? JSON.parse(JSON.stringify(data)) : null;
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
  console.log("\n═══════════════════════════════════════");
  console.log("🚀 PAGE BUILD START");
  console.log("═══════════════════════════════════════\n");

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

  console.log("═══════════════════════════════════════");
  console.log(`✅ BUILD COMPLETE in ${buildTime}ms`);
  console.log("═══════════════════════════════════════");
  console.log("📊 Data Summary:");
  console.log(`  • SEO: ${Object.keys(seo).length} fields`);
  console.log(`  • Dumps: ${dumps?.length || 0} items`);
  console.log(`  • Categories: ${categories?.length || 0} items`);
  console.log(`  • Blogs: ${blogs?.length || 0} items`);
  console.log(`  • FAQs: ${faqs?.length || 0} items`);
  console.log(`  • Content1: ${content1?.length || 0} chars`);
  console.log(`  • Content2: ${content2?.length || 0} chars`);
  console.log(`  • Products: ${products?.length || 0} items`);
  console.log(`  • Announcement: ${announcement?.active ? "✓" : "✗"}`);

  // 🔍 DEBUG: Log the ACTUAL data structure
  console.log("\n🔍 DEBUGGING DATA STRUCTURES:");
  console.log("─────────────────────────────────────");
  console.log("Dumps array:", dumps);
  console.log("Dumps length:", dumps?.length);
  if (dumps?.length > 0) {
    console.log("First dump:", JSON.stringify(dumps[0], null, 2));
    console.log("Dump keys:", Object.keys(dumps[0]));
  }
  console.log("\nCategories:", categories?.slice(0, 2));
  console.log("Blogs:", blogs?.slice(0, 2));
  console.log("Products:", products?.slice(0, 2));
  console.log("═══════════════════════════════════════\n");

  // ✅ Warn if critical data is missing
  if (!blogs.length || !dumps.length || !faqs.length) {
    console.warn("⚠️  WARNING: Some critical data is missing!");
    console.warn({
      blogsEmpty: blogs.length === 0,
      dumpsEmpty: dumps.length === 0,
      faqsEmpty: faqs.length === 0,
    });
  }

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

// ============================================
// KEY CHANGES:
// ============================================
// ✅ Removed getAPIUrl() function
// ✅ All fetches use relative paths: /api/...
// ✅ Works on any domain automatically
// ✅ No environment variables needed
//
// This will work on:
// - localhost:3000
// - prepmantras.com
// - any-other-domain.com
//
// Make sure your client components also use
// relative paths like fetch('/api/products')
// ============================================
