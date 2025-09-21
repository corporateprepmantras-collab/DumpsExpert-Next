import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Content from "@/models/Content1";
// PUT - Update content by ID
export async function PUT(req, { params }) {
  try {
    const { id } = params; // frontend se /api/content1/:id aayega
    const { html } = await req.json();

    if (!id || !html) {
      return NextResponse.json({ error: "ID and content required" }, { status: 400 });
    }

    await connectMongoDB();
    const updatedDoc = await Content.findByIdAndUpdate(
      id,
      { html },
      { new: true }
    );

    if (!updatedDoc) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
