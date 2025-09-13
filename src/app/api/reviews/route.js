import { NextResponse } from "next/server";
import {connectMongoDB} from "../../../lib/mongo";
import Review from "../../../models/Review";

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "ProductId required" },
      { status: 400 }
    );
  }

  const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
  console.log(reviews)
  return NextResponse.json({ success: true, data: reviews });
}

export async function POST(req) {
  await connectMongoDB();
  const body = await req.json();
  const review = await Review.create(body);
  return NextResponse.json({ success: true, data: review });
}
