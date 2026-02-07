"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [productsCache, setProductsCache] = useState({}); // Cache for product details

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    applyFilters();
    setSelectedReviews([]);
  }, [filterStatus, startDate, endDate, reviews]);

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by status (case-insensitive)
    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => {
        const reviewStatus = (r.status || "").toLowerCase();
        const filterValue = filterStatus.toLowerCase();
        return reviewStatus === filterValue;
      });
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((r) => {
        const reviewDate = new Date(r.createdAt || r.date);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => {
        const reviewDate = new Date(r.createdAt || r.date);
        return reviewDate <= end;
      });
    }

    setFilteredReviews(filtered);
  };

  const fetchAllReviews = async () => {
    try {
      const res = await axios.get("/api/reviews");
      const reviewsData = res.data.data || [];
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);

      // Fetch product details for all reviews
      await fetchProductDetails(reviewsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (reviewsData) => {
    const productIds = [
      ...new Set(
        reviewsData.map((r) => r.productId || r.product).filter(Boolean),
      ),
    ];

    const newProductsCache = { ...productsCache };

    for (const productId of productIds) {
      // Skip if already cached
      if (newProductsCache[productId]) continue;

      try {
        const res = await axios.get(`/api/products?id=${productId}`);
        if (res.data.data) {
          newProductsCache[productId] = res.data.data;
        }
      } catch (err) {
        console.error(`Failed to fetch product ${productId}:`, err);
        newProductsCache[productId] = null;
      }
    }

    setProductsCache(newProductsCache);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await axios.put(`/api/reviews/${reviewId}`, { status: newStatus });
      toast.success(`Review ${newStatus.toLowerCase()} successfully!`);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      console.log("Deleting review:", reviewId);
      const response = await axios.delete(`/api/reviews/${reviewId}`);
      console.log("Delete response:", response.data);
      toast.success("Review deleted successfully!");
      fetchAllReviews();
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete review";
      toast.error(`Delete failed: ${errorMessage}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to delete");
      return;
    }
    if (!confirm(`Delete ${selectedReviews.length} selected review(s)?`))
      return;

    try {
      console.log("Bulk deleting reviews:", selectedReviews);
      const results = await Promise.allSettled(
        selectedReviews.map((id) => axios.delete(`/api/reviews/${id}`)),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log(
        `Bulk delete results: ${successful} successful, ${failed} failed`,
      );

      if (failed > 0) {
        toast.warning(
          `${successful} review(s) deleted successfully, ${failed} failed`,
        );
      } else {
        toast.success(
          `${selectedReviews.length} review(s) deleted successfully!`,
        );
      }

      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error("Bulk delete error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Error deleting reviews";
      toast.error(`Bulk delete failed: ${errorMessage}`);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to publish");
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map((id) =>
          axios.put(`/api/reviews/${id}`, { status: "Publish" }),
        ),
      );
      toast.success(
        `${selectedReviews.length} review(s) published successfully!`,
      );
      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Error publishing reviews");
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to unpublish");
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map((id) =>
          axios.put(`/api/reviews/${id}`, { status: "Pending" }),
        ),
      );
      toast.success(
        `${selectedReviews.length} review(s) unpublished successfully!`,
      );
      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Error unpublishing reviews");
    }
  };

  const toggleReviewSelection = (id) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map((r) => r._id));
    }
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Get exam code from product
  const getExamCode = (review) => {
    const productId = review.productId || review.product;

    // First check if productId is populated object (from API response)
    if (review.productId?.sapExamCode) {
      return review.productId.sapExamCode;
    }
    if (review.productId?.examCode) {
      return review.productId.examCode;
    }
    if (review.productId?.code) {
      return review.productId.code;
    }

    // Then check products cache (fetched from API)
    if (productId && productsCache[productId]) {
      const product = productsCache[productId];
      return product.sapExamCode || product.examCode || product.code || "N/A";
    }

    return "Nothing";
  };

  // Get product name
  const getProductName = (review) => {
    const productId = review.productId || review.product;

    // First check if productId is populated object
    if (review.productId?.title) {
      return review.productId.title;
    }
    if (review.productId?.name) {
      return review.productId.name;
    }

    // Then check products cache
    if (productId && productsCache[productId]) {
      const product = productsCache[productId];
      return product.title || product.name || "Product Deleted";
    }

    return "Product Deleted";
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">All Reviews</h2>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reviews</option>
              <option value="Publish">Published Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearDateFilters}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Clear Date Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(startDate || endDate || filterStatus !== "all") && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Active Filters:</span>
            {filterStatus !== "all" && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Status: {filterStatus}
              </span>
            )}
            {startDate && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                From: {new Date(startDate).toLocaleDateString()}
              </span>
            )}
            {endDate && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                To: {new Date(endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-blue-600">{reviews.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {
              reviews.filter(
                (r) => (r.status || "").toLowerCase() === "publish",
              ).length
            }
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {
              reviews.filter(
                (r) => (r.status || "").toLowerCase() === "pending",
              ).length
            }
          </p>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold">{filteredReviews.length}</span> of{" "}
          <span className="font-semibold">{reviews.length}</span> reviews
        </p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedReviews.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedReviews.length} review(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPublish}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Publish Selected
            </button>
            <button
              onClick={handleBulkUnpublish}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Unpublish Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedReviews([])}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">
                  <input
                    type="checkbox"
                    checked={
                      filteredReviews.length > 0 &&
                      selectedReviews.length === filteredReviews.length
                    }
                    onChange={toggleSelectAll}
                    className="cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="p-3 border text-left">#</th>
                <th className="p-3 border text-left">Exam Code</th>
                <th className="p-3 border text-left">Product Name</th>
                <th className="p-3 border text-left">Customer</th>
                <th className="p-3 border text-center">Rating</th>
                <th className="p-3 border text-left">Comment</th>
                <th className="p-3 border text-center">Date</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r, i) => (
                  <tr
                    key={r._id}
                    className={`hover:bg-gray-50 ${
                      selectedReviews.includes(r._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(r._id)}
                        onChange={() => toggleReviewSelection(r._id)}
                        className="cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">
                      <span className="font-semibold text-blue-600">
                        {getExamCode(r)}
                      </span>
                    </td>
                    <td className="p-3 border font-medium">
                      {getProductName(r)}
                    </td>
                    <td className="p-3 border font-medium">
                      {r.customer || r.name || "Anonymous"}
                    </td>
                    <td className="p-3 border text-center">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {r.rating}
                      </span>
                    </td>
                    <td className="p-3 border max-w-xs truncate">
                      {r.comment}
                    </td>
                    <td className="p-3 border text-center text-gray-600">
                      {new Date(r.createdAt || r.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-3 py-1 text-white rounded-full text-xs font-medium ${
                          (r.status || "").toLowerCase() === "publish"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        {(r.status || "").toLowerCase() === "pending" ? (
                          <button
                            onClick={() => handleStatusChange(r._id, "Publish")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(r._id, "Pending")}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Unpublish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-8 text-gray-500 border"
                  >
                    {filterStatus === "all" && !startDate && !endDate
                      ? "No reviews found."
                      : "No reviews match the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllReviews;
