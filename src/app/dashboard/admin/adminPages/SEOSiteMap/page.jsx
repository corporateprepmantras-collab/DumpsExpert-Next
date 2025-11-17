"use client";
import { useEffect, useState } from "react";
import { FaTrash, FaEye, FaDownload, FaCheckCircle, FaExclamationCircle, FaUpload } from "react-icons/fa";

const SEOSiteMap = () => {
  const [file, setFile] = useState(null);
  const [sitemaps, setSitemaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch all sitemaps from DB on mount
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

  // Handle file input change with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/xml', 'text/xml', 'application/x-xml'];
    const fileName = selectedFile.name.toLowerCase();
    
    if (!validTypes.includes(selectedFile.type) && !fileName.endsWith('.xml')) {
      alert("Please upload a valid XML sitemap file.");
      e.target.value = null;
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  // Analyze sitemap XML
  const analyzeSitemap = async (fileUrl, id) => {
    setAnalyzing(id);
    try {
      const response = await fetch(fileUrl);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const urls = xmlDoc.getElementsByTagName("url");
      const urlCount = urls.length;
      
      // Extract sample URLs
      const sampleUrls = [];
      for (let i = 0; i < Math.min(5, urlCount); i++) {
        const loc = urls[i].getElementsByTagName("loc")[0]?.textContent;
        const lastmod = urls[i].getElementsByTagName("lastmod")[0]?.textContent;
        const priority = urls[i].getElementsByTagName("priority")[0]?.textContent;
        
        if (loc) {
          sampleUrls.push({ loc, lastmod, priority });
        }
      }

      setPreviewData({
        urlCount,
        sampleUrls,
        fileName: sitemaps.find(s => s._id === id)?.name || 'Unknown'
      });
      setShowPreview(true);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze sitemap. Please ensure it's a valid XML file.");
    } finally {
      setAnalyzing(null);
    }
  };

  // Upload new sitemap
  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file.");
      return;
    }

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
        alert("✅ Sitemap uploaded successfully!");
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

  // Delete sitemap
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sitemap?")) return;

    try {
      const res = await fetch(`/api/sitemap?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setSitemaps((prev) => prev.filter((s) => s._id !== id));
        alert("🗑️ Deleted successfully!");
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting.");
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SEO Sitemap Manager</h1>
          <p className="text-gray-600">Upload, manage, and analyze your XML sitemaps for better SEO</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUpload className="text-indigo-600" />
            Upload New Sitemap
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select XML Sitemap File (Max 5MB)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="fileInput"
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  onChange={handleFileChange}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className={`${
                    loading || !file
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {file && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Selected: {file.name} ({formatFileSize(file.size)})
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Sitemap Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Must be a valid XML file</li>
                <li>• Should follow sitemap.org protocol</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Maximum 50,000 URLs per sitemap</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sitemap Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Sitemaps ({sitemaps.length})</h2>
          
          {sitemaps.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationCircle className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No sitemaps uploaded yet.</p>
              <p className="text-gray-400 text-sm">Upload your first sitemap to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">File Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sitemaps.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500" />
                          <span className="font-medium text-gray-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FaEye />
                            View
                          </a>
                          <button
                            onClick={() => analyzeSitemap(item.fileUrl, item._id)}
                            disabled={analyzing === item._id}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:bg-gray-400"
                          >
                            {analyzing === item._id ? "..." : "📊 Analyze"}
                          </button>
                          <a
                            href={item.fileUrl}
                            download
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FaDownload />
                          </a>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEO Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-900">💡 SEO Tips for Sitemaps</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">✅ Best Practices</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Update sitemaps regularly</li>
                <li>• Include only canonical URLs</li>
                <li>• Use priority tags wisely</li>
                <li>• Submit to Google Search Console</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🔗 Submit Your Sitemap</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google: Search Console</li>
                <li>• Bing: Webmaster Tools</li>
                <li>• Add to robots.txt</li>
                <li>• Monitor indexing status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Sitemap Analysis</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">File Name</p>
                <p className="text-lg font-semibold text-gray-800">{previewData.fileName}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total URLs</p>
                <p className="text-3xl font-bold text-green-600">{previewData.urlCount}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Sample URLs (First 5)</h4>
                <div className="space-y-2">
                  {previewData.sampleUrls.map((url, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-medium text-blue-600 break-all">{url.loc}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        {url.lastmod && <span>Last Modified: {url.lastmod}</span>}
                        {url.priority && <span>Priority: {url.priority}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOSiteMap;