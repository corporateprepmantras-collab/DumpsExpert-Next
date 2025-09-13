import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";
import Product from "@/models/productListSchema";
import Review from "@/models/Review";

// ---------------- GET ----------------
export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;

    console.log("Fetching exams by product slug:", slug);

    const product = await Product.findOne({ slug: decodeURIComponent(slug) });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const exams = await Exam.find({
      productId: product._id,
      status: "published",
    }).lean();

    if (!exams || exams.length === 0) {
      return NextResponse.json(
        { message: "No published exams found for this product" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Exams retrieved successfully", data: exams },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/exams/byslug/[slug]:", error);
    return NextResponse.json(
      { message: "Failed to fetch exams for slug", error: error.message },
      { status: 500 }
    );
  }
}

// ---------------- POST ----------------
export async function POST(request, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;
    const review = await request.json();

    // Validate request body
    if (!review || !review.name || !review.comment || !review.rating) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug: decodeURIComponent(slug) });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const newReview = new Review({
      productId: product._id,
      name: review.name,
      comment: review.comment,
      rating: review.rating,
    });

    await newReview.save();

    return NextResponse.json(
      { message: "Review created successfully", data: newReview },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/exams/byslug/[slug]:", error);
    return NextResponse.json(
      { message: "Failed to create review for slug", error: error.message },
      { status: 500 }
    );
  }
}
