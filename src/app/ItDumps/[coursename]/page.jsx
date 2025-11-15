import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/public/Breadcrumbs";

/* ===========================
   ✅ Fetch category + products with graceful fallback
   =========================== */
async function fetchCategoryData(coursename) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    console.log("🔍 Fetching from:", `${baseUrl}/api/products`);

    const [prodRes, catRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, {
        next: { revalidate: 60 },
        cache: "no-store",
      }).catch((err) => {
        console.error("❌ Products fetch failed:", err.message);
        return null;
      }),
      fetch(`${baseUrl}/api/product-categories`, {
        next: { revalidate: 60 },
        cache: "no-store",
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
          text.substring(0, 200)
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
        c.name?.toLowerCase() === coursename.toLowerCase()
    );

    const categoryProducts = products.filter(
      (p) =>
        p.category?.toLowerCase().replace(/\s+/g, "-") ===
        coursename.toLowerCase()
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
      url: `https://prepmantras.com/ItDumps/${coursename}`,
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
   ✅ Main Page Component
   =========================== */
export default async function CategoryPage({ params, searchParams }) {
  const { coursename } = params;
  const { category, products } = await fetchCategoryData(coursename);
  const searchTerm = searchParams?.q?.toLowerCase() || "";

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm) ||
      p.sapExamCode?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-10 bg-gray-100">
      <div className="max-w-5xl mx-auto mb-6">
        <Breadcrumbs />
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {/* ✅ Category Info */}
        {category && (
          <div className="mb-8 shadow rounded-lg border p-6 bg-white">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-4">
              {category.name.toUpperCase()} Exam Dumps [2025]
            </h1>
            {category.description && (
              <div
                className="prose max-w-none text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}
          </div>
        )}

        {/* ✅ No category fallback */}
        {!category && (
          <div className="mb-8 shadow rounded-lg border p-6 bg-white">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-4">
              {coursename.toUpperCase()} Exam Dumps [2025]
            </h1>
            <p className="text-gray-700">
              Explore verified {coursename.toUpperCase()} exam dumps and
              practice tests.
            </p>
          </div>
        )}

        {/* ✅ Search + Results */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} results
          </p>

          <form className="flex items-center border rounded-md shadow-sm w-full sm:w-[400px] bg-white">
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search Exam Code or Name"
              className="w-full px-4 py-2 text-sm focus:outline-none rounded-l-md"
            />
            <button
              type="submit"
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              🔍
            </button>
          </form>
        </div>

        {/* ✅ Desktop Table */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="hidden md:block overflow-x-auto shadow rounded-lg border bg-white">
              <table className="min-w-full text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                  <tr>
                    <th className="px-4 py-3">{coursename} Exam Code</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-900">
                        {product.sapExamCode}
                      </td>
                      <td className="px-4 py-3">{product.title}</td>
                      <td className="px-4 py-3">
                        <span className="block text-xs text-gray-600">
                          Starting at:
                        </span>
                        <span className="font-semibold text-green-700">
                          ₹{product.dumpsPriceInr?.trim()} ($
                          {product.dumpsPriceUsd})
                        </span>
                        <span className="block text-xs line-through text-gray-500">
                          ₹{product.dumpsMrpInr?.trim()} (${product.dumpsMrpUsd}
                          )
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/ItDumps/${coursename}/by-slug/${product.slug}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-sm transition"
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
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="relative w-full max-w-sm rounded-xl shadow border border-gray-200 p-5 bg-white"
                >
                  <div className="mb-2 text-center">
                    <p className="text-sm text-gray-600">Exam Code</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {product.sapExamCode}
                    </p>
                  </div>
                  <div className="mb-2 text-center">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-base font-medium">{product.title}</p>
                  </div>
                  <div className="mb-2 text-center">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-black font-semibold">
                      ₹{product.dumpsPriceInr?.trim()} (${product.dumpsPriceUsd}
                      )
                    </p>
                    <p className="text-xs line-through text-gray-500">
                      ₹{product.dumpsMrpInr?.trim()} (${product.dumpsMrpUsd})
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link
                      href={`/ItDumps/${coursename}/by-slug/${product.slug}`}
                      className="block bg-orange-500 hover:bg-orange-600 text-white text-sm text-center py-2 rounded-md shadow transition"
                    >
                      See Details
                    </Link>
                  </div>
                  <div className="h-10" />
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
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow border">
            <p className="text-gray-500 text-lg mb-2">
              No products available for this category.
            </p>
            <p className="text-gray-400 text-sm">
              Please check back later or try a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
