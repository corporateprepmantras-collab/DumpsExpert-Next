// ============================================
// FILE: app/page.jsx (FIXED VERSION)
// ============================================

import HomePage from "@/components/HomePage";

// ✅ SOLUTION: Use localhost for server-side fetches, relative paths for client
const getAPIUrl = () => {
  // Server-side: Use localhost or deployment URL
  if (typeof window === "undefined") {
    // In production, use the deployment URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // In development or other platforms
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
  // Client-side: Use relative paths
  return "";
};

// ✅ Server-side fetching with proper error handling
async function fetchWithHeaders(endpoint) {
  const BASE_URL = getAPIUrl();
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${url} - ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Fetch failed: ${endpoint}`, error);
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
  const dumps = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];
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
  console.log(`📍 API URL: ${getAPIUrl()}`);
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

  // 🔍 DEBUG: Log actual data structure
  if (dumps?.length > 0) {
    console.log("\n🔍 First Dump Item:", JSON.stringify(dumps[0], null, 2));
  }

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
// CHECK YOUR CLIENT COMPONENTS
// ============================================
// Search for these patterns in your codebase:

// In: components/ExamDumpsSlider.jsx
// In: landingpage/ExamDumpsSlider.jsx
// In: any other client components

// ❌ BAD - Will fail on live:
// fetch('https://prepmantras.com/api/products')

// ✅ GOOD - Works everywhere:
// fetch('/api/products')

// ============================================
// EXAMPLE FIX FOR CLIENT COMPONENT
// ============================================

// If ExamDumpsSlider.jsx has something like:
/*
useEffect(() => {
  fetch('https://prepmantras.com/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
*/

// Change it to:
/*
useEffect(() => {
  fetch('/api/products')  // ✅ Relative path
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
*/

// ============================================
// VERCEL DEPLOYMENT FIX
// ============================================
// If deploying to Vercel, add these environment variables:
//
// VERCEL_URL - automatically set by Vercel
// NEXT_PUBLIC_BASE_URL=https://prepmantras.com
//
// For other platforms, set:
// NEXT_PUBLIC_BASE_URL=https://your-domain.com

// ============================================
// DEBUGGING STEPS
// ============================================
// 1. Test locally in production mode:
//    npm run build
//    npm run start
//    Visit: http://localhost:3000
//    Open DevTools Network tab - all /api/* should return 200
//
// 2. Check your API routes exist:
//    app/api/products/route.js
//    app/api/trending/route.js
//    app/api/session/route.js
//    etc.
//
// 3. Verify API route exports:
//    Each should export GET, POST, etc.
//    Example: export async function GET(request) { ... }
//
// 4. Check build output:
//    npm run build should show:
//    ○ /api/products
//    ○ /api/trending
//    etc.
