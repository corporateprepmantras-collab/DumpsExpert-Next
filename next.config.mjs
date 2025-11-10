/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      "prepmantras.com",
      "dumps-expert-next.vercel.app",
      "via.placeholder.com",
      "res.cloudinary.com",
    ],
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "lucide-react",
      "@/components/ui",
      "framer-motion",
    ],
    serverActions: true,
  },

  swcMinify: true,
  compress: true,

  async headers() {
    return [
      // ✅ Static assets caching
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff|woff2|ttf|otf|eot)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ API route caching
      {
        source: "/api/trending",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/seo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/blogs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/products",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/product-categories",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=900, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/general-faqs",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=900, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/content:number",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=900, stale-while-revalidate=1800",
          },
        ],
      },
      {
        source: "/api/announcement",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },

      // ✅ Global CSP for all pages
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://js.razorpay.com https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://vercel.live https://*.vercel.app https://va.vercel-scripts.com https://*.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://*.vercel.app https://dumps-expert-next.vercel.app",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.paypal.com https://vercel.live https://*.vercel.app https://vitals.vercel-insights.com https://*.vercel-insights.com",
              "frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com https://www.paypal.com https://*.paypal.com https://vercel.live",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self' https://checkout.razorpay.com https://www.paypal.com",
            ].join("; "),
          },
        ],
      },

      // ✅ Cart page specific CSP
      {
        source: "/cart",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://js.razorpay.com https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://vercel.live https://*.vercel.app https://*.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://*.vercel.app https://dumps-expert-next.vercel.app",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.razorpay.com https://api.razorpay.com https://*.paypal.com https://vercel.live https://*.vercel-insights.com",
              "frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com https://www.paypal.com https://*.paypal.com https://vercel.live",
              "frame-ancestors 'self' https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self' https://checkout.razorpay.com https://www.paypal.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    // 🔥 REMOVED: Problematic custom optimization that breaks CSS
    // Let Next.js handle optimization by default

    return config;
  },

  poweredByHeader: false,

  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,

  async generateBuildId() {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },

  productionBrowserSourceMaps: false,
};

export default nextConfig;
