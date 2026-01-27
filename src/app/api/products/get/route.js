import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Product from "@/models/productListSchema";

// GET /api/products
export async function GET() {
  try {
    await connectMongoDB();
    const products = await Product.find({ publishStatus: "published" });

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
