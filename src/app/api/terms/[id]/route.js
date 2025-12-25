import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Terms from "@/models/Terms";

// GET terms by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    await connectMongoDB();

    const terms = await Terms.findById(id);

    if (!terms) {
      return NextResponse.json({ error: "Terms not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: terms });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT – Update terms by ID
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

    const updatedTerms = await Terms.findByIdAndUpdate(
      id,
      { html },
      { new: true }
    );

    if (!updatedTerms) {
      return NextResponse.json({ error: "Terms not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedTerms,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
