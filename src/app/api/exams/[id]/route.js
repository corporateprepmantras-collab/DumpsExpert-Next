import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";

export async function GET(request, context) {
  const { params } = await context; // 👈 await lagao
  await connectMongoDB();
  try {
    let exam;
    try {
      exam = await Exam.findById(params.id)
        .populate({
          path: "examCategory",
          select: "name",
          strictPopulate: false,
        })
        .lean();
    } catch (populateError) {
      console.error("Exam populate failed (single):", populateError);
      exam = await Exam.findById(params.id).lean();
    }

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }
    return NextResponse.json(exam);
  } catch (error) {
    console.error("/api/exams/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { params } = await context; // 👈 yaha bhi
  await connectMongoDB();
  try {
    const data = await request.json();

    // Convert empty string examCategory to undefined (removes field)
    if (data.examCategory === "" || data.examCategory === null) {
      delete data.examCategory;
    }

    console.log("Updating exam with examCategory:", data.examCategory);
    const updatedExam = await Exam.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).populate({
      path: "examCategory",
      select: "name",
      strictPopulate: false,
    });

    if (!updatedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    console.log("Updated exam:", updatedExam);
    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exam" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  const { params } = await context; // 👈 aur yaha bhi
  await connectMongoDB();
  try {
    const deleted = await Exam.findByIdAndDelete(params.id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ message: "Exam deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete exam" }), {
      status: 500,
    });
  }
}
