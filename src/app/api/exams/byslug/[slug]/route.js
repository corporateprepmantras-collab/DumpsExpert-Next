import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";
import Product from "@/models/productListSchema";

// GET: Fetch exams by product slug
export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;
    console.log("Fetching exam for slug:", slug);

    // Find the product by slug
    const product = await Product.findOne({ slug });
    if (!product) {
      console.log("Product not found for slug:", slug);
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Find all published exams for this product
    const exams = await Exam.find({ 
      productId: product._id,
      status: "published"
    })
    .select('name code duration sampleDuration passingScore eachQuestionMark sampleInstructions')
    .lean();

    console.log("Found exams:", exams);

    if (!exams || exams.length === 0) {
      console.log("No published exams found for product:", product._id);
      return NextResponse.json(
        { message: "No published exams found for this product" },
        { status: 404 }
      );
    }

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Error in /api/exams/byslug/[slug]:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch exams for product slug",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
