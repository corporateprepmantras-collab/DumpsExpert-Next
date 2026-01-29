import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/public/Breadcrumbs";

// Enable ISR for better performance
export const dynamic = "auto";
export const revalidate = 1800; // Revalidate every 30 minutes

/* ===========================
   ✅ Fetch category + products with graceful fallback
   =========================== */
async function fetchCategoryData(coursename) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    console.log("🔍 Fetching from:", `${baseUrl}/api/products`);

    const [prodRes, catRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, {
        next: { revalidate: 1800 },
      }).catch((err) => {
        console.error("❌ Products fetch failed:", err.message);
        return null;
      }),
      fetch(`${baseUrl}/api/product-categories`, {
        next: { revalidate: 1800 },
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
      url: `/ItDumps/${coursename}`,
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
   ✅ FAQ Accordion Component
   =========================== */
function FAQSection({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mb-8 shadow rounded-lg border border-gray-200 p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={faq._id || index}
            className="group border border-gray-200 rounded-lg overflow-hidden"
          >
            <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center">
              <span className="font-semibold text-gray-800 pr-4">
                {faq.question}
              </span>
              <svg
                className="w-5 h-5 text-gray-600 transition-transform group-open:rotate-180"
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
            <div className="p-4 bg-white border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   ✅ Main Page Component
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
    <div className="min-h-screen pt-24 pb-10 px-3 md:px-8 bg-gray-100">
      <div className="max-w-5xl mx-auto mb-4">
        <Breadcrumbs />
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {/* ✅ Category Info */}
        {category && (
          <div className="mb-6 shadow rounded-lg border p-5 bg-white">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              {category.name.toUpperCase()} Exam Dumps [2025]
            </h1>
            {category.description && (
              <div
                className="prose max-w-none text-gray-700 mb-3 text-sm"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}
          </div>
        )}

        {/* ✅ No category fallback */}
        {!category && (
          <div className="mb-6 shadow rounded-lg border p-5 bg-white">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              {coursename.toUpperCase()} Exam Dumps [2025]
            </h1>
            <p className="text-gray-700 text-sm">
              Explore verified {coursename.toUpperCase()} exam dumps and
              practice tests.
            </p>
          </div>
        )}

        {/* ✅ Search + Results */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
          <p className="text-xs text-gray-600">
            Showing {sortedProducts.length} results
            {searchTerm && ` for "${searchTerm}"`}
          </p>

          <form
            method="get"
            className="flex items-center border rounded-md shadow-sm w-full sm:w-[360px] bg-white"
          >
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search Exam Code or Name"
              className="w-full px-3 py-2 text-xs focus:outline-none rounded-l-md"
            />
            <button
              type="submit"
              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              🔍
            </button>
          </form>
        </div>

        {/* ✅ Desktop Table */}
        {sortedProducts.length > 0 ? (
          <>
            <div className="hidden md:block overflow-x-auto shadow rounded-lg border bg-white">
              <table className="min-w-full text-left text-gray-800 text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-3">{coursename} Exam Code</th>
                    <th className="px-3 py-3 w-36">Name</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3 w-36">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t hover:bg-gray-50 transition text-xs"
                    >
                      <td className="px-3 py-2 font-semibold text-blue-900 whitespace-nowrap">
                        {product.sapExamCode}
                      </td>
                      <td className="px-2 py-2 w-34 align-top truncate">
                        {product.title}
                      </td>
                      <td className="px-2 py-2 text-right align-top space-y-1 whitespace-nowrap">
                        <span className="block font-semibold text-green-700 text-sm">
                          {formatPrice(product.dumpsPriceInr?.trim(), "₹")}
                          <span className="text-[11px] text-gray-600">
                            {" "}
                            ( {formatPrice(product.dumpsPriceUsd, "$")})
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 w-36 min-w-[9rem]">
                        <Link
                          href={`/ItDumps/${coursename}/${product.slug}`}
                          className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-sm font-semibold transition text-xs"
                        >
                          See Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Mobile Cards */}
            <div className="md:hidden flex flex-col items-center gap-6 mt-6">
              {sortedProducts.map((product) => (
                <div
                  key={product._id}
                  className="relative w-full max-w-sm rounded-xl shadow border border-gray-200 p-4 bg-white text-sm"
                >
                  <div className="mb-2 text-center">
                    <p className="text-xs text-gray-600">Exam Code</p>
                    <p className="text-base font-semibold text-blue-900">
                      {product.sapExamCode}
                    </p>
                  </div>
                  <div className="mb-2 text-center">
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium">{product.title}</p>
                  </div>
                  <div className="mb-4 text-center space-y-1">
                    <p className="text-xs text-gray-600">Starting at:</p>
                    <p className="text-black font-semibold text-sm">
                      {formatPrice(product.dumpsPriceInr?.trim(), "₹")} (
                      {formatPrice(product.dumpsPriceUsd, "$")})
                    </p>
                    <p className="text-[11px] line-through text-gray-500">
                      {formatPrice(product.dumpsMrpInr?.trim(), "₹")} (
                      {formatPrice(product.dumpsMrpUsd, "$")})
                    </p>
                  </div>
                  <div className="w-full">
                    <Link
                      href={`/ItDumps/${coursename}/${product.slug}`}
                      className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-xs text-center py-2 rounded-md shadow transition"
                    >
                      See Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Bottom Category Description */}
            {category && category.descriptionBelow && (
              <div className="mb-8 shadow rounded-lg border border-gray-200 p-6 mt-10 bg-white">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-64 mb-4 rounded-lg shadow"
                  />
                )}
                <div
                  className="prose max-w-none text-gray-700"
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
          <div className="text-center py-16 bg-white rounded-lg shadow border">
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? `No products found for "${searchTerm}"`
                : "No products available for this category."}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Please check back later or try a different category."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
