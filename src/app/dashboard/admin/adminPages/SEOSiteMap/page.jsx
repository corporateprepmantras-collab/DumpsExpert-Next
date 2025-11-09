"use client";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const SEOSiteMap = () => {
  const [file, setFile] = useState(null);
  const [sitemaps, setSitemaps] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all sitemaps from DB on mount
  useEffect(() => {
    const fetchSitemaps = async () => {
      try {
        const res = await fetch("/api/sitemap");
        const data = await res.json();
        if (res.ok) {
          setSitemaps(data);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error fetching sitemaps:", error);
      }
    };
    fetchSitemaps();
  }, []);

  // ✅ Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ Upload new sitemap
  const handleUpload = async () => {
    if (!file) return alert("Please choose a file.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/sitemap", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSitemaps((prev) => [data.data, ...prev]);
        alert("Sitemap uploaded successfully!");
        setFile(null);
        document.getElementById("fileInput").value = null;
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete sitemap
  const handleDelete = async (id) => {
    if (!confirm("Delete this sitemap?")) return;

    try {
      const res = await fetch(`/api/sitemap?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setSitemaps((prev) => prev.filter((s) => s._id !== id));
        alert("Deleted successfully!");
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Form */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Sitemap</h2>
          <div>
            <label className="text-sm text-gray-600 mb-2 block uppercase">
              Upload Sitemap
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                className="border rounded px-3 py-2 w-full"
              />
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } text-white px-4 py-2 rounded`}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>

        {/* Sitemap Table */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">All Sitemaps</h2>
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">SR NO.</th>
                <th className="text-left px-4 py-2">File Name</th>
                <th className="text-left px-4 py-2">File URL</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sitemaps.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-blue-600">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View File
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded flex items-center gap-1"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sitemaps.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    No sitemap uploaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-6">
          © 2025, made with <span className="text-pink-500">❤️</span> by
          <span className="text-indigo-500 font-medium"> Yogesh</span>
        </div>
      </div>
    </div>
  );
};

export default SEOSiteMap;
