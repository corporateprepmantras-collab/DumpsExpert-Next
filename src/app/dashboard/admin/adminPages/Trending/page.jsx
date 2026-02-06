"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ManageTrendingCerts() {
  const [certs, setCerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newText, setNewText] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetchCerts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/product-categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCerts = async () => {
    const res = await axios.get("/api/trending");
    setCerts(res.data);
  };

  // Remove leading/trailing slashes from link
  const sanitizeLink = (link) => {
    return link.replace(/^\/+|\/+$/g, "").trim();
  };

  const addCert = async () => {
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    if (!newText.trim()) {
      alert("Description text is required");
      return;
    }
    if (!newLink.trim()) {
      alert("Link is required");
      return;
    }
    const sanitizedLink = sanitizeLink(newLink);
    const category = categories.find((cat) => cat._id === selectedCategory);

    try {
      const response = await axios.post("/api/trending", {
        categoryId: selectedCategory,
        categoryName: category.name,
        categoryImage: category.image || "",
        text: newText,
        link: sanitizedLink,
      });
      console.log("✅ Success:", response.data);
      setSelectedCategory("");
      setNewText("");
      setNewLink("");
      fetchCerts();
    } catch (error) {
      console.error("❌ Error adding certification:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteCert = async (id) => {
    await axios.delete(`/api/trending?id=${id}`);
    fetchCerts();
  };

  return (
    <div className="min-h-screen pt-20 bg-white text-black p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Manage Top Trending Certifications
        </h2>

        <div className="space-y-3 mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter description text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Enter redirect link (required) - leading/trailing slashes will be removed"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCert}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            Add Certification
          </button>
        </div>

        <div className="space-y-3">
          {certs.map((cert) => (
            <div
              key={cert._id}
              className="border border-gray-200 rounded p-4 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  {cert.categoryImage && (
                    <img
                      src={cert.categoryImage}
                      alt={cert.categoryName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {cert.categoryName}
                    </p>
                    {cert.text && (
                      <p className="text-sm text-gray-700 mt-1">{cert.text}</p>
                    )}
                    {cert.link && (
                      <p className="text-sm text-gray-600 mt-1">
                        Link:{" "}
                        <span className="text-blue-600 break-all">
                          {cert.link}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteCert(cert._id)}
                  className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 bg-red-100 rounded hover:bg-red-200 transition whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {certs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trending certifications yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
