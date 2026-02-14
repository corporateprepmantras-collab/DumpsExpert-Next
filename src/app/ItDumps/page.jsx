import Link from "next/link";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import sapExamdumps from "@/assets/userAssets/sap examdumps.webp";
// ✅ Enable ISR for better performance
export const dynamic = "auto";
export const revalidate = 60; // Revalidate every 1 minute for fresh admin updates

// Loading skeleton component
function CategorySkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md flex flex-col items-center overflow-hidden w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] animate-pulse">
      <div className="h-28 sm:h-32 md:h-36 lg:h-40 w-full bg-gray-200" />
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
    <div className="relative min-h-screen w-full pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-10 sm:pb-12 md:pb-16 lg:pb-20 bg-transparent">
      {/* full-page background image (behind content) */}
      <div className="absolute inset-0 -z-10">
        <ImageWithSkeleton
          src={sapExamdumps}
          alt="SAP background"
          fill={true}
          className="object-cover"
          priority={true}
          quality={80}
          skeletonClassName=""
        />
        {/* Blur overlay on top of image */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/10"></div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 bg-black/20 backdrop-blur-sm rounded-3xl">
        {/* Header */}
        <h1 className="text-2xl p-6 sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          SAP Certification Dumps
        </h1>

        {/* Categories Grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
                  className="group bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl hover:border-blue-300 active:scale-95 md:hover:scale-105 transition-all duration-300 flex flex-col items-center text-center overflow-hidden w-[120px] sm:w-[135px] md:w-[150px] lg:w-[160px] xl:w-[170px] h-[70px] sm:h-[80px] md:h-[90px] lg:h-[100px] xl:h-[110px]"
                >
                  {/* Image Container */}
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-full relative bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors duration-300 flex items-center justify-center">
                    <ImageWithSkeleton
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name || "Category"}
                      fill
                      className="object-contain p-0.5 sm:p-1 md:p-1.5 group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 120px, (max-width: 768px) 135px, (max-width: 1024px) 150px, (max-width: 1280px) 160px, 170px"
                      loading={isPriority ? "eager" : "lazy"}
                      priority={isPriority}
                      quality={75}
                      skeletonClassName="rounded-t-xl sm:rounded-t-2xl"
                    />
                  </div>

                  {/* Text Container */}
                  <div className="px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 md:py-1.5 w-full bg-white group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors duration-300 flex-1 flex items-center justify-center">
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-bold capitalize text-gray-800 group-hover:text-blue-700 truncate transition-colors duration-300">
                      {item.name || "Unnamed Category"}
                    </h3>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-16 sm:py-20 md:py-24 lg:py-32 w-full">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg sm:text-xl md:text-2xl font-semibold mb-3">
                  No categories available
                </p>
                <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                  Please check back later for updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
