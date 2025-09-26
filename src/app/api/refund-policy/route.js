import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import RefundPolicy from "@/models/RefundPolicy";

// POST - Save or Update Refund Policy Content
export async function POST(req) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    let refundDoc = await RefundPolicy.findOne();

    if (refundDoc) {
      refundDoc.html = html;
      await refundDoc.save();
    } else {
      refundDoc = await RefundPolicy.create({ html });
    }

    return NextResponse.json({ success: true, data: refundDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve Refund Policy Content
export async function GET() {
  try {
    await connectMongoDB();
    const refundDoc = await RefundPolicy.findOne();
    return NextResponse.json(refundDoc || { html: "" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
