"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";

const Announcement = () => {
  const [active, setActive] = useState(false);
  const [delay, setDelay] = useState("2.00");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Fetch current announcement settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/announcement");
        const data = res.data;
        setActive(data?.active || false);
        setDelay(data?.delay?.toFixed(2) || "2.00");
        setImagePreview(data?.imageUrl || null);
      } catch (err) {
        console.error("Error loading announcement:", err.message);
      }
    };
    fetchData();
  }, []);

  // Image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("active", active);
    formData.append("delay", delay);
    if (imageFile) formData.append("image", imageFile);

    try {
      await axios.post(
        "/api/announcement/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert("✅ Announcement updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update announcement");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6 mt-10">
      <h2 className="text-lg font-semibold">Update Announcement Popup</h2>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label className="font-semibold">
          Announcement Popup <span className="text-red-500">*</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={active}
            onChange={() => setActive(!active)}
          />
          <div
            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
              active ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                active ? "translate-x-7" : ""
              }`}
            ></div>
          </div>
        </label>
        <span
          className={`ml-4 px-3 py-1 rounded text-white text-sm ${
            active ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {active ? "Active" : "Dactive"}
        </span>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-semibold mb-2">
          Announcement Image <span className="text-red-500">*</span>
        </label>
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-64 h-auto rounded shadow"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-400 mt-1">
          Upload 960x519 (Pixel) image for best quality. Only JPG, JPEG, PNG
          allowed.
        </p>
      </div>

      {/* Delay Input */}
      <div>
        <label className="block font-semibold mb-2">
          Popup Delay (Seconds) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={delay}
          onChange={(e) => setDelay(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

export default Announcement;
