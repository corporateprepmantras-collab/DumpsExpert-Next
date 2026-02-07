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
      <div className="flex flex-col items-center gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="relative w-full rounded-xl shadow-md border border-gray-200 p-4 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="mb-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Exam Code</p>
              <p className="text-base font-bold text-blue-700">
                {product.sapExamCode}
              </p>
            </div>
            <div className="mb-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {product.title}
              </p>
            </div>
            <div className="mb-4 text-center space-y-1">
              <p className="text-xs text-gray-500">Starting at:</p>
              <p className="text-green-600 font-bold text-base">
                {formatPrice(product.dumpsPriceInr?.trim(), "₹")}
              </p>
              <p className="text-xs text-gray-600">
                {formatPrice(product.dumpsPriceUsd, "$")}
              </p>
              {product.dumpsMrpInr && (
                <p className="text-xs line-through text-gray-400">
                  {formatPrice(product.dumpsMrpInr?.trim(), "₹")}
                </p>
              )}
            </div>
            <div className="w-full">
              <Link
                href={`/ItDumps/${coursename}/${product.slug}`}
                className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm text-center py-2.5 rounded-lg shadow-sm transition-all font-semibold"
              >
                See Details
              </Link>
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
                  href={`/ItDumps/${coursename}/${product.slug}`}
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
