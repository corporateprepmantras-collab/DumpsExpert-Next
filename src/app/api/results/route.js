// app/api/results/[id]/route.js (NEW - for getting specific result by ID)
import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    console.log("📥 Fetching results for student:", studentId);

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "studentId is required" },
        { status: 400 }
      );
    }

    // Handle temporary student IDs
    if (studentId.startsWith('temp_')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No saved results for temporary student"
      });
    }

    const results = await Result.find({ studentId }).sort({ createdAt: -1 });

    console.log("✅ Found results:", results.length);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}