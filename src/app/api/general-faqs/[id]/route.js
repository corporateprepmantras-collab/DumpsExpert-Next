import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import GeneralFAQ from "@/models/generalFAQ";

// ---------- DELETE: Remove FAQ by ID ----------
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "FAQ ID is required." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const deletedFaq = await GeneralFAQ.findByIdAndDelete(id);

    if (!deletedFaq) {
      return NextResponse.json(
        { message: "FAQ not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "FAQ deleted successfully.", deletedFaq },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete FAQ", error: err.message },
      { status: 500 }
    );
  }
}
