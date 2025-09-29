"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setLoading(true);

    // if no query → get all products
    const url = query.length > 0
      ? `/api/products?q=${query}`
      : `/api/products`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setSearched(true);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const clearSearch = () => {
    setQuery("");
  };

  // 🟠 Product Card Component
  const ProductCard = ({ product }) => {
    const slug = encodeURIComponent(product.slug || product.title);
    return (
      <Link
        href={`/ItDumps/${product.category}/by-slug/${slug}`}
        className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
      >
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.title}
          className="h-40 w-full object-cover"
        />
        <div className="p-4 flex flex-col justify-between flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {product.sapExamCode || product.title}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.Description?.replace(/<[^>]+>/g, "") ||
              "No description available."}
          </p>
          <div className="mt-4">
            <p className="text-orange-500 font-bold">
              ₹{product.dumpsPriceInr?.trim() || "N/A"}
            </p>
            {product.dumpsMrpInr && (
              <p className="line-through text-sm text-gray-400">
                ₹{product.dumpsMrpInr}
              </p>
            )}
          </div>
          <span className="mt-4 bg-orange-500 text-white text-center font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition">
            View More
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="p-6 pt-20">
      {/* Search Input */}
      <div className="relative max-w-xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 pl-12 pr-12 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {query.length > 0 && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages & Results */}
      {loading && (
        <p className="text-gray-500 text-center">Loading...</p>
      )}

      {!loading && searched && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && searched && products.length === 0 && (
        <p className="text-red-500 text-lg text-center">
          No products found.
        </p>
      )}
    </div>
  );
}
