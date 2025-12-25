"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import dumpslogo from "../../assets/logo/premantras_logo.png";
import PaymentGateway from "../../assets/landingassets/paymentGateway.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="mt-3">
            <Image
              src={dumpslogo}
              alt="Payment Methods"
              className="h-6 w-auto"
            />
          </div>
          {/* About PrepMantras */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              About PrepMantras
            </h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Your exam success partner. We provide 100% authentic, exam-focused
              questions to help students clear exams faster and smarter.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                SAP
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                AZURE
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                AWS
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                GCP
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                SALESFORCE
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                CISCO
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                COMPTIA
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                PMI
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                ORACLE
              </Link>
            </div>
          </div>

          {/* Popular Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Quick Links
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

          {/* Follow Us & Payment */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
              Connect With Us
            </h3>
            <div className="flex gap-2 mb-3">
              <Link
                href="#"
                className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-white text-xs" />
              </Link>
              <Link
                href="#"
                className="bg-blue-700 hover:bg-blue-800 p-1.5 rounded transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-white text-xs" />
              </Link>
              <Link
                href="#"
                className="bg-red-600 hover:bg-red-700 p-1.5 rounded transition-all duration-300 hover:scale-110"
              >
                <FaYoutube className="text-white text-xs" />
              </Link>
              <Link
                href="#"
                className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 p-1.5 rounded transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-white text-xs" />
              </Link>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">We Accept</p>
              <Image
                src={PaymentGateway}
                alt="Payment Methods"
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <p className="text-center md:text-left">
              © 2025 PrepMantras.com. All rights reserved.
            </p>
            <p className="text-center md:text-right">
              Independent platform not affiliated with SAP, AWS, Azure, GCP, or
              other certification providers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
