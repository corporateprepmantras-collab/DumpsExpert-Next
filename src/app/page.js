// ============================================
// FILE: app/page.jsx (FIXED - HANDLES API DATA CORRECTLY)
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
      cache: "no-store", // ✅ CRITICAL: Force fresh data in production
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${url} - ${response.status}`);
      return null;
    }

    const data = await response.json();

    // ✅ Log what we actually received
    console.log(
      `✅ ${endpoint} returned:`,
      Array.isArray(data) ? `${data.length} items` : typeof data
    );

    return data;
  } catch (error) {
    console.error(`❌ Fetch failed: ${endpoint}`, error.message);
    return null;
  }
}

// ✅ CRITICAL FIX: Handle the actual data structure from your API
async function fetchDumps() {
  const data = await fetchWithHeaders("/api/trending");

  // Your API returns an array directly
  if (!data) {
    console.warn("⚠️ /api/trending returned null");
    return [];
  }

  if (!Array.isArray(data)) {
    console.warn("⚠️ /api/trending didn't return an array:", typeof data);
    return [];
  }

  console.log(`✅ Fetched ${data.length} dumps from /api/trending`);

  // ✅ Transform data to match your component expectations
  const transformed = data.map((dump) => ({
    _id: dump._id || dump.id,
    title: dump.title || "Untitled",
    // Add any other fields your components need
  }));

  return JSON.parse(JSON.stringify(transformed));
}

async function fetchCategories() {
  const data = await fetchWithHeaders("/api/blogs/blog-categories");

  if (!data) return [];

  const categories = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  console.log(`✅ Fetched ${categories.length} categories`);
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

  console.log(`✅ Fetched ${blogs.length} blogs`);
  return JSON.parse(JSON.stringify(blogs));
}

async function fetchFAQs() {
  const data = await fetchWithHeaders("/api/general-faqs");

  if (!data) return [];

  const faqs = Array.isArray(data) ? [...data].reverse() : [];
  console.log(`✅ Fetched ${faqs.length} FAQs`);
  return JSON.parse(JSON.stringify(faqs));
}

async function fetchSEO() {
  const data = await fetchWithHeaders("/api/seo/home");

  if (!data) return {};

  const seoData = data?.data || data || {};
  console.log(`✅ Fetched SEO with ${Object.keys(seoData).length} fields`);
  return JSON.parse(JSON.stringify(seoData));
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

  console.log(`✅ Fetched ${products.length} products`);
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
  console.log("\n════════════════════════════════════════════════");
  console.log("🚀 PAGE BUILD START");
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 API URL: ${getAPIUrl()}`);
  console.log(`📍 Vercel URL: ${process.env.VERCEL_URL || "not set"}`);
  console.log("════════════════════════════════════════════════\n");

  const startTime = Date.now();

  // ✅ Fetch all APIs in parallel
  const [
    dumps,
    categories,
    blogs,
    faqs,
    seo,
    content1,
    content2,
    products,
    announcement,
  ] = await Promise.allSettled([
    fetchDumps(),
    fetchCategories(),
    fetchBlogs(),
    fetchFAQs(),
    fetchSEO(),
    fetchContent1(),
    fetchContent2(),
    fetchProducts(),
    fetchAnnouncement(),
  ]);

  const buildTime = Date.now() - startTime;

  // ✅ Extract values from Promise results
  const dumpsData = dumps.status === "fulfilled" ? dumps.value : [];
  const categoriesData =
    categories.status === "fulfilled" ? categories.value : [];
  const blogsData = blogs.status === "fulfilled" ? blogs.value : [];
  const faqsData = faqs.status === "fulfilled" ? faqs.value : [];
  const seoData = seo.status === "fulfilled" ? seo.value : {};
  const content1Data = content1.status === "fulfilled" ? content1.value : "";
  const content2Data = content2.status === "fulfilled" ? content2.value : "";
  const productsData = products.status === "fulfilled" ? products.value : [];
  const announcementData =
    announcement.status === "fulfilled" ? announcement.value : null;

  console.log("════════════════════════════════════════════════");
  console.log(`✅ BUILD COMPLETE in ${buildTime}ms`);
  console.log("════════════════════════════════════════════════");
  console.log("📊 Data Summary:");
  console.log(`  • SEO: ${Object.keys(seoData).length} fields`);
  console.log(`  • Dumps: ${dumpsData?.length || 0} items`);
  console.log(`  • Categories: ${categoriesData?.length || 0} items`);
  console.log(`  • Blogs: ${blogsData?.length || 0} items`);
  console.log(`  • FAQs: ${faqsData?.length || 0} items`);
  console.log(`  • Content1: ${content1Data?.length || 0} chars`);
  console.log(`  • Content2: ${content2Data?.length || 0} chars`);
  console.log(`  • Products: ${productsData?.length || 0} items`);
  console.log(`  • Announcement: ${announcementData?.active ? "✓" : "✗"}`);

  // 🔍 DEBUG: Log first dump item to verify structure
  if (dumpsData?.length > 0) {
    console.log("\n🔍 First Dump Item:", JSON.stringify(dumpsData[0], null, 2));
  } else {
    console.log("\n⚠️  WARNING: No dumps data received!");
  }

  console.log("════════════════════════════════════════════════\n");

  // ✅ Warn if critical data is missing
  if (!blogsData.length || !dumpsData.length || !faqsData.length) {
    console.warn("⚠️  WARNING: Some critical data is missing!");
    console.warn({
      blogsEmpty: blogsData.length === 0,
      dumpsEmpty: dumpsData.length === 0,
      faqsEmpty: faqsData.length === 0,
    });
  }

  return (
    <HomePage
      seo={seoData}
      dumps={dumpsData}
      categories={categoriesData}
      blogs={blogsData}
      faqs={faqsData}
      content1={content1Data}
      content2={content2Data}
      products={productsData}
      announcement={announcementData}
    />
  );
}
