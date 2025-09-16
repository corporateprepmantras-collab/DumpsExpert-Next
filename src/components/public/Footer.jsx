"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import dumpslogo from "../../assets/logo/premantras_logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E24] overflow-hidden text-white text-sm px-4 sm:px-6 lg:px-20 py-10">
      {/* Top Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-gray-600 pb-8">
        {/* Disclaimer */}
        <div className="overflow-hidden text-ellipsis">
          <p className="font-semibold">Disclaimer :</p>
          <p className="mt-2 line-clamp-3 sm:line-clamp-none">
            We provide top-quality dumps, practice exams, and study materials
            for various certifications. Join us to ensure success in your IT
            career!
          </p>
          <Image
            src={dumpslogo}
            alt="DumpsXpert Logo"
            className="mt-4"
            width={250}
            height={250}
            placeholder="blur"
          />
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/sap-dumps" className="hover:underline">
                SAP Dumps
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="hover:underline">
                About Us
              </Link>
            </li>
            {/* Hide extra links on mobile */}
            <li className="hidden sm:block">
              <Link href="/link-name" className="hover:underline">
                Link Name
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <FaFacebookF /> Facebook
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedinIn /> Linkedin
            </li>
            <li className="flex items-center gap-2">
              <FaYoutube /> Youtube
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="hidden sm:block">
          <h3 className="font-semibold mb-2">Subscribe to Our Newsletter</h3>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-center text-gray-400 text-xs mt-4 border-t border-gray-600 pt-4 gap-2">
        <div className="truncate max-w-[250px] sm:max-w-none">
          © 2025 Exam Dump. All Rights Reserved. Designed By Dumpsxpert.Com
        </div>
        <div className="space-x-4 hidden sm:block">
          <Link href="/guarantee" className="hover:underline">
            Guarantee
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms & Condition
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="hover:underline">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
