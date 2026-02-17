"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProductsList({ products, coursename }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Price formatter with thousand grouping
  const formatPrice = (value, symbol = "₹") => {
    const num = Number((value || "").toString().replace(/[,\s]/g, ""));
    if (!Number.isFinite(num)) return "NA";
    return `${symbol}${num.toLocaleString("en-IN")}`;
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show skeleton or nothing during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200 bg-white">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="group relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-50 to-transparent rounded-tr-full opacity-50"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Exam Code Badge */}
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                  <svg
                    className="w-3 h-3 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {product.sapExamCode}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4 text-center">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                  {product.title}
                </h3>
              </div>

              {/* Pricing Section */}
              <div className="mb-5 text-center">
                <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs text-green-700 font-medium mb-1">
                    Starting Price
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(product.dumpsPriceInr?.trim(), "₹")}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatPrice(product.dumpsPriceUsd, "$")}
                    </span>
                  </div>
                  {product.dumpsMrpInr && (
                    <p className="text-xs line-through text-gray-400">
                      MRP: {formatPrice(product.dumpsMrpInr?.trim(), "₹")}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="w-full">
                <Link
                  href={`/itcertifications/${coursename}/${product.slug}`}
                  className="block w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-red-600 hover:to-red-600 text-white text-sm font-bold text-center py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Details
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-gray-800 text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 font-semibold">{coursename} Exam Code</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold text-right">Price</th>
            <th className="px-4 py-3 font-semibold text-center w-36">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product._id}
              className="border-t border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <td className="px-4 py-3 font-semibold text-blue-700 whitespace-nowrap">
                {product.sapExamCode}
              </td>
              <td className="px-4 py-3 align-top">
                <span className="line-clamp-2">{product.title}</span>
              </td>
              <td className="px-4 py-3 text-right align-top space-y-1 whitespace-nowrap">
                <span className="block font-bold gap-1 text-green-600 text-base">
                  {formatPrice(product.dumpsPriceInr?.trim(), "₹")} /
                  {formatPrice(product.dumpsPriceUsd, "$")}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <Link
                  href={`/itcertifications/${coursename}/${product.slug}`}
                  className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-lg shadow-sm font-semibold transition-all text-xs hover:shadow-md"
                >
                  See Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
