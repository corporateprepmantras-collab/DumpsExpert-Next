// app/api/results/save/route.js
import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import Exam from "@/models/examCodeSchema";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    console.log("📥 Received result data:", body);

    const {
      studentId,
      examCode,
      examId,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage,
      duration,
      questions,
      userAnswers,
    } = body;

    // Validate required fields
    if (!studentId || !examCode) {
      console.error("❌ Missing required fields:", { studentId, examCode });
      return new Response(
        JSON.stringify({
          success: false,
          message: "studentId and examCode are required",
        }),
        { status: 400 }
      );
    }

    // Handle temporary student IDs
    let finalStudentId = studentId;
    let isTempStudent = false;

    if (studentId.startsWith("temp_")) {
      isTempStudent = true;
      console.log("👤 Using temporary student ID");
    }

    // Find exam by code or use provided examId
    let exam = null;
    if (examId && !examId.startsWith("temp_exam_")) {
      exam = await Exam.findById(examId);
    }

    if (!exam) {
      exam = await Exam.findOne({
        $or: [{ code: examCode }, { slug: examCode }, { _id: examId }],
      });
    }

    if (!exam) {
      console.log("📝 Creating temporary exam record");
      exam = {
        _id: examId || `temp_exam_${examCode}`,
        code: examCode,
        name: `Exam: ${examCode}`,
      };
    }

    // Count and determine attempt number for real students
    let attemptNumber = 1;

    if (!isTempStudent) {
      // Find the last saved result for this student & exam
      const lastResult = await Result.findOne({ studentId, examCode })
        .sort({ attempt: -1 }) // highest attempt first
        .select("attempt");

      if (lastResult) {
        attemptNumber = lastResult.attempt + 1;
      } else {
        attemptNumber = 1;
      }

      // ✅ Limit to max 4 attempts
      if (attemptNumber > 4) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Maximum 4 attempts allowed for this exam",
          }),
          { status: 400 }
        );
      }
    }

    // Create result object
    const resultData = {
      studentId: finalStudentId,
      examId: exam._id,
      examCode,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage: parseFloat(percentage),
      duration,
      questions,
      userAnswers,
      attempt: attemptNumber,
      isTempStudent,
    };

    // Save to database only for real students
    let savedResult;
    if (!isTempStudent) {
      savedResult = new Result(resultData);
      await savedResult.save();
      console.log("✅ Result saved to database:", savedResult._id);
    } else {
      // For temp students, create a mock result
      savedResult = {
        ...resultData,
        _id: `temp_result_${Date.now()}`,
        createdAt: new Date(),
        isTemp: true,
      };
      console.log("✅ Temporary result created (not saved to DB)");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Result processed successfully",
        attempt: attemptNumber,
        data: savedResult,
        isTempStudent,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving result:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      { status: 500 }
    );
  }
}

// GET method to fetch results
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const examCode = searchParams.get("examCode");

    if (!studentId) {
      return new Response(
        JSON.stringify({ success: false, message: "studentId is required" }),
        { status: 400 }
      );
    }

    let query = { studentId };
    if (examCode) {
      query.examCode = examCode;
    }

    const results = await Result.find(query).sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
