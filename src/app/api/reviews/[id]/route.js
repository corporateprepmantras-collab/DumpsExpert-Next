import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongo";
import Review from "../../../../models/Review";

export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const review = await Review.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
      data: deletedReview,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
