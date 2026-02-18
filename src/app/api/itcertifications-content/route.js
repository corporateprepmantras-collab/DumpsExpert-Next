import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ItCertificationsContent from "@/models/ItCertificationsContent";

// POST - Save content
export async function POST(req) {
  try {
    const { upperPara, lowerPara } = await req.json();

    if (!upperPara || !lowerPara) {
      return NextResponse.json(
        { error: "Both upper and lower paragraphs are required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // For this example, we just update or create a single content entry
    let contentDoc = await ItCertificationsContent.findOne();
    if (contentDoc) {
      contentDoc.upperPara = upperPara;
      contentDoc.lowerPara = lowerPara;
      await contentDoc.save();
    } else {
      contentDoc = await ItCertificationsContent.create({
        upperPara,
        lowerPara,
      });
    }

    return NextResponse.json({ success: true, data: contentDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve content
export async function GET() {
  try {
    await connectMongoDB();
    const contentDoc = await ItCertificationsContent.findOne();
    return NextResponse.json(contentDoc || { upperPara: "", lowerPara: "" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
