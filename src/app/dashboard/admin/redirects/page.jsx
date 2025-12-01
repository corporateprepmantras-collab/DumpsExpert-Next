"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const RedirectManager = () => {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fromUrl: "",
    toUrl: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const res = await axios.get("/api/redirects");
      setRedirects(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load redirects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fromUrl || !form.toUrl) {
      toast.error("Both URLs are required");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        await axios.put(`/api/redirects/${editingId}`, form);
        toast.success("Redirect updated successfully!");
      } else {
        // Create new
        await axios.post("/api/redirects", form);
        toast.success("Redirect created successfully!");
      }

      setForm({ fromUrl: "", toUrl: "" });
      setEditingId(null);
      fetchRedirects();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to save redirect");
    }
  };

  const handleEdit = (redirect) => {
    setForm({
      fromUrl: redirect.fromUrl,
      toUrl: redirect.toUrl,
    });
    setEditingId(redirect._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;

    try {
      await axios.delete(`/api/redirects/${id}`);
      toast.success("Redirect deleted successfully!");
      fetchRedirects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete redirect");
    }
  };

  const handleCancel = () => {
    setForm({ fromUrl: "", toUrl: "" });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Redirect</h1>
          <p className="text-gray-600 mt-2">
            Manage URL redirects for your website
          </p>
        </div>

        {/* Create/Edit Form */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* From URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From URL
              </label>
              <input
                type="text"
                placeholder="Enter From URL"
                value={form.fromUrl}
                onChange={(e) => setForm({ ...form, fromUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To URL
              </label>
              <input
                type="text"
                placeholder="Enter To URL"
                value={form.toUrl}
                onChange={(e) => setForm({ ...form, toUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Redirects Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading redirects...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white w-16">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    From URL
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    To URL
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {redirects.length > 0 ? (
                  redirects.map((redirect, index) => (
                    <tr
                      key={redirect._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                          {redirect.fromUrl}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="font-mono text-xs bg-green-50 px-2 py-1 rounded">
                          {redirect.toUrl}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(redirect)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(redirect._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
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
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No redirects found. Create your first redirect above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {redirects.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Total Redirects:{" "}
              <span className="font-semibold">{redirects.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectManager;
