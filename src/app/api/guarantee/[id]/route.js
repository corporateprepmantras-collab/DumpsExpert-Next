import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Guarantee from "@/models/Guarantee";

/**
 * GET - Fetch guarantee by ID
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;

    await connectMongoDB();

    const guarantee = await Guarantee.findById(id);

    if (!guarantee) {
      return NextResponse.json(
        { success: false, error: "Guarantee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: guarantee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update guarantee by ID
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

    const updated = await Guarantee.findByIdAndUpdate(
      id,
      { html },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Guarantee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
