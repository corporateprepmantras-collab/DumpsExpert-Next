import { connectMongoDB } from "@/lib/mongo";
import Product from "@/models/productListSchema";
import ExamCode from "@/models/examCodeSchema";
import Question from "@/models/questionSchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;

    console.log("🔎 Params:", params);

    // Find product by slug
    const product = await Product.findOne({ slug });
    if (!product) {
      return new Response(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Found product:", product);

    // Find ALL exams linked to this product
    const exams = await ExamCode.find({ productId: product._id });
    if (!exams || exams.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No exams found for this product",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Found exams:", exams.length);

    // Collect all examIds
    const examIds = exams.map((exam) => exam._id);

    // Fetch ALL questions for those examIds
    const questions = await Question.find({ examId: { $in: examIds } });

    console.log("✅ Fetched questions:", questions.length);

    return new Response(
      JSON.stringify({ success: true, data: questions }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching questions by product slug:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
