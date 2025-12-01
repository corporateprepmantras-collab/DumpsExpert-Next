// app/api/redirects/[id]/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongo";
import Redirect from "../../../../models/Redirect";

// PUT update redirect
export async function PUT(req, { params }) {
  await connectMongoDB();
  
  try {
    const { id } = params;
    const body = await req.json();

    const redirect = await Redirect.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!redirect) {
      return NextResponse.json(
        { success: false, error: "Redirect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: redirect });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update redirect" },
      { status: 500 }
    );
  }
}

// DELETE redirect
export async function DELETE(req, { params }) {
  await connectMongoDB();
  
  try {
    const { id } = params;
    const redirect = await Redirect.findByIdAndDelete(id);

    if (!redirect) {
      return NextResponse.json(
        { success: false, error: "Redirect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: redirect });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to delete redirect" },
      { status: 500 }
    );
  }
}