"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Breadcrumbs from "@/components/public/Breadcrumbs";

export default function CategoryPage() {
  const params = useParams();
  const coursename = params?.coursename || ""; // category slug or name from URL
  const [searchTerm, setSearchTerm] = useState("");
  const [showFullText, setShowFullText] = useState(false);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products & category
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get("/api/products"),
          axios.get("/api/product-categories"),
        ]);

        setProducts(prodRes.data.data || []);

        // Match category by slug or name
        const matchedCategory = catRes.data.find(
          (c) =>
            c.slug?.toLowerCase() === coursename.toLowerCase() ||
            c.name?.toLowerCase() === coursename.toLowerCase()
        );
        setCategory(matchedCategory || null);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [coursename]);

  // Filter products by category
  const categoryProducts = useMemo(() => {
    return products.filter(
      (p) => p.category?.toLowerCase() === coursename.toLowerCase()
    );
  }, [products, coursename]);

  // Search filter
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sapExamCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryProducts, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-10 bg-gray-100">
      <div className="max-w-5xl mx-auto mb-6">
        <Breadcrumbs />
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {/* ✅ Category Meta Info */}
        {category && (
          <div className="mb-8 shadow rounded-lg border p-6">
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

        {/* ✅ Products List */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} results
          </p>
          <div className="flex items-center border  rounded-md  shadow-sm w-full sm:w-[400px]">
            <input
              type="text"
              placeholder="Search Exam Code or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm focus:outline-none"
              aria-label="Search exam code or name"
            />
            <span className="px-4 text-gray-500">🔍</span>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto  shadow rounded-lg border ">
              <table className="min-w-full text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                  <tr>
                    <th className="px-4 py-3">{coursename} Exam Code</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 min-w-60 py-3">Price</th>
                    <th className=" min-w-40 px-4 py-3">Details</th>
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
                        <span className="font-semibold">
                          ₹{product.dumpsPriceInr.trim()} (${product.dumpsPriceUsd})
                        </span>
                        <span className="block text-xs line-through text-gray-500">
                          ₹{product.dumpsMrpInr.trim()} (${product.dumpsMrpUsd})
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
  {category && (
          <div className="mb-8 shadow rounded-lg border border-gray-200 p-6">
            

            {/* Category Image */}
            {category.image && (
              <div className="mb-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="max-h-64 rounded-lg shadow"
                />
              </div>
            )}

            {/* Description */}
            {category.description && (
              <div
                className="prose max-w-none text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}

            {/* Description Below */}
            {category.descriptionBelow && (
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: category.descriptionBelow }}
              />
            )}

          </div>
        )}
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col items-center gap-6 mt-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="relative w-full max-w-sm rounded-xl shadow border border-gray-200 p-5"
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
                      ₹{product.dumpsPriceInr.trim()} (${product.dumpsPriceUsd})
                    </p>
                    <p className="text-xs line-through text-gray-500">
                      ₹{product.dumpsMrpInr.trim()} (${product.dumpsMrpUsd})
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link
                      href={`/ItDumps/${coursename}/by-slug/${product.slug}`}
                      className="block min-w-40 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm text-center py-2 rounded-md shadow"
                    >
                      See Details
                    </Link>
                  </div>
                  <div className="h-10" />
                </div>
              ))}
            </div>
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
