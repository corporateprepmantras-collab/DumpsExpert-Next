/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Compress responses
  compress: true,

  // Optimize font loading
  optimizeFonts: true,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "prepmantras.com",
          },
        ],
        destination: "https://www.prepmantras.com/:path*",
        permanent: true,
      },
    ];
  },

  // Add security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "prepmantras.com",
      },
      {
        protocol: "https",
        hostname: "www.prepmantras.com",
      },
    ],
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "lucide-react",
      "@/components/ui",
      "framer-motion",
    ],
    optimizeServerReact: true,
  },

  // Performance optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize chunks for faster loading
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: "framework",
              chunks: "all",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                )?.[1];
                return `npm.${packageName?.replace("@", "")}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  swcMinify: true,
  compress: true,

  async headers() {
    return [
      // ✅ Static assets caching
      {
        source: "/api/auth/session",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },

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
            value: "no-store",
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

              // ✅ REQUIRED FOR NEXTAUTH + GOOGLE + PAYMENTS
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://checkout.razorpay.com https://*.razorpay.com https://js.razorpay.com https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://vercel.live https://*.vercel.app https://va.vercel-scripts.com https://*.vercel-scripts.com",

              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://*.vercel.app https://dumps-expert-next.vercel.app",

              "img-src 'self' data: https: blob:",

              "font-src 'self' data:",

              // 🔥 MOST IMPORTANT - Added ipapi.co for currency detection
              "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://ipapi.co https://*.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.paypal.com https://vercel.live https://*.vercel.app https://vitals.vercel-insights.com https://*.vercel-insights.com",

              "frame-src 'self' https://accounts.google.com https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com https://www.paypal.com https://*.paypal.com https://vercel.live",

              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com https://checkout.razorpay.com https://www.paypal.com",
            ].join("; "),
          },
        ],
      },

      // ✅ Cart page specific CSP (with enhanced permissions)
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

              // Currency detection + payment gateways
              "connect-src 'self' https://ipapi.co https://*.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.paypal.com https://vercel.live https://*.vercel.app https://vitals.vercel-insights.com https://*.vercel-insights.com",

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
