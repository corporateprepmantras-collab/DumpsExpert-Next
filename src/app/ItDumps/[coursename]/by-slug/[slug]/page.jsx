import ProductDetail from "./ProductDetail";

// ✅ Dynamic SEO using generateMetadata
export async function generateMetadata({ params }) {
  try {
    // Fetch product for SEO
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${params.id}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    const product = data?.product || {};

    // ✅ Build SEO metadata dynamically
    return {
      title: product.metaTitle || product.title || "Product Details",
      description:
        product.metaDescription ||
        product.Description?.slice(0, 150) ||
        "Get detailed information about this product.",
      keywords: product.metaKeywords || "",
      openGraph: {
        title: product.seoTitle || product.title,
        description: product.seoDescription || product.Description,
        images: [
          {
            url: product.imageUrl || "/default-product.webp",
            width: 800,
            height: 600,
            alt: product.title || "Product image",
          },
        ],
        type: "product",
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${params.id}`,
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

// ✅ Server Component (renders ProductDetail as client component)
export default function ProductPage({ params }) {
  return <ProductDetail productId={params.id} />;
}
