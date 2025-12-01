"use client";
import payment from "../../assets/landingassets/payment.png";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { SiVisa, SiMastercard, SiPaypal } from "react-icons/si";
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
              <Link href="/ItDumps/sap" className="hover:underline">
                SAP Dumps
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <div className="flex gap-4 text-2xl">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3B5998] p-2 rounded-full hover:bg-[#2D4373] transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF0000] p-2 rounded-full hover:bg-[#CC0000] transition"
            >
              <FaYoutube />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E4405F] p-2 rounded-full hover:bg-[#C13584] transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0077B5] p-2 rounded-full hover:bg-[#005885] transition"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] p-2 rounded-full hover:bg-[#1A8CD8] transition"
            >
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="hidden sm:block">
          <h3 className="font-semibold mb-2">Subscribe to Our Newsletter</h3>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div>
        <img src={payment} alt="" />
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-center text-gray-400 text-xs mt-4 gap-2">
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
