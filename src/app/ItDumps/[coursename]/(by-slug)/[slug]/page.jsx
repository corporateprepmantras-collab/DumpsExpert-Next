import ProductDetail from "./ProductDetail";
import { Suspense } from "react";
import ProductPageLoading from "./loading";

// Simplified page - let client component handle everything
export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductDetail />
    </Suspense>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

// Configure page behavior for better performance
export const dynamic = "auto"; // Enable ISR
export const revalidate = 1800; // Revalidate every 30 minutes
