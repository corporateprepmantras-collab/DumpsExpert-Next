"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaCcDiscover,
  FaWhatsapp,
} from "react-icons/fa";
import dumpslogo from "../../assets/logo/premantras_logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E24] overflow-hidden text-white px-4 sm:px-6 lg:px-20 py-12">
      {/* Top Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
        {/* Disclaimer */}
        <div>
          <h3 className="font-bold text-base mb-4">Disclaimer :</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            We provide top-quality dumps, practice exams, and study materials
            for various certifications. Join us to ensure success in your IT
            career!
          </p>
          <Image
            src={dumpslogo}
            alt="DumpsXpert Logo"
            className="mt-4"
            width={200}
            height={60}
            placeholder="blur"
          />
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-base mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/ItDumps/sap"
                className="text-gray-300 hover:text-white transition-colors"
              >
                SAP Dumps
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-bold text-base mb-4">Follow Us</h3>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3B5998] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-xl" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF0000] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="YouTube"
            >
              <FaYoutube className="text-xl" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="Instagram"
            >
              <FaInstagram className="text-xl" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0077B5] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="text-xl" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="Twitter"
            >
              <FaTwitter className="text-xl" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-bold text-base mb-4">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Stay updated with the latest dumps and certification news.
          </p>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="py-2">
        <h3 className="font-bold text-base mb-6 ">We Accept</h3>
        <div className="flex flex-wrap  gap-4">
          {/* Visa */}
          <div className="bg-white rounded-sm  w-16 h-10 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <FaCcVisa className="text-5xl text-[#1A1F71]" />
          </div>

          {/* Mastercard */}
          <div className="bg-white rounded-sm  w-16 h-10 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <FaCcMastercard className="text-5xl bg-cover text-[#EB001B]" />
          </div>

          {/* American Express */}
          <div className="bg-white rounded-sm  w-16 h-10 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <FaCcAmex className="text-5xl text-[#006FCF]" />
          </div>

          {/* PayPal */}
          <div className="bg-white rounded-sm  w-16 h-10 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <FaCcPaypal className="text-5xl text-[#003087]" />
          </div>

          {/* Discover */}
          <div className="bg-white rounded-sm  w-16 h-10 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <FaCcDiscover className="text-5xl text-[#FF6000]" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-8"></div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-center text-gray-400 text-sm gap-4">
        <div className="order-2 md:order-1">
          © 2025 Exam Dump. All Rights Reserved. Designed By{" "}
          <Link
            href="https://dumpsxpert.com"
            className="text-white hover:underline"
            target="_blank"
          >
            Dumpsxpert.Com
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4 order-1 md:order-2">
          <Link
            href="/guarantee"
            className="hover:text-white transition-colors"
          >
            Guarantee
          </Link>
          <span className="hidden sm:inline text-gray-600">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Condition
          </Link>
          <span className="hidden sm:inline text-gray-600">|</span>
          <Link
            href="/privacy-policy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="hidden sm:inline text-gray-600">|</span>
          <Link
            href="/refund-policy"
            className="hover:text-white transition-colors"
          >
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
