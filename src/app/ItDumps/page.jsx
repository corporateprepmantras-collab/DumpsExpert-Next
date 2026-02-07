import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

// ✅ Enable ISR for better performance
export const dynamic = "auto";
export const revalidate = 60; // Revalidate every 1 minute for fresh admin updates

// Loading skeleton component
function CategorySkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md flex flex-col items-center overflow-hidden w-[160px] sm:w-[180px] md:w-[200px] animate-pulse">
      <div className="h-28 md:h-32 w-full bg-gray-200" />
      <div className="px-3 pb-4 w-full pt-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
      </div>
    </div>
  );
}

/* ===========================
   ✅ Get correct base URL for server-side fetches
   =========================== */
function getBaseURL() {
  // Server-side only
  if (typeof window === "undefined") {
    // 1. Use explicit production URL from env
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }

    // 2. Vercel auto-detection
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Production fallback
    if (process.env.NODE_ENV === "production") {
      return "https://www.prepmantras.com";
    }

    // 4. Local development
    return "http://localhost:3000";
  }

  // Client-side: use relative paths
  return "";
}

/* ===========================
   ✅ Fetch SEO data (Server-side)
   =========================== */
async function fetchSEO() {
  try {
    const baseUrl = getBaseURL();
    const url = `${baseUrl}/api/seo/sap`;

    console.log(`🔍 [SEO] Fetching from: ${url}`);

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ [SEO] Fetch failed: ${res.status} ${res.statusText}`);
      return {};
    }

    const json = await res.json();
    console.log("✅ [SEO] Data fetched successfully");

    // Handle both formats: {data: {...}} or {...directly}
    return json.data || json;
  } catch (error) {
    console.error("❌ [SEO] Fetch error:", error.message);
    return {};
  }
}

/* ===========================
   ✅ Fetch Product Categories with Retry (Only Published)
   =========================== */
async function getDumpsData() {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const baseUrl = getBaseURL();
      const url = `${baseUrl}/api/product-categories`;

      console.log(`🔍 [Categories] Attempt ${attempt}/${maxRetries}: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        next: { revalidate: 60 },
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(
          `❌ [Categories] Fetch failed: ${res.status} ${res.statusText}`,
        );

        // Retry on server errors (500+)
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return [];
      }

      const json = await res.json();

      // Extract array from different response formats
      let categories = [];
      if (Array.isArray(json.data)) {
        categories = json.data;
      } else if (Array.isArray(json)) {
        categories = json;
      } else if (json.categories && Array.isArray(json.categories)) {
        categories = json.categories;
      }

      // ✅ Filter only published categories
      const publishedCategories = categories.filter(
        (cat) => cat.status === "Publish",
      );

      console.log(
        `✅ [Categories] Fetched ${categories.length} total, ${publishedCategories.length} published`,
      );
      return publishedCategories;
    } catch (error) {
      lastError = error;
      console.error(`❌ [Categories] Attempt ${attempt} error:`, error.message);

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error("❌ [Categories] All retries failed:", lastError?.message);
  return [];
}

/* ===========================
   ✅ Dynamic Metadata
   =========================== */
export async function generateMetadata() {
  const seo = await fetchSEO();

  const defaultTitle = "SAP Dumps – Prepmantras";
  const defaultDescription =
    "Get the latest SAP certification dumps and verified exam prep materials at Prepmantras.";

  return {
    title: seo.title || defaultTitle,
    description: seo.description || defaultDescription,
    keywords: seo.keywords || "SAP dumps, SAP certification, prepmantras",
    alternates: {
      canonical: seo.canonicalurl || "https://www.prepmantras.com/ItDumps",
    },
    openGraph: {
      title: seo.ogtitle || seo.title || defaultTitle,
      description: seo.ogdescription || seo.description || defaultDescription,
      images: [
        {
          url: seo.ogimage || "/default-og.jpg",
          width: 1200,
          height: 630,
        },
      ],
      url: seo.ogurl || "https://www.prepmantras.com/ItDumps",
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

/* ===========================
   ✅ Utility – Create SEO-Friendly Slug
   =========================== */
function createSlug(name) {
  if (!name) return "";

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-"); // Remove duplicate hyphens
}

/* ===========================
   ✅ Page Component
   =========================== */
export default async function ITDumpsPage() {
  const startTime = Date.now();
  console.log("\n🚀 [ITDumps Page] Starting render...");

  const dumpsData = await getDumpsData();

  const renderTime = Date.now() - startTime;
  console.log(
    `✅ [ITDumps Page] Rendered in ${renderTime}ms with ${dumpsData.length} published categories\n`,
  );

  // Preload images for better performance
  const priorityCount = Math.min(6, dumpsData.length);

  return (
    <div className="relative min-h-screen w-full pt-16 md:pt-20 pb-8 md:pb-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        {/* Header - Optimized for mobile */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6 md:mb-8 lg:mb-10">
          SAP Certification Dumps
        </h1>

        {/* Features Grid - Simplified for mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-4xl mx-auto mb-8 md:mb-10 lg:mb-12">
          {[
            "Instant Download",
            "100% Real Dumps",
            "Money Back Guarantee",
            "90 Days Updates",
          ].map((text, i) => (
            <div
              key={i}
              className="flex items-center justify-center md:justify-start gap-2 text-gray-900 text-xs md:text-sm lg:text-base font-medium bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100"
            >
              <FaCheckCircle className="text-blue-600 text-base md:text-lg flex-shrink-0" />
              <span className="text-center md:text-left">{text}</span>
            </div>
          ))}
        </div>

        {/* Categories Grid - Optimized */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6">
          {dumpsData.length > 0 ? (
            dumpsData.map((item, index) => {
              const slug = createSlug(item.name);

              if (!slug) {
                console.warn(`⚠️ Invalid slug for category: ${item.name}`);
                return null;
              }

              const isPriority = index < priorityCount;

              return (
                <Link
                  key={item._id || item.id}
                  href={`/ItDumps/${slug}`}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg active:scale-95 md:hover:scale-105 transition-all duration-200 flex flex-col items-center text-center overflow-hidden w-[145px] sm:w-[165px] md:w-[190px] lg:w-[210px]"
                >
                  <div className="h-28 sm:h-32 md:h-36 lg:h-40 w-full relative bg-gray-50">
                    <ImageWithSkeleton
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name || "Category"}
                      fill
                      className="object-contain p-2 md:p-3"
                      sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 200px"
                      loading={isPriority ? "eager" : "lazy"}
                      priority={isPriority}
                      quality={60}
                      skeletonClassName="rounded-t-xl"
                    />
                  </div>
                  <div className="px-3 py-3 md:px-4 md:py-4 w-full">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold capitalize text-gray-800 truncate">
                      {item.name || "Unnamed Category"}
                    </h3>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-base md:text-lg mb-2">
                No categories available.
              </p>
              <p className="text-gray-500 text-sm">Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
