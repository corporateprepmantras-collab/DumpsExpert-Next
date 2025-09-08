import { connectMongoDB } from "@/lib/mongo";
import Product from "@/models/productListSchema";
import ExamCode from "@/models/examCodeSchema";
import Question from "@/models/questionSchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { slug } = params;

    // Find product by slug
    const product = await Product.findOne({ slug });
    if (!product) {
      return new Response(
        JSON.stringify({ success: false, message: "Product not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find exam by sapExamCode
    const exam = await ExamCode.findOne({ sapExamCode: product.sapExamCode });
    if (!exam) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Exam not found for this product",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch questions for the examId, only sample questions
    const questions = await Question.find({ examId: exam._id, isSample: true });

    console.log("Fetched questions for product:", slug, questions.length);
    return new Response(JSON.stringify({ success: true, data: questions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "❌ Error fetching questions by product slug:",
      error.message
    );
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
