"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageUploader = ({ onImagesSelect, resetKey = 0 }) => {
  const [images, setImages] = useState([]); // { file, preview }
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const releasePreviews = (list) => {
    list.forEach((img) => {
      if (img?.preview) URL.revokeObjectURL(img.preview);
    });
  };

  // 🧩 Handle new files
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => {
      const updated = [...prev, ...newImages];
      onImagesSelect?.(updated.map((img) => img.file));
      return updated;
    });
  };

  // 📁 Handle file select
  const handleFileChange = (e) => handleFiles(e.target.files);

  // 🖱️ Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // 📋 Handle paste (multiple)
  useEffect(() => {
    const handlePaste = (e) => {
      if (!containerRef.current) return;

      const activeElement = document.activeElement;
      const isWithinTarget =
        activeElement && containerRef.current.contains(activeElement);

      if (!isWithinTarget && !isActive) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.type?.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length) handleFiles(files);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isActive]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ❌ Remove specific image
  const handleRemove = (index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      const updated = prev.filter((_, i) => i !== index);
      onImagesSelect?.(updated.map((img) => img.file));
      return updated;
    });
  };

  // 🧹 Clear all
  const handleRemoveAll = () => {
    setImages((prev) => {
      releasePreviews(prev);
      return [];
    });
    onImagesSelect?.([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsActive(false);
  };

  useEffect(() => {
    setImages((prev) => {
      releasePreviews(prev);
      return [];
    });
    onImagesSelect?.([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsActive(false);
  }, [resetKey]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="group"
      onFocus={() => setIsActive(true)}
      onBlur={(event) => {
        if (!containerRef.current) return;
        const nextTarget = event.relatedTarget;
        if (!nextTarget || !containerRef.current.contains(nextTarget)) {
          setIsActive(false);
        }
      }}
      className={`flex flex-col items-center justify-center w-full p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border transition-all hover:shadow-xl focus:outline-none ${
        isActive
          ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-600"
          : "border-gray-200 dark:border-gray-700"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={() => setIsActive(true)}
    >
      {images.length > 0 ? (
        <div className="w-full flex flex-col items-center">
          {/* 🖼️ Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 w-full">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${i}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                  className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 🔘 Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm"
            >
              Add More
            </button>
            <button
              type="button"
              onClick={handleRemoveAll}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 text-sm"
            >
              Remove All
            </button>
          </div>
        </div>
      ) : (
        // 🆕 Upload Box
        <div
          onClick={() => fileInputRef.current.click()}
          className="flex flex-col items-center space-y-3 cursor-pointer"
        >
          <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <span className="text-gray-500 dark:text-gray-300 text-sm text-center">
              +
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            Click, drag, or paste multiple images here
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
