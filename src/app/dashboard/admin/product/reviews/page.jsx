"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      const res = await axios.get("/api/reviews"); // No productId -> get all
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-xl font-semibold mb-4">All Reviews</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Product ID</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Rating</th>
              <th className="p-2 border">Comment</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <tr key={r._id} className="text-center">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{r.productId}</td>
                  <td className="p-2 border">{r.customer}</td>
                  <td className="p-2 border">{r.rating}</td>
                  <td className="p-2 border">{r.comment}</td>
                  <td className="p-2 border">
                    {new Date(r.createdAt).toLocaleDateString()}
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllReviews;
