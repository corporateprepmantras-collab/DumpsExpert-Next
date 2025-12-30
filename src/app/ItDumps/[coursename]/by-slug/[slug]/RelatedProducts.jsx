"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaShoppingCart } from "react-icons/fa";

async function fetchAllProducts() {
  try {
    const response = await fetch(`/api/products`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function RelatedProducts({ currentSlug, maxProducts = 10 }) {
  const router = useRouter();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const allProducts = await fetchAllProducts();
      // Filter out current product
      const filtered = allProducts.filter((p) => p.slug !== currentSlug);
      setRelatedProducts(filtered);
      setIsLoading(false);
    }

    if (currentSlug) {
      loadProducts();
    }
  }, [currentSlug]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Related Products
          </h2>
          <FaChevronRight className="text-gray-400 text-xl hidden md:block" />
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {relatedProducts.slice(0, maxProducts).map((product) => (
              <div
                key={product._id}
                className="min-w-[160px] max-w-[160px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all snap-start flex-shrink-0 cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}
              >
                <div className="p-3">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-2 mb-3">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-24 w-full object-contain"
                    />
                  </div>

                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[32px]">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-600">
                        ₹{product.dumpsPriceInr}
                      </p>
                      {product.dumpsMrpInr > product.dumpsPriceInr && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{product.dumpsMrpInr}
                        </p>
                      )}
                    </div>
                    <FaChevronRight className="text-blue-600 text-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(Math.min(3, relatedProducts.length))].map((_, i) => (
              <div key={i} className="h-1 w-8 bg-blue-200 rounded-full" />
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {relatedProducts.slice(0, maxProducts).map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => router.push(`/product/${product.slug}`)}
            >
              <div className="p-4">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 mb-3 group-hover:scale-105 transition-transform">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-32 w-full object-contain"
                  />
                </div>

                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-base font-bold text-blue-600">
                    ₹{product.dumpsPriceInr}
                  </p>
                  {product.dumpsMrpInr > product.dumpsPriceInr && (
                    <p className="text-xs text-gray-500 line-through">
                      ₹{product.dumpsMrpInr}
                    </p>
                  )}
                </div>

                {product.dumpsMrpInr > product.dumpsPriceInr && (
                  <div className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full mb-2">
                    {Math.round(
                      ((product.dumpsMrpInr - product.dumpsPriceInr) /
                        product.dumpsMrpInr) *
                        100
                    )}
                    % OFF
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product/${product.slug}`);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  <FaShoppingCart className="text-xs" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show more link */}
        {relatedProducts.length > maxProducts && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
            >
              View All Products
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}