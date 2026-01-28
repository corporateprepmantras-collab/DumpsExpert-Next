import "./globals.css";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Navbar from "@/components/public/Navbar";
import Providers from "@/components/providers";

// ✅ Font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// ✅ Lazy footer
const Footer = dynamic(() => import("@/components/public/Footer"), {
  ssr: true,
});

// ✅ Metadata (CORRECT)
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
    process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com",
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
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ✅ CORRECT ICONS (THIS FIXES YOUR CRASH)
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// ✅ Viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13677c",
};

// ✅ Root Layout
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS Prefetch and Preconnect for faster loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Prevent spam score - Add verification meta tags */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="googlebot" content="index, follow" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${inter.className} antialiased bg-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <header className="sticky top-0 z-50 w-full">
            <Navbar />
          </header>

          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
