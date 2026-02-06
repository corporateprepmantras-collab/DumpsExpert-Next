"use client";
import Link from "next/link";
import { Home, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 leading-none select-none mb-4">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Oops! The certification page you're looking for seems to have moved
            or doesn't exist. Let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/">
            <button className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Home className="w-5 h-5" />
              Back to Home
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link href="/ItDumps">
            <button className="group flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 active:scale-95">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Browse Certifications
            </button>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Popular Certification Paths
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "AWS", href: "/ItDumps/aws" },
              { name: "Azure", href: "/ItDumps/azure" },
              { name: "GCP", href: "/ItDumps/gcp" },
              { name: "CompTIA", href: "/ItDumps/comptia" },
            ].map((cert) => (
              <Link key={cert.name} href={cert.href}>
                <button className="w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white hover:from-orange-50 hover:to-white border-2 border-gray-200 hover:border-orange-500 rounded-xl font-semibold text-gray-900 hover:text-orange-600 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                  {cert.name}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help?{" "}
            <Link
              href="/contact"
              className="text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-orange-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
    </div>
  );
}
