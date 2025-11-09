import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";

// Helper function to fetch product data
async function fetchProductForMetadata(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/get-by-slug/${slug}`,
      { 
        cache: "no-store",
        next: { revalidate: 0 }
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch product: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
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
      (cleanDescription ? cleanDescription.slice(0, 160) : "Explore SAP certification details and dumps.");

    return {
      title: product.metaTitle || `${product.title} - SAP Certification Dumps`,
      description: metaDescription,
      keywords: product.metaKeywords || "exam dumps, SAP, certification, IT dumps, practice questions, online exam",

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
    console.error("Error generating metadata:", error);
    return {
      title: "Product Details - IT Dumps",
      description: "Find details of the latest IT certification dumps and exam materials.",
    };
  }
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products = data?.data || [];

    return products
      .filter(product => product.slug && product.status === "active")
      .map((product) => ({
        slug: product.slug,
      }))
      .slice(0, 100); // Limit to top 100 products for build time
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Page Component
export default async function ProductPage({ params }) {
  const { slug } = await params;
  
  // Verify product exists before rendering
  const product = await fetchProductForMetadata(slug);
  
  if (!product || !product.title) {
    notFound();
  }

  return <ProductDetail slug={slug} />;
}

// Optional: Configure page behavior
export const dynamic = "force-dynamic"; // or "auto" for ISR
export const revalidate = 3600; // Revalidate every hour if using ISRo