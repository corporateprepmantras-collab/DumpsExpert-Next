import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ItCertificationsContent from "@/models/ItCertificationsContent";

// PUT - Update content by ID
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { upperPara, lowerPara } = await req.json();

    if (!id || !upperPara || !lowerPara) {
      return NextResponse.json(
        { error: "ID and both paragraphs required" },
        { status: 400 },
      );
    }

    await connectMongoDB();
    const updatedDoc = await ItCertificationsContent.findByIdAndUpdate(
      id,
      { upperPara, lowerPara },
      { new: true },
    );

    if (!updatedDoc) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
