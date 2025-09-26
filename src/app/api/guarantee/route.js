import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Guarantee from "@/models/Guarantee";

// POST - Save or Update Guarantee Content
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

    // Find existing guarantee page
    let guaranteeDoc = await Guarantee.findOne();

    if (guaranteeDoc) {
      guaranteeDoc.html = html;
      await guaranteeDoc.save();
    } else {
      guaranteeDoc = await Guarantee.create({ html });
    }

    return NextResponse.json({ success: true, data: guaranteeDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve Guarantee Content
export async function GET() {
  try {
    await connectMongoDB();
    const guaranteeDoc = await Guarantee.findOne();
    return NextResponse.json(guaranteeDoc || { html: "" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
