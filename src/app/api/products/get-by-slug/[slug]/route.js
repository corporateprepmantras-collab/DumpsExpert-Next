import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Product from "@/models/productListSchema";
import Review from "@/models/Review";
// GET: Fetch a product by slug
export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const product = await Product.findOne({ slug: params.slug })
      .populate("lastUpdatedBy", "name email")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found with this slug" },
        { status: 404 }
      );
    }
    const reviews = await Review.find({
      productId: product._id,
      status: "Publish",
    });

    product.reviews = reviews;
    console.log(reviews);
    return NextResponse.json(
      { message: "Product retrieved successfully by slug", data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;
    const review = await request.json();

    // Validate request body
    if (!review || !review.customer || !review.comment || !review.rating) {
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
      customer: review.customer,
      comment: review.comment,
      rating: review.rating,
    });
    console.log(newReview);

    await newReview.save();

    return NextResponse.json(
      { message: "Review created successfully", data: newReview },
      { status: 201 }
    );
  } catch (error) { 
    return NextResponse.json(
      { message: "Failed to create review for slug", error: error.message },
      { status: 500 }
    );
  }
}