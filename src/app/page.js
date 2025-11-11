// ============================================
// FILE: app/page.jsx (PRODUCTION FIX)
// ============================================

import HomePage from "@/components/HomePage";

// ✅ FIXED: Proper URL resolution for Vercel
const getAPIUrl = () => {
  // Server-side: Use absolute URLs
  if (typeof window === "undefined") {
    // 1️⃣ Production: Use VERCEL_URL (automatically set by Vercel)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // 2️⃣ Production fallback: Use your custom domain
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }

    // 3️⃣ Development: Use localhost
    return "http://localhost:3000";
  }

  // Client-side: Use relative paths
  return "";
};

// ✅ Enhanced fetch with better error handling
async function fetchWithHeaders(endpoint) {
  const BASE_URL = getAPIUrl();
  const url = `${BASE_URL}${endpoint}`;

  try {
    console.log(`📡 Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
      next: {
        revalidate: 300, // ISR: revalidate every 5 minutes
        tags: [endpoint.split("/").pop()], // Cache tags for on-demand revalidation
      },
    });

    if (!response.ok) {
      console.error(
        `❌ API Error: ${url} - ${response.status} ${response.statusText}`
      );

      // Log response body for debugging
      const text = await response.text();
      console.error(`Response body: ${text.substring(0, 200)}`);

      return null;
    }

    const data = await response.json();
    console.log(
      `✅ Success: ${endpoint} - ${JSON.stringify(data).length} bytes`
    );
    return data;
  } catch (error) {
    console.error(`❌ Fetch failed: ${endpoint}`, {
      message: error.message,
      stack: error.stack,
      url,
    });
    return null;
  }
}

// ✅ Data fetchers with proper serialization
async function fetchSEO() {
  const data = await fetchWithHeaders("/api/seo/home");
  if (!data) return {};

  const seoData = data?.data || data || {};
  return JSON.parse(JSON.stringify(seoData));
}

async function fetchDumps() {
  const data = await fetchWithHeaders("/api/trending");
  if (!data) {
    console.warn("⚠️ fetchDumps returned null");
    return [];
  }

  let dumps = [];
  if (Array.isArray(data)) dumps = data;
  else if (Array.isArray(data?.data)) dumps = data.data;
  else if (Array.isArray(data?.dumps)) dumps = data.dumps;

  console.log(`📊 Dumps parsed: ${dumps.length} items`);
  return JSON.parse(JSON.stringify(dumps));
}

async function fetchCategories() {
  const data = await fetchWithHeaders("/api/blogs/blog-categories");
  if (!data) return [];

  const categories = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  return JSON.parse(JSON.stringify(categories));
}

async function fetchBlogs() {
  const data = await fetchWithHeaders("/api/blogs");
  if (!data) return [];

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
  if (!data) return [];

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
  if (!data) return [];

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
  const buildEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown";
  const apiUrl = getAPIUrl();

  console.log("\n═══════════════════════════════════════");
  console.log("🚀 PAGE BUILD START");
  console.log(`📍 Environment: ${buildEnv}`);
  console.log(`📍 API URL: ${apiUrl}`);
  console.log(`📍 VERCEL_URL: ${process.env.VERCEL_URL || "not set"}`);
  console.log(
    `📍 NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || "not set"}`
  );
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

  // 🔍 DEBUG: Log actual data
  if (dumps?.length > 0) {
    console.log("\n🔍 First Dump Item:", JSON.stringify(dumps[0], null, 2));
  } else {
    console.error("\n❌ CRITICAL: Dumps array is empty!");
  }

  console.log("═══════════════════════════════════════\n");

  // ✅ Warn if critical data is missing
  if (!blogs.length || !dumps.length || !faqs.length) {
    console.error("❌ CRITICAL: Missing data detected!");
    console.error({
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
// VERCEL ENVIRONMENT VARIABLES REQUIRED
// ============================================
// Add these in Vercel Dashboard → Settings → Environment Variables:
//
// 1. NEXT_PUBLIC_SITE_URL=https://prepmantras.com
//    (or your actual domain)
//
// 2. VERCEL_URL is automatically set by Vercel
//    (no need to add manually)
//
// ============================================
// DEBUGGING ON VERCEL
// ============================================
// 1. Check build logs in Vercel Dashboard
// 2. Look for "📡 Fetching:" logs
// 3. Check for "❌ API Error:" messages
// 4. Verify API routes are deployed:
//    - https://your-domain.com/api/trending
//    - https://your-domain.com/api/blogs
//    - etc.
