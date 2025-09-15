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
    // Get reviews of a specific product
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
  const body = await req.json();
  const review = await Review.create(body);
  return NextResponse.json({ success: true, data: review });
}
