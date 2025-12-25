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
    <footer className="bg-[#1E1E24] overflow-hidden text-white px-4 sm:px-6 lg:px-20 py-12">
      {/* Top Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
        {/* About PrepMantras */}
        <div>
          <Image
            src={dumpslogo}
            alt="PrepMantras Logo"
            className="mb-4  bg-white"
            width={200}
            height={60}
            placeholder="blur"
          />
          <p className="text-gray-300 text-sm leading-relaxed">
            At PrepMantras, our mission is simple — your exam success. We help
            students clear exams faster and smarter by providing 100% authentic,
            exam-focused questions designed to boost confidence and accuracy.
            Thousands of students have already achieved success with our
            courses.
          </p>
        </div>

        {/* Popular Categories */}
        <div>
          <h3 className="font-bold text-base mb-4">Popular Categories</h3>
          <div className="text-gray-300 text-sm leading-relaxed">
            <Link
              href="/ItDumps/sap"
              className="hover:text-white transition-colors"
            >
              SAP
            </Link>{" "}
            |
            <Link
              href="/ItDumps/azure"
              className="hover:text-white transition-colors"
            >
              {" "}
              AZURE
            </Link>{" "}
            |
            <Link
              href="/ItDumps/aws"
              className="hover:text-white transition-colors"
            >
              {" "}
              AWS
            </Link>{" "}
            |
            <Link
              href="/ItDumps/gcp"
              className="hover:text-white transition-colors"
            >
              {" "}
              GCP
            </Link>{" "}
            |
            <Link
              href="/ItDumps/salesforce"
              className="hover:text-white transition-colors"
            >
              {" "}
              SALESFORCE
            </Link>{" "}
            |
            <Link
              href="/ItDumps/cisco"
              className="hover:text-white transition-colors"
            >
              {" "}
              CISCO
            </Link>{" "}
            |
            <Link
              href="/ItDumps/comptia"
              className="hover:text-white transition-colors"
            >
              {" "}
              COMPTIA
            </Link>{" "}
            |
            <Link
              href="/ItDumps/pmi"
              className="hover:text-white transition-colors"
            >
              {" "}
              PMI
            </Link>{" "}
            |
            <Link
              href="/ItDumps/oracle"
              className="hover:text-white transition-colors"
            >
              {" "}
              ORACLE
            </Link>{" "}
            |
            <Link
              href="/ItDumps/axelos"
              className="hover:text-white transition-colors"
            >
              {" "}
              AXELOS
            </Link>{" "}
            |
            <Link
              href="/ItDumps/isc2"
              className="hover:text-white transition-colors"
            >
              {" "}
              ISC2
            </Link>{" "}
            |
            <Link
              href="/ItDumps/microsoft"
              className="hover:text-white transition-colors"
            >
              {" "}
              Microsoft
            </Link>
          </div>
        </div>

        {/* Popular Links */}
        <div>
          <h3 className="font-bold text-base mb-4">Popular Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/ItDumps"
                className="text-gray-300 hover:text-white transition-colors"
              >
                IT Dumps
              </Link>
            </li>
            <li>
              <Link
                href="/guarantee"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Guarantee
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Terms & Conditions
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
      </div>

      {/* Disclaimer Section */}
      <div className="py-8">
        <h3 className="font-bold text-base mb-4">Disclaimer</h3>
        <ul className="text-gray-300 text-sm leading-relaxed space-y-3">
          <li>
            PrepMantras.com is not affiliated with, endorsed by, or associated
            with SAP SE, Microsoft Azure, Amazon Web Services (AWS), Google
            Cloud Platform (GCP), or any other certification provider.
            PrepMantras provides practice questions and study materials intended
            to support exam preparation and learning.
          </li>
          <li>
            All training resources and mock tests available on our platform are
            created by industry professionals for educational purposes only.
            PrepMantras does not claim ownership of any trademarks, logos, or
            brand names mentioned on this website. All certification names and
            trademarks are the property of their respective owners.
          </li>
        </ul>
      </div>

      {/* Payment Methods Section */}
      <div className="py-6">
        <h3 className="font-bold text-base mb-6">We Accept</h3>
        <div>
          <img
            src={PaymentGateway}
            alt="Payment Methods"
            className="h-8 object-contain"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-8"></div>

      {/* Bottom Section */}
      <div className="text-center text-gray-400 text-sm leading-relaxed mb-6">
        <p>
          PrepMantras.com is an independent exam-preparation platform and is not
          affiliated with, endorsed by, or associated with SAP SE, Microsoft
          Azure, AWS, GCP, or any certification provider. All trademarks, logos,
          and certification names are the property of their respective owners
          and are used for identification purposes only.
        </p>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-sm">
        © 2025 PrepMantras.com. All rights reserved.
      </div>
    </footer>
  );
}
