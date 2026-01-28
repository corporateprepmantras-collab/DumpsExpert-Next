import { connectDB } from "@/lib/mongo";
import ProductList from "@/models/productListSchema";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { examCode } = await params;

    if (!examCode) {
      return NextResponse.json(
        { data: null, message: "Exam code is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Search by exam code (SAP exam code) - case insensitive
    const product = await ProductList.findOne({
      $or: [
        { sapExamCode: { $regex: new RegExp(`^${examCode}$`, "i") } },
        { code: { $regex: new RegExp(`^${examCode}$`, "i") } },
      ],
    })
      .select(
        "_id title slug sapExamCode category imageUrl dumpsPriceInr dumpsPriceUsd",
      )
      .lean();

    if (!product) {
      return NextResponse.json(
        { data: null, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: product,
      message: "Product found by exam code",
    });
  } catch (error) {
    console.error("Error fetching product by exam code:", error);
    return NextResponse.json(
      {
        data: null,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
