"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

const ProductReviews = () => {
  const { id: productId } = useParams(); // productId from URL
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [form, setForm] = useState({
    customer: "",
    rating: "",
    comment: "",
    status: "Unpublish",
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/reviews?productId=${productId}`);
      setReviews(res.data.data || []);
      console.log(res.data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete review?")) return;
    await axios.delete(`/api/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editReview) {
        // Update review
        const res = await axios.put(`/api/reviews/${editReview._id}`, form);
        setReviews((prev) =>
          prev.map((r) => (r._id === editReview._id ? res.data.data : r))
        );
      } else {
        // Add new review
        const res = await axios.post(`/api/reviews`, {
          ...form,
          productId,
        });
        setReviews((prev) => [res.data.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (review = null) => {
    setEditReview(review);
    setForm(
      review
        ? {
            customer: review.customer,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
          }
        : { customer: "", rating: "", comment: "", status: "Unpublish" }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditReview(null);
    setForm({ customer: "", rating: "", comment: "", status: "Unpublish" });
  };

  const filteredReviews = reviews.filter((r) =>
    r.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Reviews</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          + Add Review
        </button>
      </div>

      <input
        type="text"
        placeholder="Search..."
        className="border px-3 py-1 mb-4 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Rating</th>
              <th className="p-2 border">Comment</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r, i) => (
              <tr key={r._id} className="text-center">
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{r.customer}</td>
                <td className="p-2 border">{r.rating}</td>
                <td className="p-2 border">{r.comment}</td>
                <td className="p-2 border">
                  {new Date(r.date).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 text-white rounded text-xs ${
                      r.status === "Publish"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-2 border space-x-1">
                  <button
                    onClick={() => openModal(r)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="bg-pink-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editReview ? "Edit Review" : "Add Review"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full border px-3 py-2 rounded"
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                className="w-full border px-3 py-2 rounded"
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: e.target.value })
                }
                min="1"
                max="5"
                required
              />
              <textarea
                placeholder="Comment"
                className="w-full border px-3 py-2 rounded"
                value={form.comment}
                onChange={(e) =>
                  setForm({ ...form, comment: e.target.value })
                }
                required
              />
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="Publish">Publish</option>
                <option value="Unpublish">Unpublish</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editReview ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
