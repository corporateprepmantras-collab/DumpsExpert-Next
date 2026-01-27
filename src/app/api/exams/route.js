import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";
import Question from "@/models/questionSchema";

export async function GET(req) {
  await connectMongoDB();
  try {
    const includeAll = req?.nextUrl?.searchParams?.get("all") === "true";
    const query = includeAll ? {} : { status: "published" };

    let exams;
    try {
      exams = await Exam.find(query)
        .populate({
          path: "examCategory",
          select: "name",
          strictPopulate: false,
        })
        .lean();
    } catch (populateError) {
      console.error(
        "Exam populate failed, returning without category:",
        populateError,
      );
      exams = await Exam.find(query).lean();
    }

    // ✅ Get actual question count for each exam
    const examsWithQuestionCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({
          examId: exam._id,
        });
        return { ...exam, actualQuestionCount: questionCount };
      }),
    );

    return NextResponse.json(examsWithQuestionCount);
  } catch (error) {
    console.error("/api/exams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  await connectMongoDB();
  try {
    const data = await request.json();
    console.log("Received data:", data);

    // Convert empty string examCategory to undefined
    if (data.examCategory === "" || data.examCategory === null) {
      delete data.examCategory;
    }

    console.log("Creating exam with examCategory:", data.examCategory);
    const exam = await Exam.create(data);
    console.log("Created exam:", exam);

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create exam" },
      { status: 500 },
    );
  }
}
