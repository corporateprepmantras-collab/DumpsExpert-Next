"use client";

import { useEffect, useState } from "react";

// Simulated API data (mock JSON)
const mockData = {
  siteTitle: "My Awesome Site",
  currencyDirection: "ltr",
  faviconUrl: "/favicon.ico",
  headerLogoUrl: "/logo.png",
  breadcrumbImageUrl: "/breadcrumb.jpg",
};

export default function BasicInformation() {
  const [siteTitle, setSiteTitle] = useState("");
  const [currencyDirection, setCurrencyDirection] = useState("");
  const [favicon, setFavicon] = useState(null);
  const [headerLogo, setHeaderLogo] = useState(null);
  const [breadcrumbImage, setBreadcrumbImage] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const [headerLogoPreview, setHeaderLogoPreview] = useState("");
  const [breadcrumbPreview, setBreadcrumbPreview] = useState("");
  const [message, setMessage] = useState("");

  // Load mock JSON data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSiteTitle(mockData.siteTitle || "");
      setCurrencyDirection(mockData.currencyDirection || "");
      setFaviconPreview(mockData.faviconUrl || "");
      setHeaderLogoPreview(mockData.headerLogoUrl || "");
      setBreadcrumbPreview(mockData.breadcrumbImageUrl || "");
    }, 300);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now, just log and simulate saving
    console.log("Updated Info:", {
      siteTitle,
      currencyDirection,
      favicon,
      headerLogo,
      breadcrumbImage,
    });
// Mock saving
    setMessage("✅ Settings updated (mocked, no backend yet).");
  };

  return (
    <div className="max-w-xl pt-20 mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4">Update Basic Info</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          placeholder="Site Title"
          className="border w-full p-2 rounded"
          required
        />

        <select
          value={currencyDirection}
          onChange={(e) => setCurrencyDirection(e.target.value)}
          className="border w-full p-2 rounded"
          required
        >
          <option value="">Select Currency Direction</option>
          <option value="ltr">Left to Right</option>
          <option value="rtl">Right to Left</option>
        </select>

        {/* Favicon */}
        <div>
          <label className="block mb-1 text-gray-700">Favicon</label>
          {faviconPreview && (
            <img
              src={faviconPreview}
              alt="Favicon Preview"
              className="h-12 w-12 mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFavicon(e.target.files[0])}
            className="block w-full"
          />
        </div>

        {/* Header Logo */}
        <div>
          <label className="block mb-1 text-gray-700">Header Logo</label>
          {headerLogoPreview && (
            <img
              src={headerLogoPreview}
              alt="Header Logo Preview"
              className="h-16 mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHeaderLogo(e.target.files[0])}
            className="block w-full"
          />
        </div>

        {/* Breadcrumb Image */}
        <div>
          <label className="block mb-1 text-gray-700">Breadcrumb Image</label>
          {breadcrumbPreview && (
            <img
              src={breadcrumbPreview}
              alt="Breadcrumb Preview"
              className="h-16 mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBreadcrumbImage(e.target.files[0])}
            className="block w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
