import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    // 👇 Fetch using slug (not id)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/by-slug/${params.slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Product fetch failed");
    const data = await res.json();
    const product = data?.product || {};

    if (!product?.title) return notFound();

    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/ItDumps/sap/by-slug/${params.slug}`;
    const imageUrl = product.imageUrl || "/default-product.webp";

    return {
      title: product.metaTitle || product.title || "Product Details",
      description:
        product.metaDescription ||
        product.Description?.slice(0, 150) ||
        "Get detailed information about this product.",
      keywords:
        product.metaKeywords || "exam dumps, SAP, certification, IT dumps",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: product.metaTitle || product.title,
        description:
          product.metaDescription ||
          product.Description?.slice(0, 150) ||
          "Explore SAP certification details and dumps.",
        url,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.title || "Product image",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.metaTitle || product.title,
        description: product.metaDescription || product.Description,
        images: [imageUrl],
      },
      other: {
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: imageUrl,
          description: product.metaDescription || product.Description,
          brand: {
            "@type": "Brand",
            name: "PrepMantras",
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: product.price || "0",
            availability: "https://schema.org/InStock",
            url,
          },
        }),
      },
    };
  } catch (error) {
    console.error("SEO fetch failed:", error);
    return {
      title: "Product Details",
      description: "Find details of the latest products here.",
    };
  }
}

export default function ProductPage({ params }) {
  return <ProductDetail slug={params.slug} />;
}
