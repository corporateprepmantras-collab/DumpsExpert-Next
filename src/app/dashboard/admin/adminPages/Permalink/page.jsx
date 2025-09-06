"use client"
import React, { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import axios from "axios";

const Permalink = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPermalinks = async () => {
    try {
      const res = await axios.get("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/permalinks", {
        withCredentials: true,
      });
      setPages(res.data);
    } catch (error) {
      console.error("Failed to load permalinks:", error);
    }
  };

  const handleChange = (index, newSlug) => {
    const updatedPages = [...pages];
    updatedPages[index].slug = newSlug;
    setPages(updatedPages);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/permalinks", pages, {
        withCredentials: true,
      });
      alert("Permalinks updated successfully!");
    } catch (error) {
      alert("Update failed.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    try {
      await axios.post("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/permalinks/seed", {}, {
        withCredentials: true,
      });
      await fetchPermalinks();
      alert("Permalinks reset to default!");
    } catch (err) {
      alert("Failed to seed.");
      console.error("Seeding error:", err);
    }
  };

  useEffect(() => {
    fetchPermalinks();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <FaLink className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-semibold text-gray-800">Permalink</h2>
        </div>

        {/* Permalink Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((page, index) => (
            <div
              key={index}
              className="bg-white shadow rounded p-4 space-y-2"
            >
              <label className="block font-medium text-gray-700">
                Page Name: {page.pageName}
              </label>
              <input
                type="text"
                value={page.slug}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                Full Path:{" "}
                <span className="text-gray-800 font-mono">/{page.slug}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleSeed}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            Reset to Default
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permalink;
