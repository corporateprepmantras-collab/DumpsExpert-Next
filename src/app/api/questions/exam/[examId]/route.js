import { connectMongoDB } from "@/lib/mongo";
import mongoose from "mongoose";
import Question from "@/models/questionSchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const examObjectId = new mongoose.Types.ObjectId(params.examId);
    // ⚠️ This endpoint appears unused - kept with status filter as safety measure
    const questions = await Question.find({
      examId: examObjectId,
      status: "publish",
    });
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching questions by exam:", err.message);
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
