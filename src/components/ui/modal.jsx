"use client";

import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  contentClassName = "",
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div
        className={`relative w-full max-w-[95vw] max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
      >
        <div
          data-modal-content
          className={`max-h-[95vh] overflow-y-auto ${
            contentClassName ? contentClassName : "p-8"
          }`}
        >
          {children}
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
