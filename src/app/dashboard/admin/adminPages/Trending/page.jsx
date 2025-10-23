"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ManageTrendingCerts() {
  const [certs, setCerts] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    const res = await axios.get("/api/trending");
    setCerts(res.data);
  };

  const addCert = async () => {
    if (!newTitle.trim()) return;
    await axios.post("/api/trending", { title: newTitle });
    setNewTitle("");
    fetchCerts();
  };

  const deleteCert = async (id) => {
    await axios.delete(`/api/trending?id=${id}`);
    fetchCerts();
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Manage Top Trending Certifications
        </h2>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter certification name"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCert}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {certs.map((cert) => (
            <li
              key={cert._id}
              className="flex justify-between items-center border border-gray-200 rounded p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium">{cert.title}</span>
              <button
                onClick={() => deleteCert(cert._id)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
