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
    default:
      "Prepmantras – #1 IT Exam Prep Provider | Certification Dumps & Practice Tests",
    template: "%s | Prepmantras",
  },
  description:
    "Pass your IT certifications in first attempt with trusted exam prep, practice tests & PDF guides by Prepmantras. AWS, SAP, Azure, CompTIA certification dumps with 99% pass rate.",

  keywords: [
    "IT certification",
    "exam prep",
    "practice tests",
    "certification dumps",
    "AWS certification",
    "SAP certification",
    "Azure certification",
    "CompTIA dumps",
    "exam questions",
    "certification training",
  ],

  authors: [{ name: "Prepmantras" }],
  creator: "Prepmantras",
  publisher: "Prepmantras",
  category: "Education",
  applicationName: "Prepmantras",

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.prepmantras.com",
  ),

  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.prepmantras.com",
  },

  openGraph: {
    title: "Prepmantras – #1 IT Exam Prep Provider | 99% Pass Rate",
    description:
      "Pass your IT certifications in first attempt with trusted exam prep, practice tests & PDF guides. AWS, SAP, Azure, CompTIA certification dumps.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://www.prepmantras.com",
    siteName: "Prepmantras",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prepmantras - IT Certification Exam Prep",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@prepmantras",
    creator: "@prepmantras",
    title: "Prepmantras – #1 IT Exam Prep Provider",
    description:
      "Pass your IT certifications in first attempt with 99% pass rate. Trusted by 50,000+ students.",
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

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    bing: process.env.BING_VERIFICATION,
  },

  // ✅ CORRECT ICONS (THIS FIXES YOUR CRASH)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
  // Add structured data for organization
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Prepmantras",
    url: "https://www.prepmantras.com",
    logo: "https://www.prepmantras.com/logo.png",
    description:
      "Leading IT certification exam preparation provider with 99% pass rate",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@prepmantras.com",
    },
    sameAs: [
      "https://www.facebook.com/prepmantras",
      "https://twitter.com/prepmantras",
      "https://www.linkedin.com/company/prepmantras",
    ],
  };
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

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
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white"
        >
          Skip to main content
        </a>
        
        <Providers>
          <header className="sticky top-0 z-50 w-full">
            <Navbar />
          </header>

          <main id="main-content" className="flex-1 w-full" role="main">
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
