import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Coupon from "@/models/couponSchema";

// PUT update coupon
export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    const data = await request.json();
    const updated = await Coupon.findByIdAndUpdate(params.id, data, {
      new: true,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE coupon
export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();
    await Coupon.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Coupon deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
