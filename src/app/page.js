// ============================================
// FILE: app/page.jsx (OPTIMIZED FOR VERCEL BUILDS)
// ============================================

import HomePage from "@/components/HomePage";

const getAPIUrl = () => {
  if (typeof window === "undefined") {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
  return "";
};

// ✅ ADD TIMEOUT TO PREVENT HANGING
async function fetchWithTimeout(endpoint, timeoutMs = 8000) {
  const BASE_URL = getAPIUrl();
  const url = `${BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ ${endpoint} - HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error(`⏱️ ${endpoint} - TIMEOUT after ${timeoutMs}ms`);
    } else {
      console.error(`❌ ${endpoint} - ${error.message}`);
    }
    return null;
  }
}

// ✅ SIMPLIFIED FETCH FUNCTIONS WITH FALLBACKS
async function fetchDumps() {
  const data = await fetchWithTimeout("/api/trending");
  if (!Array.isArray(data)) return [];

  return data.map((dump) => ({
    _id: dump._id || dump.id,
    title: dump.title || "Untitled",
  }));
}

async function fetchCategories() {
  const data = await fetchWithTimeout("/api/blogs/blog-categories");
  return Array.isArray(data) ? data : [];
}

async function fetchBlogs() {
  const data = await fetchWithTimeout("/api/blogs");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.blogs)) return data.blogs;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function fetchFAQs() {
  const data = await fetchWithTimeout("/api/general-faqs");
  return Array.isArray(data) ? [...data].reverse() : [];
}

async function fetchSEO() {
  const data = await fetchWithTimeout("/api/seo/home");
  return data?.data || data || {};
}

async function fetchContent1() {
  const data = await fetchWithTimeout("/api/content1");
  return data?.html || "";
}

async function fetchContent2() {
  const data = await fetchWithTimeout("/api/content2");
  return data?.html || "";
}

async function fetchProducts() {
  const data = await fetchWithTimeout("/api/products");
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

async function fetchAnnouncement() {
  const data = await fetchWithTimeout("/api/announcement");
  return data || null;
}

// ✅ METADATA GENERATION
export async function generateMetadata() {
  const seo = await fetchSEO();

  const defaultTitle = "Prepmantras – #1 IT Exam Prep Provider";
  const defaultDescription =
    "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras.";

  return {
    title: seo.title || defaultTitle,
    description: seo.description || defaultDescription,
    keywords:
      seo.keywords ||
      "IT certification, exam dumps, prepmantras, practice tests",
    alternates: {
      canonical: seo.canonicalurl || "https://prepmantras.com/",
    },
    openGraph: {
      title: seo.ogtitle || seo.title || defaultTitle,
      description: seo.ogdescription || seo.description || defaultDescription,
      url: seo.ogurl || seo.canonicalurl || "https://prepmantras.com/",
      images: [
        {
          url: seo.ogimage || "/default-og.jpg",
          width: 1200,
          height: 630,
        },
      ],
      siteName: "Prepmantras",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twittertitle || seo.title || defaultTitle,
      description:
        seo.twitterdescription || seo.description || defaultDescription,
      images: [seo.twitterimage || seo.ogimage || "/default-og.jpg"],
    },
  };
}

// ✅ MAIN PAGE COMPONENT - WITH TIMEOUT PROTECTION
export default async function Page() {
  console.log("🚀 Building homepage...");
  const startTime = Date.now();

  // ✅ RACE CONDITION: Fail fast if any critical API takes too long
  const CRITICAL_TIMEOUT = 25000; // 25 seconds max for ALL APIs

  const fetchPromise = Promise.allSettled([
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

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Build timeout - using fallback data")),
      CRITICAL_TIMEOUT
    );
  });

  let results;
  try {
    results = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error("⚠️ Build timeout reached - returning minimal page");
    // Return minimal working page
    return (
      <HomePage
        seo={{}}
        dumps={[]}
        categories={[]}
        blogs={[]}
        faqs={[]}
        content1=""
        content2=""
        products={[]}
        announcement={null}
      />
    );
  }

  const buildTime = Date.now() - startTime;

  // ✅ Extract values with fallbacks
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
  ] = results;

  const data = {
    dumps: dumps.status === "fulfilled" ? dumps.value : [],
    categories: categories.status === "fulfilled" ? categories.value : [],
    blogs: blogs.status === "fulfilled" ? blogs.value : [],
    faqs: faqs.status === "fulfilled" ? faqs.value : [],
    seo: seo.status === "fulfilled" ? seo.value : {},
    content1: content1.status === "fulfilled" ? content1.value : "",
    content2: content2.status === "fulfilled" ? content2.value : "",
    products: products.status === "fulfilled" ? products.value : [],
    announcement:
      announcement.status === "fulfilled" ? announcement.value : null,
  };

  console.log(`✅ Build completed in ${buildTime}ms`);
  console.log(
    `📊 Dumps: ${data.dumps.length}, Blogs: ${data.blogs.length}, FAQs: ${data.faqs.length}`
  );

  return (
    <HomePage
      seo={data.seo}
      dumps={data.dumps}
      categories={data.categories}
      blogs={data.blogs}
      faqs={data.faqs}
      content1={data.content1}
      content2={data.content2}
      products={data.products}
      announcement={data.announcement}
    />
  );
}
