import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import RefundPolicy from "@/models/RefundPolicy";

// GET refund policy by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    await connectMongoDB();

    const refund = await RefundPolicy.findById(id);

    if (!refund) {
      return NextResponse.json(
        { error: "Refund Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: refund });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT refund policy by ID
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updatedRefund = await RefundPolicy.findByIdAndUpdate(
      id,
      { html },
      { new: true }
    );

    if (!updatedRefund) {
      return NextResponse.json(
        { error: "Refund Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRefund,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
