"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ManageTrendingCerts() {
  const [certs, setCerts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    const res = await axios.get("/api/trending");
    setCerts(res.data);
  };

  // Remove leading/trailing slashes from link
  const sanitizeLink = (link) => {
    return link.replace(/^\/+|\/+$/g, "").trim();
  };

  const addCert = async () => {
    if (!newTitle.trim()) {
      alert("Certification name is required");
      return;
    }
    if (!newLink.trim()) {
      alert("Link is required");
      return;
    }
    const sanitizedLink = sanitizeLink(newLink);

    try {
      const response = await axios.post("/api/trending", {
        title: newTitle,
        link: sanitizedLink,
      });
      console.log("✅ Success:", response.data);
      setNewTitle("");
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
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter certification name"
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
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{cert.title}</p>
                  {cert.link && (
                    <p className="text-sm text-gray-600 mt-1">
                      Link:{" "}
                      <span className="text-blue-600 break-all">
                        {cert.link}
                      </span>
                    </p>
                  )}
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
