// ============================================
// FILE: app/contact/page.jsx (FIXED)
// ============================================

import Contact from "@/components/Contact"; // Adjust path as needed

// ✅ Static metadata - no fetching
export const metadata = {
  title: "Contact Us - Prepmantras | 24/7 IT Certification Support",
  description: "Get in touch with Prepmantras for IT certification exam preparation support. Email, phone, and live chat available 24/7.",
  keywords: "contact prepmantras, IT certification support, exam dumps support",
};

// ✅ Force dynamic rendering - don't generate at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ Simple wrapper - no data fetching
export default function ContactPage() {
  return <Contact />;
}