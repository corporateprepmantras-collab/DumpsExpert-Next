import "./globals.css";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Navbar from "@/components/public/Navbar";
import Providers from "@/components/providers";
import favicon from "./favicon.ico";
// ✅ Font (safe & stable)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// ✅ Lazy footer (SSR safe)
const Footer = dynamic(() => import("@/components/public/Footer"), {
  ssr: true,
});

// ✅ Metadata (NO <head> usage)
export const metadata = {
  title: {
    default: "Prepmantras – #1 IT Exam Prep Provider",
    template: "%s | Prepmantras",
  },
  description:
    "Pass your IT certifications in first attempt with trusted exam prep, practice tests & PDF guides by Prepmantras.",
  keywords: [
    "IT certification",
    "exam prep",
    "practice tests",
    "certification dumps",
    "AWS",
    "SAP",
    "Azure",
  ],
  authors: [{ name: "Prepmantras" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"
  ),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com",
  },
  openGraph: {
    title: "Prepmantras – #1 IT Exam Prep Provider",
    description:
      "Pass your IT certifications in first attempt with trusted exam prep.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com",
    siteName: "Prepmantras",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prepmantras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prepmantras – #1 IT Exam Prep Provider",
    description: "Pass your IT certifications in first attempt",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: { favicon },
    apple: { favicon },
  },
};

// ✅ Viewport (App Router way)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13677c",
};

// ✅ ROOT LAYOUT (Server Component)
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} antialiased bg-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* ✅ Client Providers (NextAuth safe) */}
        <Providers>
          {/* Navbar */}
          <header className="sticky top-0 z-50 w-full">
            <Navbar />
          </header>

          {/* Main content */}
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
