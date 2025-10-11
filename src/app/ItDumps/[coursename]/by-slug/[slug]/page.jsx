import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    // 🟢 Correct endpoint and correct response structure
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/get-by-slug/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Product fetch failed");

    const data = await res.json();
    const product = data?.data || {}; // ✅ fixed: use data.data not data.product

    if (!product?.title) return notFound();

    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/ItDumps/sap/by-slug/${slug}`;
    const imageUrl =
      product.imageUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/default-product.webp`;

    // 🟢 SEO Metadata Setup
    return {
      title: product.metaTitle || product.title,
      description:
        product.metaDescription ||
        product.Description?.slice(0, 150) ||
        "Explore SAP certification details and dumps.",
      keywords:
        product.metaKeywords ||
        "exam dumps, SAP, certification, IT dumps, practice questions",

      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      ),

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

      alternates: { canonical: url },
    };
  } catch (error) {
    console.error("SEO fetch failed:", error);
    return {
      title: "Product Details",
      description: "Find details of the latest products here.",
    };
  }
}

// ✅ Page Component
export default async function ProductPage({ params }) {
  const { slug } = params;
  return <ProductDetail slug={slug} />;
}
