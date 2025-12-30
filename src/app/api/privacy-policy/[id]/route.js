import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import PrivacyPolicy from "@/models/PrivacyPolicy";

/**
 * GET - Fetch privacy policy by ID
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;

    await connectMongoDB();

    const policy = await PrivacyPolicy.findById(id);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: "Privacy policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update privacy policy by ID
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      { html },
      { new: true }
    );

    if (!updatedPolicy) {
      return NextResponse.json(
        { success: false, error: "Privacy policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedPolicy });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
