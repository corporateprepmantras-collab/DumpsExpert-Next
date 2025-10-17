// app/api/results/[id]/route.js (NEW - for getting specific result by ID)
import { connectMongoDB } from "@/lib/mongo";
import Result from "@/models/resultSchema";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Result ID is required" },
        { status: 400 }
      );
    }

    const result = await Result.findById(id);
console.log("📥 Fetched result:", result);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("❌ Error fetching result:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}