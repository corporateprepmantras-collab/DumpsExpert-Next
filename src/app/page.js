// ============================================
// FILE: app/page.jsx (IMPROVED ERROR HANDLING)
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

// ✅ IMPROVED: Silent error logging with structured data
async function fetchWithTimeout(endpoint, timeoutMs = 10000, retries = 2) {
  const BASE_URL = getAPIUrl();
  const url = `${BASE_URL}${endpoint}`;

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
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }
        // Return structured error instead of null
        return { error: true, status: response.status, endpoint };
      }

      const data = await response.json();
      return { error: false, data };
    } catch (error) {
      clearTimeout(timeoutId);

      // Last attempt - return structured error
      if (attempt === retries) {
        return {
          error: true,
          message: error.name === "AbortError" ? "timeout" : error.message,
          endpoint,
        };
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return { error: true, message: "max_retries", endpoint };
}

// ✅ IMPROVED: Fetch functions with silent fallbacks
async function fetchDumps() {
  const result = await fetchWithTimeout("/api/trending", 8000);

  if (result.error) {
    // Silent fallback - no console.error
    return [];
  }

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
  const result = await fetchWithTimeout("/api/blogs", 8000);
  if (result.error) return [];

  const data = result.data;
  let blogs = [];
  if (Array.isArray(data)) blogs = data;
  else if (Array.isArray(data?.blogs)) blogs = data.blogs;
  else if (Array.isArray(data?.data)) blogs = data.data;

  return blogs.slice(0, 50);
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
  const result = await fetchWithTimeout("/api/products", 8000);
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
      "IT certification, exam dumps, practice tests, certification prep",
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

// ✅ MAIN PAGE COMPONENT
export default async function Page() {
  const buildStartTime = Date.now();

  // Collect all errors for optional logging
  const errors = [];

  // ✅ Fetch all data with individual error handling
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

  // ✅ Optional: Log summary only in development
  if (process.env.NODE_ENV === "development") {
    console.log(`\n✅ Page built in ${buildTime}ms`);
    console.log(
      `📊 Data: ${dumps.length} dumps, ${blogs.length} blogs, ${faqs.length} FAQs`
    );
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} API errors (gracefully handled)`);
    }
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

// ✅ ISR with 5-minute revalidation
export const revalidate = 300;
