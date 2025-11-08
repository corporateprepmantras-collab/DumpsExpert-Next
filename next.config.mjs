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
    // ✅ Add Cloudinary here
    domains: ["prepmantras.com", "via.placeholder.com", "res.cloudinary.com"],
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
        ],
      },
      {
        source: "/cart",
        headers: [
          { 
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com; frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com https://api.razorpay.com https://www.paypal.com https://*.paypal.com;"
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
              maxSize: 244000,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            ui: {
              name: "ui",
              test: /[\\/]components[\\/]ui[\\/]/,
              chunks: "all",
              priority: 30,
            },
            landing: {
              name: "landing",
              test: /[\\/]landingpage[\\/]/,
              chunks: "all",
              priority: 25,
            },
            icons: {
              name: "icons",
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              chunks: "all",
              priority: 35,
            },
            react: {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              chunks: "all",
              priority: 40,
            },
          },
        },
      };

      config.performance = { hints: false };
    }

    return config;
  },

  poweredByHeader: false,

  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,

  async generateBuildId() {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },

  productionBrowserSourceMaps: false,
};

// ✅ Correct export for .mjs file
export default nextConfig;
