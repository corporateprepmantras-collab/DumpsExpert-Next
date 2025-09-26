import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Terms from "@/models/Terms";

// POST - Save or Update Terms & Conditions Content
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

    // Find existing terms page
    let termsDoc = await Terms.findOne();

    if (termsDoc) {
      termsDoc.html = html;
      await termsDoc.save();
    } else {
      termsDoc = await Terms.create({ html });
    }

    return NextResponse.json({ success: true, data: termsDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve Terms & Conditions Content
export async function GET() {
  try {
    await connectMongoDB();
    const termsDoc = await Terms.findOne();
    return NextResponse.json(termsDoc || { html: "" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
