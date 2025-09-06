"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const MaintenancePage = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceText, setMaintenanceText] = useState(
    "We are upgrading our site. We will come back soon.\nPlease stay with us.\nThank you."
  );
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "/api/maintenance-page/"
        );
        const data = res.data;
        if (data) {
          setMaintenanceMode(data.maintenanceMode);
          setMaintenanceText(data.maintenanceText);
          if (data.imageUrl) setPreview(data.imageUrl);
        }
      } catch (err) {
        console.error("Failed to fetch maintenance setting:", err.message);
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("maintenanceMode", maintenanceMode);
    formData.append("maintenanceText", maintenanceText);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await axios.post(
        "http://${process.env.NEXT_PUBLIC_BASE_URL}/api/maintenance-page/update",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("✅ Maintenance settings updated!");
      console.log("Update response:", res.data);
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("❌ Update failed!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6 mt-10">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label className="font-semibold">
          Maintenance Mode<span className="text-red-500">*</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={maintenanceMode}
            onChange={() => setMaintenanceMode(!maintenanceMode)}
          />
          <div
            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
              maintenanceMode ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                maintenanceMode ? "translate-x-7" : ""
              }`}
            ></div>
          </div>
        </label>
        <span
          className={`ml-4 px-3 py-1 rounded text-white text-sm ${
            maintenanceMode ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {maintenanceMode ? "Active" : "Dactive"}
        </span>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-semibold mb-2">
          Maintenance Image<span className="text-red-500">*</span>
        </label>
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Maintenance"
              className="w-64 h-auto rounded shadow"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Textarea */}
      <div>
        <label className="block font-semibold mb-2">
          Maintenance Text<span className="text-red-500">*</span>
        </label>
        <textarea
          value={maintenanceText}
          onChange={(e) => setMaintenanceText(e.target.value)}
          rows={5}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
      >
        Update
      </button>
    </div>
  );
};

export default MaintenancePage;
