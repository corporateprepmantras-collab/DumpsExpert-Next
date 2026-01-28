import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductPageLoading from "./loading";

// Helper to get the correct base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === "undefined") {
    // In production, use the environment variable or construct from headers
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // In Vercel, use VERCEL_URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Default to localhost in development
    return "http://localhost:3000";
  }
  // For client-side, use relative URLs
  return "";
}

// Helper function to fetch product data
async function fetchProductForMetadata(slug) {
  const baseUrl = getBaseUrl();

  console.log("🔍 Fetching product for slug:", slug);
  console.log("🔍 Base URL:", baseUrl);

  try {
    // First, try fetching by slug
    let url = `${baseUrl}/api/products/get-by-slug/${slug}`;
    console.log("🔍 Attempting slug fetch from:", url);

    let res = await fetch(url, {
      next: { revalidate: 1800 },
      cache: "no-store", // Force fresh data on server
    });

    console.log("✅ Slug fetch status:", res.status);

    // If slug lookup fails (404), try exam code lookup
    if (res.status === 404) {
      console.log("⚠️ Slug not found, trying exam code lookup...");
      url = `${baseUrl}/api/products/get-by-exam-code/${slug}`;
      console.log("🔍 Attempting exam code fetch from:", url);

      res = await fetch(url, {
        next: { revalidate: 1800 },
        cache: "no-store",
      });

      console.log("✅ Exam code fetch status:", res.status);
    }

    // If still not OK, return null
    if (!res.ok) {
      console.error(`❌ Failed to fetch product - Status: ${res.status}`);
      try {
        const errorText = await res.text();
        console.error(`❌ Response:`, errorText.substring(0, 200));
      } catch (e) {
        console.error("❌ Could not read error response");
      }
      return null;
    }

    const data = await res.json();
    console.log("✅ Product found:", data?.data?.title || "Unknown");
    return data?.data || null;
  } catch (error) {
    console.error("❌ Error fetching product:", error.message);
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

    // ADD THIS: Fetch reviews for aggregate rating
    let aggregateRating = null;
    try {
      const reviewsRes = await fetch(
        `${getBaseUrl()}/api/reviews?productId=${product._id}`,
        {
          next: { revalidate: 3600 },
        },
      );
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const reviews = reviewsData.data || [];

        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = (totalRating / reviews.length).toFixed(1);

          aggregateRating = {
            ratingValue: avgRating,
            reviewCount: reviews.length,
            bestRating: "5",
            worstRating: "1",
          };
        }
      }
    } catch (reviewError) {
      console.error("❌ Error fetching reviews for metadata:", reviewError);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${siteUrl}/ItDumps/sap/${slug}`;
    const imageUrl = product.imageUrl || `${siteUrl}/default-product.webp`;

    // Clean description from HTML
    const cleanDescription = stripHtml(product.Description);
    const metaDescription =
      product.metaDescription ||
      (cleanDescription
        ? cleanDescription.slice(0, 160)
        : "Explore SAP certification details and dumps.");

    // UPDATE THIS: Add structured data with reviews
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: metaDescription,
      image: imageUrl,
      sku: product.sku || product.sapExamCode,
      brand: {
        "@type": "Brand",
        name: "IT Dumps",
      },
      offers: {
        "@type": "Offer",
        url: url,
        priceCurrency: "INR",
        price: product.dumpsPriceInr || "0",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "IT Dumps",
        },
      },
    };

    // Add aggregate rating if reviews exist
    if (aggregateRating) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating,
        worstRating: aggregateRating.worstRating,
      };
    }

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

      // ADD THIS: Include structured data script
      other: {
        "price:amount": product.dumpsPriceInr || "0",
        "price:currency": "INR",
        "product:availability": "in stock",
        "product:category": product.category || "SAP Certification",
        "product:condition": "new",
      },

      // ADD THIS: Inject structured data
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ],
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
      .slice(0, 50); // Reduced for faster builds

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

  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

// Configure page behavior for better performance
export const dynamic = "auto"; // Enable ISR
export const revalidate = 1800; // Revalidate every 30 minutes
