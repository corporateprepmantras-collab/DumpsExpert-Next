// app/api/results/route.js
import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import Exam from "@/models/examCodeSchema";

// ✅ POST /api/results — Save result with attempt count
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

    if (!studentId || !examCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "studentId and examCode are required",
        }),
        { status: 400 }
      );
    }

    // Find exam by code
const exam = await Exam.findOne({ $or: [{ code: examCode }, { slug: examCode }] });
    if (!exam) {
      return new Response(
        JSON.stringify({ success: false, message: "Exam not found" }),
        { status: 404 }
      );
    }

    // Count previous attempts
    const existingAttempts = await Result.countDocuments({
      studentId,
      examCode,
    });

    // Create new result with attempt number
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
      attempt: existingAttempts + 1,
    });

    await newResult.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Result saved successfully",
        attempt: existingAttempts + 1,
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

// ✅ GET /api/results/[studentId] — Fetch result history
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return new Response(
        JSON.stringify({ success: false, message: "studentId is required" }),
        { status: 400 }
      );
    }

    const results = await Result.find({ studentId }).sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, data: results }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
