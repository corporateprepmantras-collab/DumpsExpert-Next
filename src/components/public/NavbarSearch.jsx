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

  // 🔹 Mobile version
  if (hideOnLarge) {
    return (
      <div className="relative w-full ">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={20} />
          </div>
          {query.length > 0 && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!searched && query.length === 0 && (
            <p className="text-gray-500 text-base font-medium text-center">
              Start typing to see products you are looking for.
            </p>
          )}

          {loading && (
            <p className="text-gray-500 text-center">
              <div className="flex items-center justify-center h-screen">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            </p>
          )}

          {!loading && searched && products.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
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
          <div className="relative w-full max-w-xl">
            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
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
        </div>

        {!loading && searched && products.length === 0 && (
          <p className="text-red-500 mt-6 text-lg text-center">
            No products found.
          </p>
        )}

        {loading && (
          <p className="mt-6 text-gray-500 text-center">
            <div className="flex items-center justify-center h-screen">
              <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          </p>
        )}

        {!loading && searched && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 w-full max-w-6xl cursor-pointer">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <p className="text-red-500 mt-6 text-lg text-center">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
