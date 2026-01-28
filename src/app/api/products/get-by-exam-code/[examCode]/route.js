import { connectDB } from "@/lib/mongo";
import ProductList from "@/models/productListSchema";

export async function GET(req, { params }) {
  try {
    const { examCode } = params;

    // Connect to database
    await connectDB();

    // Search by exam code (SAP exam code)
    const product = await ProductList.findOne({
      $or: [
        { sapExamCode: examCode },
        { sapExamCode: { $regex: `^${examCode}$`, $options: "i" } },
        { code: examCode },
        { code: { $regex: `^${examCode}$`, $options: "i" } },
      ],
    }).select(
      "_id title slug sapExamCode category imageUrl dumpsPriceInr dumpsPriceUsd",
    );

    if (!product) {
      return Response.json(
        { data: null, message: "Product not found" },
        { status: 404 },
      );
    }

    return Response.json({
      data: product,
      message: "Product found by exam code",
    });
  } catch (error) {
    console.error("Error fetching product by exam code:", error);
    return Response.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
