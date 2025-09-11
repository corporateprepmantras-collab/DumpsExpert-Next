import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import Exam from "@/models/examCodeSchema";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const {
      studentId,
      examCode,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage,
      duration,
      questions,
      userAnswers,
    } = body;

    // find exam by code (so we can attach examId)
    const exam = await Exam.findOne({ code: examCode });
    if (!exam) {
      return new Response(
        JSON.stringify({ success: false, message: "Exam not found" }),
        { status: 404 }
      );
    }

    const newResult = new Result({
      studentId,
      examId: exam._id,
      examCode,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage,
      duration,
      questions,
      userAnswers,
    });

    await newResult.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Result saved successfully",
        data: newResult,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving result:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
