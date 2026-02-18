import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import ProductsList from "./ProductsList";

// Enable ISR for better performance
export const dynamic = "force-dynamic";
export const revalidate = 0; // Real-time updates - no caching

/* ===========================
   ✅ Fetch category + products with graceful fallback
   =========================== */
async function fetchCategoryData(coursename) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    console.log("🔍 Fetching from:", `${baseUrl}/api/products`);

    const [prodRes, catRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }).catch((err) => {
        console.error("❌ Products fetch failed:", err.message);
        return null;
      }),
      fetch(`${baseUrl}/api/product-categories`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }).catch((err) => {
        console.error("❌ Categories fetch failed:", err.message);
        return null;
      }),
    ]);

    let products = [];
    let categories = [];

    // Handle products response
    if (prodRes && prodRes.ok) {
      const contentType = prodRes.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const prodData = await prodRes.json();
          products = Array.isArray(prodData.data)
            ? prodData.data
            : Array.isArray(prodData)
              ? prodData
              : [];
          console.log("✅ Products loaded:", products.length);
        } catch (parseError) {
          console.error("❌ Products JSON parse error:", parseError.message);
        }
      } else {
        const text = await prodRes.text();
        console.error("❌ Products returned non-JSON:", text.substring(0, 200));
      }
    } else if (prodRes) {
      const errorText = await prodRes.text();
      console.error("❌ Products API failed - Status:", prodRes.status);
      console.error("❌ Response:", errorText.substring(0, 500));
    }

    // Handle categories response
    if (catRes && catRes.ok) {
      const contentType = catRes.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const catData = await catRes.json();
          categories = Array.isArray(catData.data)
            ? catData.data
            : Array.isArray(catData)
              ? catData
              : [];
          console.log("✅ Categories loaded:", categories.length);
        } catch (parseError) {
          console.error("❌ Categories JSON parse error:", parseError.message);
        }
      } else {
        const text = await catRes.text();
        console.error(
          "❌ Categories returned non-JSON:",
          text.substring(0, 200),
        );
      }
    } else if (catRes) {
      const errorText = await catRes.text();
      console.error("❌ Categories API failed - Status:", catRes.status);
      console.error("❌ Response:", errorText.substring(0, 500));
    }

    const matchedCategory = categories.find(
      (c) =>
        c.slug?.toLowerCase() === coursename.toLowerCase() ||
        c.name?.toLowerCase() === coursename.toLowerCase(),
    );

    const categoryProducts = products.filter(
      (p) =>
        p.category?.toLowerCase().replace(/\s+/g, "-") ===
        coursename.toLowerCase(),
    );
    console.log("✅ Matched category:", matchedCategory?.name);
    console.log("✅ Filtered products:", categoryProducts.length);

    return {
      category: matchedCategory || null,
      products: categoryProducts || [],
    };
  } catch (err) {
    console.error("❌ Fatal fetch error:", err.message);
    console.error("❌ Stack:", err.stack);
    return { category: null, products: [] };
  }
}

/* ===========================
   ✅ Dynamic SEO Metadata
   =========================== */
export async function generateMetadata({ params }) {
  const { coursename } = params;
  const { category } = await fetchCategoryData(coursename);

  if (!category) {
    return {
      title: `${coursename.toUpperCase()} Exam Dumps | DumpsXpert`,
      description: `Explore verified ${coursename} dumps and practice tests at DumpsXpert.`,
      keywords: `${coursename}, ${coursename} exam dumps, ${coursename} certification`,
    };
  }

  return {
    title:
      category.metaTitle || `${category.name} Exam Dumps 2025 | DumpsXpert`,
    description:
      category.metaDescription ||
      `Get the latest ${category.name} certification exam dumps, questions, and practice tests.`,
    keywords:
      category.metaKeywords ||
      `${category.name}, ${category.name} dumps, ${category.name} questions, certification`,
    openGraph: {
      title: category.metaTitle || `${category.name} Dumps | DumpsXpert`,
      description:
        category.metaDescription ||
        `Get verified ${category.name} exam dumps and practice materials.`,
      images: [category.image || "/default-og.jpg"],
      url: `/itcertifications/${coursename}`,
    },
    twitter: {
      card: "summary_large_image",
      title: category.metaTitle || `${category.name} Dumps | DumpsXpert`,
      description:
        category.metaDescription ||
        `Prepare for ${category.name} with authentic dumps and questions.`,
      images: [category.image || "/default-og.jpg"],
    },
  };
}

/* ===========================
   ✅ FAQ Accordion Component - Optimized
   =========================== */
