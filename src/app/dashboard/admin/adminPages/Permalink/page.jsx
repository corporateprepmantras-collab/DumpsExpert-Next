"use client";

import React, { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const Permalink = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch permalinks
  const fetchPermalinks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/permalinks", { withCredentials: true });
      setPages(res.data || []);
    } catch (error) {
      console.error("Failed to load permalinks:", error);
      toast.error("Failed to load permalinks");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update slug locally
  const handleChange = (index, newSlug) => {
    const updated = [...pages];
    updated[index].slug = newSlug;
    setPages(updated);
  };

  // ✅ Save updates to backend
  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put("/api/permalinks", pages, { withCredentials: true });
      toast.success("Permalinks updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update permalinks");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Reset to default
  const handleSeed = async () => {
    try {
      await axios.post("/api/permalinks/seed", {}, { withCredentials: true });
      await fetchPermalinks();
      toast.success("Permalinks reset to default!");
    } catch (err) {
      console.error("Seeding error:", err);
      toast.error("Failed to reset permalinks");
    }
  };

  useEffect(() => {
    fetchPermalinks();
  }, []);

  return (
    <div className="p-6 pt-20 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <FaLink className="text-blue-600 text-2xl" />
          <h2 className="text-2xl font-semibold">Permalink Settings</h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {page.pageName}
                </h3>

                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="mt-2 w-full bg-white text-gray-800 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="mt-2 text-sm text-gray-600">
                  Path:{" "}
                  <span className="text-blue-600 font-mono">/{page.slug}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSeed}
            className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-md text-sm font-medium text-gray-800 transition"
          >
            Reset Default
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className={`${
              saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-md text-sm font-medium transition`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permalink;
