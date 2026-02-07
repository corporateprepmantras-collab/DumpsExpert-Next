"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavbarSearch({ hideOnLarge = false }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleSearch = () => {
    setIsOpen((prev) => !prev);
    setQuery("");
    setProducts([]);
    setSearched(false);
  };

  const clearSearch = () => {
    setQuery("");
    setProducts([]);
    setSearched(false);
  };

  useEffect(() => {
    if (!mounted) return;

    setLoading(true);

    // if query is empty → fetch all products
    const url = query.length > 0 ? `/api/products?q=${query}` : `/api/products`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setSearched(true);
      })
      .finally(() => setLoading(false));
  }, [query, mounted]);

  if (!mounted) return null;
  // 🟠 Product Card
  const ProductCard = ({ product }) => {
    const slug = encodeURIComponent(product.slug || product.title);
    return (
      <Link
        href={`/ItDumps/${product.category}/${slug}`}
        className="group bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-300"
      >
        <div className="relative h-48 bg-gradient-to-br from-orange-50 to-blue-50 overflow-hidden">
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.title}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
          {product.dumpsMrpInr &&
            product.dumpsMrpInr > product.dumpsPriceInr && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Save{" "}
                {Math.round(
                  ((product.dumpsMrpInr - product.dumpsPriceInr) /
                    product.dumpsMrpInr) *
                    100,
                )}
                %
              </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.sapExamCode || product.title}
          </h3>
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-grow">
            {product.Description?.replace(/<[^>]+>/g, "") ||
              "Comprehensive exam preparation material with real practice questions."}
          </p>
          <div className="border-t pt-3 mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-orange-500">
                ₹{product.dumpsPriceInr?.trim() || "N/A"}
              </span>
              <span className="text-sm font-semibold text-orange-500">
                ${product.dumpsPriceUsd?.trim() || "N/A"}
              </span>
            </div>
            {product.dumpsMrpInr &&
              product.dumpsMrpInr > product.dumpsPriceInr && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="line-through text-gray-400">
                    ₹{product.dumpsMrpInr}
                  </span>
                  <span className="line-through text-gray-400">
                    ${product.dumpsMrpUsd}
                  </span>
                </div>
              )}
          </div>
          <button className="mt-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-2.5 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md group-hover:shadow-lg text-sm">
            View Details →
          </button>
        </div>
      </Link>
    );
  };

  // 🔹 Mobile version
  if (hideOnLarge) {
    return (
      <div className="relative w-full">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search exams, certifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <Search size={20} />
          </div>
          {query.length > 0 && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto overflow-x-hidden">
          {!searched && query.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-medium">
                Start typing to search for exam dumps
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Try "SAP", "AWS", "Azure" or any exam code
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-sm">Searching...</p>
            </div>
          )}

          {!loading && searched && products.length > 0 && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 px-3 py-2 rounded-lg mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  Found{" "}
                  <span className="text-orange-600">{products.length}</span>{" "}
                  result{products.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {!loading && searched && products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 text-lg font-semibold mb-2">
                No products found
              </p>
              <p className="text-gray-500 text-sm">
                Try different keywords or browse our categories
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🔹 Desktop version
  return (
    <div className="relative z-50">
      <Button
        variant="ghost"
        onClick={toggleSearch}
        className="rounded-full cursor-pointer"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </Button>

      {/* Slide-up Panel */}
      <div
        className={`fixed inset-x-0 bottom-0 top-14 h-[100vh] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        flex flex-col items-center overflow-y-auto`}
      >
        {/* Input Section */}
        <div className="relative pt-20 w-full flex justify-center mb-6 px-4">
          <div className="relative w-full max-w-2xl">
            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for exam dumps, certifications..."
              className="w-full py-4 pl-14 pr-14 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-lg transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            {query.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Searching products...</p>
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-600 text-xl font-bold mb-3">
              No products found
            </p>
            <p className="text-gray-500 text-base">
              Try different keywords or check the spelling
            </p>
          </div>
        )}

        {!loading && searched && products.length > 0 && (
          <div className="w-full max-w-7xl px-4">
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 px-6 py-3 rounded-lg mb-6 shadow-sm">
              <p className="text-base font-bold text-gray-800">
                Found <span className="text-orange-600">{products.length}</span>{" "}
                exam{products.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