function FAQSection({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="my-5 sm:my-6 md:my-7 shadow-md rounded-xl border border-gray-200 p-3.5 sm:p-4 md:p-5 bg-white">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3.5 sm:mb-4 md:mb-5 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={faq._id || index}
            className="group border border-gray-200 rounded-lg md:rounded-xl overflow-hidden transition-all hover:shadow-sm"
          >
            <summary className="cursor-pointer p-3 sm:p-3.5 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center gap-2.5 sm:gap-3">
              <span className="font-semibold text-gray-800 text-[13px] sm:text-sm md:text-base leading-snug">
                {faq.question}
              </span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform group-open:rotate-180 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="p-3 sm:p-3.5 md:p-4 bg-white border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed text-[13px] sm:text-sm md:text-base">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   ✅ Main Page Component - Fully Optimized
   =========================== */
export default async function CategoryPage({ params, searchParams }) {
  const { coursename } = params;
  const { category, products } = await fetchCategoryData(coursename);
  const searchTerm = searchParams?.q?.toLowerCase() || "";

  // ✅ Filter products based on search term
  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm) ||
      p.sapExamCode?.toLowerCase().includes(searchTerm),
  );

  // ✅ Price formatter with thousand grouping
  const formatPrice = (value, symbol = "₹") => {
    const num = Number((value || "").toString().replace(/[,\s]/g, ""));
    if (!Number.isFinite(num)) return "NA";
    return `${symbol}${num.toLocaleString("en-IN")}`;
  };

  // ✅ Sort products alphabetically by exam code
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const codeA = (a.sapExamCode || "").toLowerCase();
    const codeB = (b.sapExamCode || "").toLowerCase();
    return codeA.localeCompare(codeB);
  });

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 pb-5 sm:pb-6 md:pb-8 bg-gray-50">
      {/* Breadcrumbs - Compact */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 md:px-6 lg:px-8 mb-2.5 sm:mb-3 md:mb-4">
        <Breadcrumbs />
      </div>

      <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-4 md:px-6 lg:px-8">
        {/* ✅ Category Info - Tighter Spacing */}
        {category && (
          <div className="mb-4 sm:mb-5 md:mb-6 shadow-md rounded-xl border border-gray-200 p-3.5 sm:p-4 md:p-5 bg-white">
            <h1 className="text-[19px] sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-2.5 md:mb-3 leading-tight">
              {category.name.toUpperCase()} Exam Dumps [2025]
            </h1>
            {category.description && (
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-700 [&>*]:mb-1.5 [&>*]:sm:mb-2 [&>*:last-child]:mb-0 [&>p]:text-[13px] [&>p]:sm:text-sm [&>p]:md:text-base [&>p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}
          </div>
        )}

        {/* ✅ No category fallback - Tighter */}
        {!category && (
          <div className="mb-4 sm:mb-5 md:mb-6 shadow-md rounded-xl border border-gray-200 p-3.5 sm:p-4 md:p-5 bg-white">
            <h1 className="text-[19px] sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-2.5 leading-tight">
              {coursename.toUpperCase()} Exam Dumps [2025]
            </h1>
            <p className="text-gray-700 text-[13px] sm:text-sm md:text-base leading-relaxed">
              Explore verified {coursename.toUpperCase()} exam dumps and
              practice tests.
            </p>
          </div>
        )}

        {/* ✅ Search + Results - Compact & Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 md:gap-4 mb-3.5 sm:mb-4 md:mb-5">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 order-2 sm:order-1 font-medium">
            Showing {sortedProducts.length} result
            {sortedProducts.length !== 1 ? "s" : ""}
            {searchTerm && ` for "${searchTerm}"`}
          </p>

          <form
            method="get"
            className="flex items-center border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto sm:min-w-[260px] md:min-w-[300px] lg:min-w-[340px] bg-white overflow-hidden order-1 sm:order-2"
          >
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search Exam Code or Name"
              className="w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-base sm:text-lg transition-colors flex-shrink-0"
              aria-label="Search"
            >
              🔍
            </button>
          </form>
        </div>

        {/* ✅ Products List - Responsive */}
        {sortedProducts.length > 0 ? (
          <>
            <ProductsList products={sortedProducts} coursename={coursename} />

            {/* ✅ Bottom Category Description - Compact */}
            {category && category.descriptionBelow && (
              <div className="my-5 sm:my-6 md:my-7 shadow-md rounded-xl border border-gray-200 p-3.5 sm:p-4 md:p-5 bg-white">
                {category.image && (
                  <div className="relative w-full h-36 sm:h-44 md:h-56 lg:h-64 mb-3 sm:mb-4">
                    <ImageWithSkeleton
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-contain rounded-lg shadow"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 800px"
                      quality={75}
                      skeletonClassName="rounded-lg md:rounded-xl"
                    />
                  </div>
                )}
                <div
                  className="prose prose-sm sm:prose-base max-w-none text-gray-700 [&>*]:mb-2 [&>*]:sm:mb-2.5 [&>*:last-child]:mb-0 [&>h1]:text-lg [&>h1]:sm:text-xl [&>h1]:md:text-2xl [&>h2]:text-base [&>h2]:sm:text-lg [&>h2]:md:text-xl [&>h3]:text-sm [&>h3]:sm:text-base [&>h3]:md:text-lg [&>p]:text-[13px] [&>p]:sm:text-sm [&>p]:md:text-base [&>p]:leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: category.descriptionBelow,
                  }}
                />
              </div>
            )}

            {/* ✅ FAQ Section */}
            {category && category.faqs && category.faqs.length > 0 && (
              <FAQSection faqs={category.faqs} />
            )}
          </>
        ) : (
          <div className="text-center py-10 sm:py-12 md:py-14 bg-white rounded-xl shadow-md border border-gray-200 px-4">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2">
                {searchTerm
                  ? `No products found for "${searchTerm}"`
                  : "No products available"}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                {searchTerm
                  ? "Try a different search term"
                  : "Please check back later or try a different category"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
