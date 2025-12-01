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

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    // Filter reviews based on selected status
    if (filterStatus === "all") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.status === filterStatus));
    }
    // Clear selection when filter changes
    setSelectedReviews([]);
  }, [filterStatus, reviews]);

  const fetchAllReviews = async () => {
    try {
      const res = await axios.get("/api/reviews");
      setReviews(res.data.data || []);
      setFilteredReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
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
      await axios.delete(`/api/reviews/${reviewId}`);
      toast.success("Review deleted successfully!");
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to delete");
      return;
    }
    if (!confirm(`Delete ${selectedReviews.length} selected review(s)?`))
      return;

    try {
      await Promise.all(
        selectedReviews.map((id) => axios.delete(`/api/reviews/${id}`))
      );
      toast.success(
        `${selectedReviews.length} review(s) deleted successfully!`
      );
      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting reviews");
    }
  };

  // Bulk Publish
  const handleBulkPublish = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to publish");
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map((id) =>
          axios.put(`/api/reviews/${id}`, { status: "Publish" })
        )
      );
      toast.success(
        `${selectedReviews.length} review(s) published successfully!`
      );
      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Error publishing reviews");
    }
  };

  // Bulk Unpublish
  const handleBulkUnpublish = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to unpublish");
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map((id) =>
          axios.put(`/api/reviews/${id}`, { status: "Pending" })
        )
      );
      toast.success(
        `${selectedReviews.length} review(s) unpublished successfully!`
      );
      setSelectedReviews([]);
      fetchAllReviews();
    } catch (err) {
      console.error(err);
      toast.error("Error unpublishing reviews");
    }
  };

  // Toggle individual review selection
  const toggleReviewSelection = (id) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map((r) => r._id));
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">All Reviews</h2>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="Publish">Published Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
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
            {reviews.filter((r) => r.status === "Publish").length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reviews.filter((r) => r.status === "Pending").length}
          </p>
        </div>
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
                        {r.productId?.examCode || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 border font-medium">
                      {r.productId?.name || "Product Deleted"}
                    </td>
                    <td className="p-3 border font-medium">{r.customer}</td>
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
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-3 py-1 text-white rounded-full text-xs font-medium ${
                          r.status === "Publish"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        {r.status === "Pending" ? (
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
                    {filterStatus === "all"
                      ? "No reviews found."
                      : `No ${filterStatus.toLowerCase()} reviews found.`}
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
