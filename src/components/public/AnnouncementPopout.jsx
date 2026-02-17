"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AnnouncementPopout() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popout was already shown in this session
    const hasSeenPopout = localStorage.getItem("hasSeenAnnouncement");
    if (hasSeenPopout) return;

    // Fetch announcement data
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();
        if (data.active) {
          setAnnouncement(data);
          setTimeout(() => {
            setIsVisible(true);
            localStorage.setItem("hasSeenAnnouncement", "true");
          }, data.delay * 1000);
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    fetchAnnouncement();
  }, []);

  if (!isVisible || !announcement) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          aria-label="Close popout"
        >
          <svg
            className="w-6 h-6"
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
        </button>
        <div className="flex flex-col items-center">
          <Image
            src={announcement.imageUrl}
            alt="Announcement"
            width={400}
            height={200}
            className="rounded-md object-cover w-full h-48"
          />
          <p className="mt-4 text-center text-gray-700">
            Special Offer! Check out our latest deals!
          </p>
          <a
            href="/itcertifications" // Adjust link as needed
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
