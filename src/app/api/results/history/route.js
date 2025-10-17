// app/api/results/history/route.js (NEW - if you need a separate history endpoint)
import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch results for the student, sorted by latest first
    const results = await Result.find({ studentId })
      .sort({ createdAt: -1 })
      .select('-userAnswers -questions'); // Exclude large fields for list view

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error("❌ Error fetching result history:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}