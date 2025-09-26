import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import PrivacyPolicy from "@/models/PrivacyPolicy";

// POST - Save or Update Privacy Policy Content
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

    let policyDoc = await PrivacyPolicy.findOne();

    if (policyDoc) {
      policyDoc.html = html;
      await policyDoc.save();
    } else {
      policyDoc = await PrivacyPolicy.create({ html });
    }

    return NextResponse.json({ success: true, data: policyDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve Privacy Policy Content
export async function GET() {
  try {
    await connectMongoDB();
    const policyDoc = await PrivacyPolicy.findOne();
    return NextResponse.json(policyDoc || { html: "" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
