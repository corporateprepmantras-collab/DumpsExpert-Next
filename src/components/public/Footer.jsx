"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import dumpslogo from "../../assets/logo/premantras_logo.png";
import PaymentGateway from "../../assets/landingassets/paymentGateway.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-gray-300 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src={dumpslogo}
            alt="PrepMantras Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
          {/* About PrepMantras - Takes more space */}
          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              About PrepMantras
            </h3>
            <p className="text-xs leading-relaxed text-gray-400">
              At PrepMantras, our mission is simple — your exam success. We help
              students clear exams faster and smarter by providing 100%
              authentic, exam-focused questions designed to boost confidence and
              accuracy. Thousands of students have already achieved success with
              our courses.
            </p>
          </div>

          {/* Popular Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
              {[
                "SAP",
                "AZURE",
                "AWS",
                "GCP",
                "SALESFORCE",
                "CISCO",
                "COMPTIA",
                "PMI",
                "ORACLE",
                "AXELOS",
                "ISC2",
                "Microsoft",
              ].map((cat, i, arr) => (
                <span key={cat}>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    {cat}
                  </Link>
                  {i < arr.length - 1 && <span className="ml-2">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Popular Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Popular Links
            </h3>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  IT Dumps
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Guarantee
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Payment */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Connect With Us
            </h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Link
                href="#"
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-blue-700 hover:bg-blue-800 p-2 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaYoutube className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 p-2 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-white text-sm" />
              </Link>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                We Accept
              </p>
              <Image
                src={PaymentGateway}
                alt="Payment Methods"
                className="h-7 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-xs font-bold text-white mb-2 tracking-wide">
            Disclaimer
          </h3>
          <div className="space-y-2 text-[11px] leading-relaxed text-gray-400">
            <p>
              * PrepMantras.com is not affiliated with, endorsed by, or
              associated with SAP SE, Microsoft Azure, Amazon Web Services
              (AWS), Google Cloud Platform (GCP), or any other certification
              provider. PrepMantras provides practice questions and study
              materials intended to support exam preparation and learning.
            </p>
            <p>
              * All training resources and mock tests available on our platform
              are created by industry professionals for educational purposes
              only. PrepMantras does not claim ownership of any trademarks,
              logos, or brand names mentioned on this website. All certification
              names and trademarks are the property of their respective owners.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex flex-col gap-2 text-[11px] text-gray-500">
            <p className="leading-relaxed">
              PrepMantras.com is an independent exam-preparation platform and is
              not affiliated with, endorsed by, or associated with SAP SE,
              Microsoft Azure, AWS, GCP, or any certification provider. All
              trademarks, logos, and certification names are the property of
              their respective owners and are used for identification purposes
              only.
            </p>
            <p className="text-center pt-2">
              © 2025 PrepMantras.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
