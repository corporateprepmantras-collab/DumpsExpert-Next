import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongo";
import Review from "../../../models/Review";

// GET all reviews OR reviews by productId
export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  let reviews;
  if (productId) {
    // Get reviews of a specific product (do not filter here so admin can access all)
    reviews = await Review.find({ productId }).sort({ createdAt: -1 });
  } else {
    // Get all reviews
    reviews = await Review.find().sort({ createdAt: -1 });
  }

  return NextResponse.json({ success: true, data: reviews });
}

// POST create review
export async function POST(req) {
  await connectMongoDB();
  try {
    const body = await req.json();

    // Normalize incoming payload: frontend sends `name`, model expects `customer`
    const payload = {
      productId: body.productId || body.product_id || body.product,
      customer: body.customer || body.name || body.fullName || "",
      rating: body.rating,
      comment: body.comment || body.message || "",
      status: body.status, // optional
    };

    // Basic validation
    if (!payload.productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    if (!payload.customer) {
      return NextResponse.json(
        { success: false, error: "customer/name is required" },
        { status: 400 }
      );
    }

    if (!payload.rating && payload.rating !== 0) {
      return NextResponse.json(
        { success: false, error: "rating is required" },
        { status: 400 }
      );
    }

    const review = await Review.create(payload);
    return NextResponse.json({ success: true, data: review });
  } catch (err) {
    console.error("Error creating review:", err);
    const message = err?.message || "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
