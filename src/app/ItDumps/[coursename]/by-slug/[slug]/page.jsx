import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductPageLoading from "./loading";

// Helper to get the correct base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === "undefined") {
    // Check if we're in production
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Default to localhost in development
    return "http://localhost:3000";
  }
  // For client-side
  return "";
}

// Helper function to fetch product data
async function fetchProductForMetadata(slug) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/products/get-by-slug/${slug}`;

  console.log("🔍 Attempting to fetch product from:", url);
  console.log("🔍 Base URL:", baseUrl);
  console.log("🔍 Slug:", slug);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    }).catch((fetchError) => {
      console.error("❌ Fetch request failed:", fetchError.message);
      console.error(
        "❌ This usually means the API endpoint doesn't exist or the server is not running"
      );
      throw fetchError;
    });

    console.log("✅ Fetch completed with status:", res.status);

    if (!res.ok) {
      console.error(`❌ Failed to fetch product - Status: ${res.status}`);
      console.error(`❌ Status Text: ${res.statusText}`);
      console.error(`❌ URL: ${url}`);

      // Try to read the error response
      try {
        const errorText = await res.text();
        console.error(`❌ Response body:`, errorText.substring(0, 500));
      } catch (e) {
        console.error("❌ Could not read error response body");
      }
      return null;
    }

    const contentType = res.headers.get("content-type");
    console.log("✅ Content-Type:", contentType);

    if (!contentType?.includes("application/json")) {
      console.error("❌ Non-JSON response received");
      const text = await res.text();
      console.error("❌ Response:", text.substring(0, 500));
      return null;
    }

    const data = await res.json();
    console.log("✅ Product data received");
    console.log("✅ Product title:", data?.data?.title || "No title found");
    return data?.data || null;
  } catch (error) {
    console.error("❌ Error fetching product for metadata");
    console.error("❌ Error type:", error.constructor.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Full error:", error);

    // Check if it's a network error
    if (
      error.message.includes("fetch") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("❌ NETWORK ERROR: Cannot connect to API");
      console.error("❌ Make sure your API route exists at:", url);
      console.error("❌ Check that your Next.js server is running");
    }

    return null;
  }
}

// Helper function to strip HTML tags for clean metadata
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const product = await fetchProductForMetadata(slug);

    if (!product || !product.title) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${siteUrl}/ItDumps/sap/by-slug/${slug}`;
    const imageUrl = product.imageUrl || `${siteUrl}/default-product.webp`;

    // Clean description from HTML
    const cleanDescription = stripHtml(product.Description);
    const metaDescription =
      product.metaDescription ||
      (cleanDescription
        ? cleanDescription.slice(0, 160)
        : "Explore SAP certification details and dumps.");

    return {
      title: product.metaTitle || `${product.title} - SAP Certification Dumps`,
      description: metaDescription,
      keywords:
        product.metaKeywords ||
        "exam dumps, SAP, certification, IT dumps, practice questions, online exam",

      metadataBase: new URL(siteUrl),

      openGraph: {
        title: product.metaTitle || product.title,
        description: metaDescription,
        url,
        type: "website",
        siteName: "IT Dumps",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.title || "Product image",
            type: "image/webp",
          },
        ],
        locale: "en_US",
      },

      twitter: {
        card: "summary_large_image",
        title: product.metaTitle || product.title,
        description: metaDescription,
        images: [imageUrl],
        creator: "@itdumps",
      },

      alternates: {
        canonical: url,
      },

      robots: {
        index: product.status === "active",
        follow: product.status === "active",
        googleBot: {
          index: product.status === "active",
          follow: product.status === "active",
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Additional metadata for better SEO
      other: {
        "price:amount": product.dumpsPriceInr || "0",
        "price:currency": "INR",
        "product:availability": "in stock",
        "product:category": product.category || "SAP Certification",
        "product:condition": "new",
      },
    };
  } catch (error) {
    console.error("❌ Error generating metadata:", error.message);
    return {
      title: "Product Details - IT Dumps",
      description:
        "Find details of the latest IT certification dumps and exam materials.",
    };
  }
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/products`;

    console.log("🔍 Fetching products for static generation:", url);

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch products for static generation");
      return [];
    }

    const data = await res.json();
    const products = data?.data || [];

    const params = products
      .filter((product) => product.slug && product.status === "active")
      .map((product) => ({
        slug: product.slug,
      }))
      .slice(0, 100);

    console.log(`✅ Generated ${params.length} static params`);
    return params;
  } catch (error) {
    console.error("❌ Error generating static params:", error.message);
    return [];
  }
}

// Page Component with Suspense
export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Verify product exists before rendering
  const product = await fetchProductForMetadata(slug);

  if (!product || !product.title) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

// Optional: Configure page behavior
export const dynamic = "force-dynamic"; // or "auto" for ISR
export const revalidate = 3600; // Revalidate every hour if using ISR