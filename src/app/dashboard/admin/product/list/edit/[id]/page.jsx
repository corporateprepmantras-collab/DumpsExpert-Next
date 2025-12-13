"use client";
import { useParams } from "next/navigation";
import ProductForm from "../../ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return <ProductForm mode="edit" />;
}
