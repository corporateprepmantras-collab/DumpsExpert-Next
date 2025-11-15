import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import guarantee from "../../assets/userAssets/guaranteed.png";

// ✅ Force this page to always be dynamic
export const dynamic = "force-dynamic";

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
      return "https://dumps-expert-next.vercel.app";
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
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
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
   ✅ Fetch Product Categories with Retry
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
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(
          `❌ [Categories] Fetch failed: ${res.status} ${res.statusText}`
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

      console.log(`✅ [Categories] Fetched ${categories.length} items`);
      return categories;
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
      canonical:
        seo.canonicalurl || "https://dumps-expert-next.vercel.app/ItDumps",
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
      url: seo.ogurl || "https://dumps-expert-next.vercel.app/ItDumps",
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
    `✅ [ITDumps Page] Rendered in ${renderTime}ms with ${dumpsData.length} categories\n`
  );

  return (
    <div
      className="relative min-h-screen w-full pt-24 pb-10 px-4 md:px-8"
      style={{
        backgroundImage: `url(${guarantee.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-10">
          Unlock Your Potential with SAP Certification Dumps
        </h1>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center max-w-2xl mx-auto mb-12 text-gray-900 text-sm sm:text-base font-medium">
          <div className="space-y-3">
            {[
              "Instant Download After Purchase",
              "100% Real & Updated Dumps",
              "100% Money Back Guarantee",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <FaCheckCircle className="text-blue-600 text-lg flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {["90 Days Free Updates", "24/7 Customer Support"].map(
              (text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 text-lg flex-shrink-0" />
                  <span>{text}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {dumpsData.length > 0 ? (
            dumpsData.map((item) => {
              const slug = createSlug(item.name);

              if (!slug) {
                console.warn(`⚠️ Invalid slug for category: ${item.name}`);
                return null;
              }

              return (
                <Link
                  key={item._id || item.id}
                  href={`/ItDumps/${slug}`}
                  className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col items-center text-center overflow-hidden w-[160px] sm:w-[180px] md:w-[200px]"
                >
                  <div className="h-28 md:h-32 w-full relative bg-gray-50">
                    <Image
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name || "Category"}
                      fill
                      className="object-contain p-3"
                      sizes="200px"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-3 pb-4 w-full">
                    <h3 className="text-sm sm:text-base font-medium capitalize text-gray-800 truncate">
                      {item.name || "Unnamed Category"}
                    </h3>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-2">
                No categories available at the moment.
              </p>
              <p className="text-gray-500 text-sm">
                Please check back later or contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
