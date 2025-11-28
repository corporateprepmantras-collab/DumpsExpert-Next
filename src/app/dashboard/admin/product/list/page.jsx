"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Added success message state
  const [deleteConfirm, setDeleteConfirm] = useState(null); // For custom delete modal
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

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 pt-20 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-1 rounded"
          />
          <button
            onClick={() => router.push("/dashboard/admin/product/list/add")}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError("")}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((product, i) => (
                <tr key={product._id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-12 w-12 object-cover mx-auto rounded"
                    />
                  </td>
                  <td className="p-2 border">{product.title}</td>
                  <td className="p-2 border">₹{product.dumpsPriceInr}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 text-white text-xs rounded ${
                        product.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-2 border space-x-1">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/product/list/edit/${product._id}`
                        )
                      }
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product._id)}
                      className="bg-pink-500 text-white px-2 py-1 rounded text-xs hover:bg-pink-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/product/${product._id}/faq`
                        )
                      }
                      className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                    >
                      Manage FAQ
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/product/reviews/${product._id}`
                        )
                      }
                      className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                    >
                      Manage Reviews
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
