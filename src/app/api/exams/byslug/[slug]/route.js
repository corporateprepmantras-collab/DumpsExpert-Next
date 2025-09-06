import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";
import Product from "@/models/productListSchema";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    const { slug } = await params;

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
    })
      .select(
        "name code duration sampleDuration passingScore eachQuestionMark sampleInstructions"
      )
      .lean();

    if (!exams || exams.length === 0) {
      return NextResponse.json(
        { message: "No published exams found for this product" },
        { status: 404 }
      );
    }

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Error in /api/exams/byslug/[slug]:", error);
    return NextResponse.json(
      { message: "Failed to fetch exams for slug", error: error.message },
      { status: 500 }
    );
  }
}
