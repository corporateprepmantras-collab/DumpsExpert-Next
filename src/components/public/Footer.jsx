"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import dumpslogo from "../../assets/logo/prepmantras_logo_white.png";
import PaymentGateway from "../../assets/landingassets/paymentGateway.png";

export default function Footer() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 relative z-10">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <Image
            src={dumpslogo}
            alt="PrepMantras Logo"
            className="h-10 sm:h-12 lg:h-14 w-auto"
          />
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {/* About PrepMantras */}
          <div className="lg:col-span-5">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 tracking-wide">
              About PrepMantras
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-200">
              At PrepMantras, our mission is simple — your exam success. We help
              students clear exams faster and smarter by providing 100%
              authentic, exam-focused questions designed to boost confidence and
              accuracy. Thousands of students have already achieved success with
              our courses.
            </p>
          </div>

          {/* Popular Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 tracking-wide">
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm text-gray-200">
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
                <span key={cat} className="inline-flex items-center">
                  <button
                    onClick={() =>
                      handleNavigation(`/category/${cat.toLowerCase()}`)
                    }
                    className="hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                  {i < arr.length - 1 && (
                    <span className="ml-2 sm:ml-3 text-gray-500">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Popular Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 tracking-wide">
              Popular Links
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-200">
              <li>
                <button
                  onClick={() => handleNavigation("/about")}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/itcertifications")}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                >
                  IT Dumps
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/guarantee")}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                >
                  Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/privacy-policy")}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/terms")}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Connect & Payment */}
          <div className="lg:col-span-2">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 tracking-wide">
              Connect With Us
            </h3>
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Facebook"
                className="bg-blue-600 hover:bg-blue-700 p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-white text-sm sm:text-base" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on LinkedIn"
                className="bg-blue-700 hover:bg-blue-800 p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-white text-sm sm:text-base" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Subscribe to our YouTube channel"
                className="bg-red-600 hover:bg-red-700 p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaYoutube className="text-white text-sm sm:text-base" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Instagram"
                className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-white text-sm sm:text-base" />
              </a>
            </div>
            <div className="mt-4 sm:mt-5">
              <p className="text-xs sm:text-sm text-gray-200 mb-2 sm:mb-3 font-semibold">
                We Accept
              </p>
              <Image
                src={PaymentGateway}
                alt="Payment Methods"
                className="h-6 sm:h-7 lg:h-8 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 lg:mb-10">
          <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 tracking-wide">
            Legal Disclaimer
          </h3>
          <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-xs lg:text-sm leading-relaxed text-gray-200">
            <p>
              PrepMantras.com is an independent educational platform providing
              study materials and practice questions. We are not affiliated with
              or endorsed by SAP SE, Microsoft, Amazon Web Services, Google
              Cloud, or other certification bodies. All company names and
              certifications mentioned are trademarks of their respective
              owners.
            </p>
            <p>
              Our training resources are developed by certified professionals
              for educational purposes. We respect intellectual property rights
              and use certification names solely for reference and
              identification.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-4 sm:pt-5 lg:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4 text-[11px] sm:text-xs lg:text-sm text-gray-200">
            <p className="leading-relaxed text-center sm:text-left">
              PrepMantras.com is an independent exam-preparation platform and is
              not affiliated with, endorsed by, or associated with SAP SE,
              Microsoft Azure, AWS, GCP, or any certification provider. All
              trademarks, logos, and certification names are the property of
              their respective owners and are used for identification purposes
              only.
            </p>
            <p className="text-center pt-2 sm:pt-3 text-gray-300">
              © 2025 PrepMantras.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
