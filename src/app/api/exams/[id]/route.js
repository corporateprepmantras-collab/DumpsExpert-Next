import { connectMongoDB } from "@/lib/mongo";
import Exam from "@/models/examCodeSchema";

export async function GET(request, context) {
  const { params } = await context; // 👈 await lagao
  await connectMongoDB();
  try {
    const exam = await Exam.findById(params.id);
    if (!exam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(exam), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

export async function PUT(request, context) {
  const { params } = await context; // 👈 yaha bhi
  await connectMongoDB();
  try {
    const data = await request.json();
    const updatedExam = await Exam.findByIdAndUpdate(params.id, data, {
      new: true,
    });
    if (!updatedExam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(updatedExam), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update exam" }), {
      status: 500,
    });
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
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete exam" }), {
      status: 500,
    });
  }
}
