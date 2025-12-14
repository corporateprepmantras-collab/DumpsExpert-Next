import "./globals.css";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Navbar from "@/components/public/Navbar";
import Providers from "@/components/providers";

// ✅ OPTIMIZED: Font loading with display swap (prevents font flash)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// ✅ OPTIMIZED: Lazy load Footer (below the fold, not critical)
const Footer = dynamic(() => import("@/components/public/Footer"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
  ssr: true, // Keep SSR for SEO
});

// ✅ OPTIMIZED: Metadata with caching headers
export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com";

  return {
    metadataBase: new URL(baseUrl),

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
      "AWS",
      "SAP",
      "Azure",
    ],

    authors: [{ name: "Prepmantras", url: baseUrl }],
    creator: "Prepmantras",
    publisher: "Prepmantras",

    alternates: {
      canonical: baseUrl,
    },

    openGraph: {
      title: "Prepmantras – #1 IT Exam Prep Provider",
      description:
        "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides.",
      url: baseUrl,
      siteName: "Prepmantras",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Prepmantras - IT Certification Prep",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Prepmantras – #1 IT Exam Prep Provider",
      description: "Pass your IT certifications in first attempt",
      creator: "@prepmantras",
    },

    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

// ✅ OPTIMIZED: Viewport config
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
  themeColor: "#13677c",
};

// ✅ OPTIMIZED: Root Layout with Sticky Navbar
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable}  scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* ✅ CRITICAL: Preconnect to external domains for faster API calls */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"}
          crossOrigin="anonymous"
        />

        {/* ✅ DNS prefetch for payment gateways */}
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.paypal.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* ✅ Prefetch common assets */}
        <link
          rel="prefetch"
          href="/api/seo/home"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="prefetch"
          href="/api/trending"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="prefetch"
          href="/api/blogs"
          as="fetch"
          crossOrigin="anonymous"
        />

        {/* ✅ Manifest and theme color */}
        <meta
          name="theme-color"
          content="#13677c"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0a1929"
          media="(prefers-color-scheme: dark)"
        />

        {/* ✅ FIXED: Removed CSP meta tag - now in next.config.mjs headers */}
        {/* CSP via meta tags ignores frame-ancestors and causes console errors */}
        {/* All security policies are now properly configured in next.config.mjs */}

        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* ✅ Open Graph Image (for social sharing) */}
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* ✅ Canonical tag for SEO */}
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"}
        />

        {/* ✅ Sitemap and robots */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* ✅ JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Prepmantras",
              url:
                process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com",
              logo: `${
                process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"
              }/logo.png`,
              sameAs: [
                "https://www.facebook.com/prepmantras",
                "https://twitter.com/prepmantras",
                "https://www.linkedin.com/company/prepmantras",
              ],
            }),
          }}
        />
      </head>

      <body
        className={`${inter.className} antialiased bg-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* ✅ Skip to main content (accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>

        {/* ✅ Providers with error boundary */}
        <Providers>
          {/* ✅ STICKY NAVBAR - Fixed at top, z-index ensures it's above content */}
          <header className="sticky top-0 z-50 w-full">
            <Navbar />
          </header>

          {/* ✅ Main content area with proper spacing for sticky navbar */}
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>

          {/* ✅ Footer - Lazy loaded (below the fold) */}
          <Footer />
        </Providers>

        {/* ✅ Analytics (if using Google Analytics) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
