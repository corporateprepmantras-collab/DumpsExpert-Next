"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();

    // Listen for custom event when returning from add/edit page
    const handleRefresh = () => {
      fetchProducts();
      setSuccessMessage("Product updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    };

    window.addEventListener("refreshProducts", handleRefresh);
    return () => window.removeEventListener("refreshProducts", handleRefresh);
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/products");
      setProducts(res.data.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products?id=${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSuccessMessage("Product deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete product");
      console.error(err);
      setDeleteConfirm(null);
    }
  };

  // Get unique categories and statuses
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const statuses = [...new Set(products.map((p) => p.status).filter(Boolean))];

  // Enhanced search with filters
  const filtered = products.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.title?.toLowerCase().includes(searchLower) ||
      p.sapExamCode?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower) ||
      p.sku?.toLowerCase().includes(searchLower) ||
      p.status?.toLowerCase().includes(searchLower);

    const matchesCategory =
      !selectedCategory || p.category === selectedCategory;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen pt-16 pb-4 w-full">
      <div className="w-full max-w-full px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-row md:flex-row justify-between items-start gap-2 mb-2">
          <h2 className="text-lg font-bold text-gray-800">Products</h2>

          <div className="flex flex-row items-center gap-1.5 w-full md:w-auto flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded text-xs font-medium bg-white hover:border-gray-400 transition"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded text-xs font-medium bg-white hover:border-gray-400 transition"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Enhanced Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 pl-6 pr-2 py-1 rounded text-xs font-medium hover:border-gray-400 transition w-40"
              />
              <svg
                className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => router.push("/dashboard/admin/product/list/add")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition font-semibold flex items-center gap-1 whitespace-nowrap text-xs"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-2 bg-green-50 border border-green-400 text-green-700 px-3 py-1.5 rounded text-sm relative flex items-center">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="block sm:inline">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="absolute top-0 bottom-0 right-0 px-2 py-1 hover:text-green-900"
            >
              <span className="text-lg">&times;</span>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-2 bg-red-50 border border-red-400 text-red-700 px-3 py-1.5 rounded text-sm relative flex items-center">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError("")}
              className="absolute top-0 bottom-0 right-0 px-2 py-1 hover:text-red-900"
            >
              <span className="text-lg">&times;</span>
            </button>
          </div>
        )}

        {/* Search Results Info */}
        {(search || selectedCategory || selectedStatus) && (
          <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded p-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Found <span className="text-blue-600">{filtered.length}</span>{" "}
                  product{filtered.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-600 mt-0">
                  {selectedCategory && (
                    <span className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2 text-xs font-medium">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded mr-2 text-xs font-medium">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {search && (
                    <span className="inline-block bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      Search: "{search}"
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSelectedStatus("");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold transition text-xs whitespace-nowrap"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-3">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Confirm Delete
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded shadow overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-max">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    #
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Image
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Exam Code
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Title
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Price (INR)
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Category
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Status
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Publish Status
                  </th>
                  <th className="p-1.5 text-left font-semibold text-gray-700 text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-gray-500 text-sm">
                          Loading products...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">
                          {search
                            ? "No products found matching your search"
                            : "No products found"}
                        </p>
                        {!search && (
                          <button
                            onClick={() =>
                              router.push("/dashboard/admin/product/list/add")
                            }
                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-xs"
                          >
                            Add Your First Product
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product, i) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-1.5 text-gray-600">{i + 1}</td>
                      <td className="p-1.5">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.title}
                          className="h-10 w-10 object-cover rounded border border-gray-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <span className="font-mono text-blue-600 font-semibold text-xs">
                          {product.sapExamCode || "N/A"}
                        </span>
                      </td>
                      <td className="p-1.5">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 truncate text-xs">
                            {product.title}
                          </p>
                          {product.sku && (
                            <p className="text-xs text-gray-500">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-1.5">
                        <span className="font-semibold text-gray-800 text-xs">
                          ₹{product.dumpsPriceInr || "0"}
                        </span>
                        {product.dumpsMrpInr &&
                          product.dumpsMrpInr > product.dumpsPriceInr && (
                            <span className="text-xs text-gray-500 line-through ml-1">
                              ₹{product.dumpsMrpInr}
                            </span>
                          )}
                      </td>
                      <td className="p-1.5">
                        <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-1.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full mr-1 ${
                              product.status === "active"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></span>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-1.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            product.publishStatus === "published"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {product.publishStatus === "published"
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>
                      <td className="p-1.5">
                        <div className="flex flex-wrap gap-0.5">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/product/list/edit/${product._id}`,
                              )
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                            title="Edit Product"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                            title="Delete Product"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/product/${product._id}/faq`,
                              )
                            }
                            className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 transition"
                            title="Manage FAQs"
                          >
                            FAQ
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/product/reviews/${product._id}`,
                              )
                            }
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition"
                            title="Manage Reviews"
                          >
                            Reviews
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
