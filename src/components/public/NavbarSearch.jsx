'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavbarSearch({ hideOnLarge = false }) {
  const [mounted, setMounted] = useState(false); // for hydration fix
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setMounted(true); // only render on client
  }, []);

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
    if (query.length > 0) {
      setLoading(true);
      fetch(`/api/products?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.data || []);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
      setSearched(false);
    }
  }, [query]);

  if (!mounted) return null; // prevents SSR mismatch

  // Mobile Search with Results
  if (hideOnLarge) {
    return (
      <div className="relative w-full">
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

        <div className="max-h-[50vh] overflow-y-auto">
          {!searched && query.length === 0 && (
            <p className="text-gray-500 text-base font-medium text-center">
              Start typing to see products you are looking for.
            </p>
          )}

          {loading && (
            <p className="text-gray-500 text-center">Loading...</p>
          )}

          {!loading && searched && products.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <Link href={`/ItDumps/${product.category}/by-slug/${product.slug}`} key={product._id}>
                  <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    <p className="text-gray-600 text-sm">{product.sapExamCode}</p>
                  </div>
                </Link>
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

  // Desktop Search Panel
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
        className={`fixed inset-x-0 bottom-0 h-[90vh] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        flex flex-col items-center overflow-y-auto`}
      >
        {/* Input Section */}
        <div className="relative w-full flex justify-center mb-6">
          <div className="relative w-full">
            <label
              htmlFor="search"
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[48px] font-bold text-black pointer-events-none transition-opacity duration-200 ${
                query ? "opacity-0" : "opacity-100"
              }`}
            >
              Search for products
            </label>

            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder=""
              style={{ fontSize: "48px" }}
              className="h-28 font-bold px-20 w-full border-0 border-b-2 border-gray-400 bg-transparent rounded-none outline-none focus:outline-none focus:ring-0 placeholder:text-transparent text-center"
            />

            {query.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-6 h-6 text-gray-600 hover:text-black cursor-pointer" />
              </button>
            )}
          </div>
        </div>

        {!searched && (
          <p className="mb-6 text-gray-500 text-base font-medium text-center">
            Start typing to see products you are looking for.
          </p>
        )}

        {loading && (
          <p className="mt-6 text-gray-500 text-center">Loading...</p>
        )}

        {!loading && searched && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 w-full max-w-6xl cursor-pointer">
            {products.map((product) => (
              <Link href={`/ItDumps/${product.category}/by-slug/${product.slug}`} key={product._id}>
                <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-gray-600 text-sm">{product.sapExamCode}</p>
                </div>
              </Link>
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
