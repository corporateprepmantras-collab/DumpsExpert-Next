import { NextResponse } from "next/server";
import {connectMongoDB} from "../../../../lib/mongo";
import Review from "../../../../models/Review";

export async function PUT(req, { params }) {
  await connectMongoDB();
  const body = await req.json();
  const review = await Review.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ success: true, data: review });
}

export async function DELETE(req, { params }) {
  await connectMongoDB();
  await Review.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true, message: "Deleted" });
}
