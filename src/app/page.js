// ============================================
// FILE: app/page.jsx (VERCEL COMPATIBLE)
// ============================================

import HomePage from "@/components/HomePage";

// Enhanced metadata for better SEO
export const metadata = {
  title: "Best IT Certification Exam Dumps & Practice Tests | 99% Pass Rate",
  description:
    "Get verified IT certification dumps for AWS, SAP, Azure, CompTIA & more. 50,000+ students passed with our practice tests. Money-back guarantee. Updated daily.",
  keywords: [
    "IT certification dumps",
    "exam dumps",
    "practice tests",
    "AWS certification",
    "SAP certification",
    "Azure exam prep",
    "CompTIA dumps",
    "certification training",
  ],
  openGraph: {
    title: "Best IT Certification Exam Dumps | Prepmantras",
    description:
      "Pass your IT certification exam in first attempt. Verified dumps, practice tests & PDF guides. 99% pass rate guaranteed.",
    type: "website",
  },
  alternates: {
    canonical: "https://www.prepmantras.com",
  },
};

// ✅ FIXED: Proper URL resolution for Vercel
const getAPIUrl = () => {
  // Server-side
  if (typeof window === "undefined") {
    // 1. Production: Use environment variable
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }

    // 2. Vercel: Auto-detect from VERCEL_URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Fallback to localhost for local development
    return "http://localhost:3000";
  }

  // Client-side: Use current origin
  return "";
};

// ✅ IMPROVED: Fetch with better error handling
async function fetchWithTimeout(endpoint, timeoutMs = 10000, retries = 2) {
  const BASE_URL = getAPIUrl();
  const url = `${BASE_URL}${endpoint}`;

  console.log(`[Fetch] ${endpoint} from ${BASE_URL}`); // Debug log

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Fetch Error] ${endpoint}: ${response.status}`);

        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1)),
          );
          continue;
        }

        return { error: true, status: response.status, endpoint };
      }

      const data = await response.json();
      return { error: false, data };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[Fetch Error] ${endpoint}: ${error.message}`);

      if (attempt === retries) {
        return {
          error: true,
          message: error.name === "AbortError" ? "timeout" : error.message,
          endpoint,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return { error: true, message: "max_retries", endpoint };
}

// ✅ Fetch functions with fallbacks
async function fetchDumps() {
  const result = await fetchWithTimeout("/api/trending", 8000);
  if (result.error) return [];

  const data = result.data;
  if (!Array.isArray(data)) return [];

  return data
    .map((dump) => ({
      _id: dump._id || dump.id || String(Math.random()),
      title: dump.title || "Untitled Certification",
    }))
    .slice(0, 20);
}

async function fetchCategories() {
  const result = await fetchWithTimeout("/api/blogs/blog-categories", 8000);
  if (result.error) return [];

  const categories = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.data)
      ? result.data.data
      : [];

  return categories;
}

async function fetchBlogs() {
  try {
    const result = await fetchWithTimeout("/api/blogs", 8000);

    if (!result || result.error) {
      console.error("fetchBlogs error:", result?.error);
      return [];
    }

    const data = result.data;
    let blogs = [];

    // ✅ normalize API response
    if (Array.isArray(data)) {
      blogs = data;
    } else if (Array.isArray(data?.blogs)) {
      blogs = data.blogs;
    } else if (Array.isArray(data?.data)) {
      blogs = data.data;
    } else {
      console.error("Unexpected blogs response:", data);
      return [];
    }

    // ✅ only published blogs
    const published = blogs.filter(
      (b) => b?.status === "publish" || b?.status === true,
    );

    return published.slice(0, 50);
  } catch (err) {
    console.error("fetchBlogs exception:", err);
    return [];
  }
}

async function fetchFAQs() {
  const result = await fetchWithTimeout("/api/general-faqs", 8000);
  if (result.error) return [];

  const faqs = Array.isArray(result.data) ? [...result.data].reverse() : [];
  return faqs;
}

async function fetchSEO() {
  const result = await fetchWithTimeout("/api/seo/home", 8000);
  if (result.error) return {};

  return result.data?.data || result.data || {};
}

async function fetchContent1() {
  const result = await fetchWithTimeout("/api/content1", 5000);
  if (result.error) return "";

  return result.data?.html || "";
}

async function fetchContent2() {
  const result = await fetchWithTimeout("/api/content2", 5000);
  if (result.error) return "";

  return result.data?.html || "";
}

async function fetchProducts() {
  const result = await fetchWithTimeout("/api/products?limit=6", 8000);
  if (result.error) return [];

  const data = result.data;
  const products = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  return products;
}

async function fetchAnnouncement() {
  const result = await fetchWithTimeout("/api/announcement", 5000);
  if (result.error) return null;

  return result.data || null;
}

// ✅ MAIN PAGE COMPONENT
export default async function Page() {
  const buildStartTime = Date.now();
  const errors = [];

  console.log(
    `[Build] Starting page generation at ${new Date().toISOString()}`,
  );
  console.log(`[Build] API URL: ${getAPIUrl()}`);

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
  ] = await Promise.all([
    fetchDumps().catch((e) => {
      errors.push({ api: "dumps", error: e.message });
      return [];
    }),
    fetchCategories().catch((e) => {
      errors.push({ api: "categories", error: e.message });
      return [];
    }),
    fetchBlogs().catch((e) => {
      errors.push({ api: "blogs", error: e.message });
      return [];
    }),
    fetchFAQs().catch((e) => {
      errors.push({ api: "faqs", error: e.message });
      return [];
    }),
    fetchSEO().catch((e) => {
      errors.push({ api: "seo", error: e.message });
      return {};
    }),
    fetchContent1().catch((e) => {
      errors.push({ api: "content1", error: e.message });
      return "";
    }),
    fetchContent2().catch((e) => {
      errors.push({ api: "content2", error: e.message });
      return "";
    }),
    fetchProducts().catch((e) => {
      errors.push({ api: "products", error: e.message });
      return [];
    }),
    fetchAnnouncement().catch((e) => {
      errors.push({ api: "announcement", error: e.message });
      return null;
    }),
  ]);

  const buildTime = Date.now() - buildStartTime;

  console.log(`\n✅ Page built in ${buildTime}ms`);
  console.log(
    `📊 Data: ${dumps.length} dumps, ${blogs.length} blogs, ${faqs.length} FAQs`,
  );

  if (errors.length > 0) {
    console.error(`⚠️  ${errors.length} API errors:`, errors);
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

// ✅ Aggressive caching for faster Speed Index
export const revalidate = 300; // 5 minutes
export const dynamic = 'force-static';
export const fetchCache = 'force-cache';
