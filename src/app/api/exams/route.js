import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";

export async function GET() {
  await connectMongoDB();
  try {
    const exams = await Exam.find();
    return new Response(JSON.stringify(exams), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch exams" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  await connectMongoDB();
  try {
    const data = await request.json();
    console.log("Received data:", data);

    const exam = await Exam.create(data);

    return new Response(JSON.stringify(exam), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating exam:", error); // 👈 isko lagao
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create exam" }),
      { status: 500 }
    );
  }
}
