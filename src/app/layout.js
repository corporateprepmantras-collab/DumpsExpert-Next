import "./globals.css";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import Navbar from "@/components/public/Navbar";
import Providers from "@/components/providers";

// ✅ Optimized font loading with display swap
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false, // Only preload if heavily used
});

// ✅ Lazy load Footer (below the fold)
const Footer = dynamic(() => import("@/components/public/Footer"), {
  loading: () => <div className="h-64 bg-gray-50" />,
  ssr: true, // Still render on server for SEO
});

// ✅ Dynamic metadata for better SEO
export async function generateMetadata() {
  // You can fetch this from your API if needed
  return {
    title: {
      default: "Prepmantras – #1 IT Exam Prep Provider",
      template: "%s | Prepmantras",
    },
    description:
      "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras.",
    keywords: [
      "IT certification",
      "exam prep",
      "practice tests",
      "certification dumps",
      "IT training",
    ],
    authors: [{ name: "Prepmantras" }],
    creator: "Prepmantras",
    publisher: "Prepmantras",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"
    ),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Prepmantras – #1 IT Exam Prep Provider",
      description:
        "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides.",
      url: "/",
      siteName: "Prepmantras",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Prepmantras – #1 IT Exam Prep Provider",
      description: "Pass your IT certifications in first attempt",
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
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* ✅ Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* ✅ DNS prefetch for API calls */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BASE_URL} />

        {/* ✅ Viewport for mobile optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* ✅ Theme color */}
        <meta name="theme-color" content="#13677c" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
