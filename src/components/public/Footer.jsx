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
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About PrepMantras */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">
              About PrepMantras
            </h3>
            <p className="text-xs leading-relaxed">
              At PrepMantras, our mission is simple — your exam success. We help
              students clear exams faster and smarter by providing 100%
              authentic, exam-focused questions designed to boost confidence and
              accuracy. Thousands of students have already achieved success with
              our courses.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">
              Popular Categories
            </h3>
            <p className="text-xs leading-relaxed flex flex-wrap gap-1">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                SAP
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                AZURE
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                AWS
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                GCP
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                SALESFORCE
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                CISCO
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                COMPTIA
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                PMI
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                ORACLE
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                AXELOS
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                ISC2
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Microsoft
              </Link>
            </p>
          </div>

          {/* Popular Links */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">
              Popular Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="mr-2">•</span> About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="mr-2">•</span> IT Dumps
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="mr-2">•</span> Guarantee
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="mr-2">•</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="mr-2">•</span> Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">Follow Us</h3>
            <div className="flex gap-3">
              <Link
                href="#"
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-blue-700 hover:bg-blue-800 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaYoutube className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-blue-400 hover:bg-blue-500 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaTwitter className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-all duration-300 hover:scale-110"
              >
                <FaWhatsapp className="text-white text-sm" />
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <h3 className="text-base font-bold text-white mb-3">Disclaimer</h3>
          <ul className="space-y-2 text-xs leading-relaxed">
            <li>
              <span className="mr-2">•</span>
              PrepMantras.com is not affiliated with, endorsed by, or associated
              with SAP SE, Microsoft Azure, Amazon Web Services (AWS), Google
              Cloud Platform (GCP), or any other certification provider.
              PrepMantras provides practice questions and study materials
              intended to support exam preparation and learning.
            </li>
            <li>
              <span className="mr-2">•</span>
              All training resources and mock tests available on our platform
              are created by industry professionals for educational purposes
              only. PrepMantras does not claim ownership of any trademarks,
              logos, or brand names mentioned on this website. All certification
              names and trademarks are the property of their respective owners.
            </li>
          </ul>
        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <h3 className="text-base font-bold text-white mb-3 text-center">
            We Accept
          </h3>
          <div className="flex justify-center">
            <Image
              src={PaymentGateway}
              alt="Payment Methods"
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-6"></div>

        {/* Bottom Section */}
        <div className="text-center text-xs text-gray-400 mb-4">
          <p>
            PrepMantras.com is an independent exam-preparation platform and is
            not affiliated with, endorsed by, or associated with SAP SE,
            Microsoft Azure, AWS, GCP, or any certification provider. All
            trademarks, logos, and certification names are the property of their
            respective owners and are used for identification purposes only.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 PrepMantras.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
