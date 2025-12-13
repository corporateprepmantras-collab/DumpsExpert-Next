import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongo";
import Review from "../../../models/Review";

// GET all reviews OR reviews by productId
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let reviews;

    if (productId) {
      // Reviews for specific product
      reviews = await Review.find({ productId })
        .populate("productId", "title sapExamCode sku")
        .sort({ createdAt: -1 });
    } else {
      // All reviews
      reviews = await Review.find()
        .populate("productId", "title sapExamCode sku")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}

// POST create review
export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const payload = {
      productId: body.productId || body.product_id || body.product,
      customer: body.customer || body.name || body.fullName || "",
      rating: body.rating,
      comment: body.comment || body.message || "",
      status: body.status,
    };

    // Validation
    if (!payload.productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    if (!payload.customer) {
      return NextResponse.json(
        { success: false, error: "customer is required" },
        { status: 400 }
      );
    }

    if (payload.rating == null) {
      return NextResponse.json(
        { success: false, error: "rating is required" },
        { status: 400 }
      );
    }

    const review = await Review.create(payload);

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
