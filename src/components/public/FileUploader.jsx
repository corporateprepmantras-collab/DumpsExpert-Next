"use client";
import React, { useState, useRef, useEffect } from "react";

const FileUploader = ({
  onFileSelect,
  onRemoveExisting, // callback to clear existing file
  accept = "*/*",
  label = "file",
  maxSize = 10,
  existingUrl = null,
  existingLabel = "",
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // 🧩 Handle new file
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Check file size (maxSize in MB)
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }

    setFile(selectedFile);
    onFileSelect?.(selectedFile);
  };

  // 📁 Handle file select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  // 🖱️ Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  // 📋 Handle paste (for images)
  useEffect(() => {
    if (!accept.includes("image")) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const pastedFile = item.getAsFile();
          if (pastedFile) handleFile(pastedFile);
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [accept]);

  // ❌ Remove newly selected file
  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    onFileSelect?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ❌ Clear existing file (just sets to empty string)
  const handleClearExisting = () => {
    onRemoveExisting?.();
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isImage = file?.type.startsWith("image/");
  const isPdf = file?.type === "application/pdf";
  const isExistingImage = existingUrl && accept.includes("image");

  return (
    <div className="w-full">
      {/* Show existing file if in edit mode and no new file selected */}
      {!file && existingUrl && (
        <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-blue-700 font-medium">
              {existingLabel || "Current File"}:
            </p>
            <button
              type="button"
              onClick={handleClearExisting}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
              title="Remove this file"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Remove
            </button>
          </div>

          {isExistingImage ? (
            <img
              src={existingUrl}
              alt="Current file"
              className="w-32 h-32 object-contain border rounded"
            />
          ) : (
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              View Current File
            </a>
          )}
        </div>
      )}

      <div
        className="flex flex-col items-center justify-center w-full p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all hover:border-gray-400 dark:hover:border-gray-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="w-full flex flex-col items-center">
            {/* 🖼️ File Preview */}
            <div className="relative group mb-4">
              {isImage && preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                />
              ) : isPdf ? (
                <div className="flex flex-col items-center justify-center w-32 h-32 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <svg
                    className="w-12 h-12 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    PDF
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* 📄 File Info */}
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* 🔘 Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm transition"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          // 🆕 Upload Box
          <div
            onClick={() => fileInputRef.current.click()}
            className="flex flex-col items-center space-y-3 cursor-pointer w-full"
          >
            <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              <svg
                className="w-10 h-10 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload {label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click, drag, or paste {label} here
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default FileUploader;
