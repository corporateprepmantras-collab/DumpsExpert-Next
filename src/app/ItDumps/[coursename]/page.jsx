import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/public/Breadcrumbs";

/* ===========================
   ✅ Fetch category + products
   =========================== */
async function fetchCategoryData(coursename) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com";

    const [prodRes, catRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/product-categories`, { next: { revalidate: 60 } }),
    ]);

    const prodData = await prodRes.json();
    const catData = await catRes.json();

    const products = Array.isArray(prodData.data) ? prodData.data : prodData;
    const categories = Array.isArray(catData.data) ? catData.data : catData;

    const matchedCategory = categories.find(
      (c) =>
        c.slug?.toLowerCase() === coursename.toLowerCase() ||
        c.name?.toLowerCase() === coursename.toLowerCase()
    );

    const categoryProducts = products.filter(
      (p) => p.category?.toLowerCase() === coursename.toLowerCase()
    );

    return {
      category: matchedCategory || null,
      products: categoryProducts || [],
    };
  } catch (err) {
    console.error("❌ Fetch error:", err);
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

        {/* ✅ Search + Results */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} results
          </p>

          <form className="flex items-center border rounded-md shadow-sm w-full sm:w-[400px]">
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search Exam Code or Name"
              className="w-full px-4 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="px-4 text-gray-500">
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
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-sm"
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
                      className="block bg-orange-500 hover:bg-orange-600 text-white text-sm text-center py-2 rounded-md shadow"
                    >
                      See Details
                    </Link>
                  </div>
                  <div className="h-10" />
                </div>
              ))}
            </div>

            {/* ✅ Bottom Category Description */}
            {category && (
              <div className="mb-8 shadow rounded-lg border border-gray-200 p-6 mt-10 bg-white">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-64 mb-4 rounded-lg shadow"
                  />
                )}
                {category.descriptionBelow && (
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: category.descriptionBelow,
                    }}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No products available for this category.
          </p>
        )}
      </div>
    </div>
  );
}
