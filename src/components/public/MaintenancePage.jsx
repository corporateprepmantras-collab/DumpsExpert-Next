// components/public/MaintenancePage.jsx
"use client";

import Image from "next/image";
import dumpslogo from "../../assets/logo/premantras_logo.png";

export default function MaintenancePage({ text, imageUrl }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ✅ Navbar (static UI only) */}
      <header className="w-full z-20 border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src={dumpslogo}
              alt="Prepmantras Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          {/* Links */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-800">
            <span className="cursor-not-allowed">Home</span>
            <span className="cursor-not-allowed">About Us</span>
            <span className="cursor-not-allowed">IT Dumps</span>
            <span className="cursor-not-allowed">Blogs</span>
            <span className="cursor-not-allowed">Contact Us</span>
          </nav>
        </div>
      </header>

      {/* ✅ Main Maintenance Content */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-center text-white px-4 py-12">
        <div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Maintenance"
              className="mx-auto mb-6 max-h-60 object-contain"
            />
          )}
          <h1 className="text-4xl font-bold mb-4">🚧 We’ll Be Back Soon!</h1>
          <p className="whitespace-pre-line text-lg">{text}</p>
        </div>
      </main>

      {/* ✅ Footer (static UI only) */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <Image
              src={dumpslogo}
              alt="Prepmantras Logo"
              width={100}
              height={30}
              className="object-contain"
              priority
            />
            <p>© {new Date().getFullYear()} Exam Dump. All Rights Reserved.</p>
          </div>

          {/* Right side links (disabled) */}
          <div className="flex gap-6">
            <span className="cursor-not-allowed">Guarantee</span>
            <span className="cursor-not-allowed">Terms & Condition</span>
            <span className="cursor-not-allowed">Privacy Policy</span>
            <span className="cursor-not-allowed">Refund Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
