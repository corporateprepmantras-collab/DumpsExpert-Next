// app/api/redirects/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongo";
import Redirect from "../../../models/Redirect";

// GET all redirects
export async function GET(req) {
  await connectMongoDB();
  
  try {
    const redirects = await Redirect.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: redirects });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch redirects" },
      { status: 500 }
    );
  }
}

// POST create new redirect
export async function POST(req) {
  await connectMongoDB();
  
  try {
    const body = await req.json();
    const { fromUrl, toUrl } = body;

    // Validation
    if (!fromUrl || !toUrl) {
      return NextResponse.json(
        { success: false, error: "Both URLs are required" },
        { status: 400 }
      );
    }

    // Check if fromUrl already exists
    const existing = await Redirect.findOne({ fromUrl });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "From URL already exists" },
        { status: 400 }
      );
    }

    const redirect = await Redirect.create({ fromUrl, toUrl });
    return NextResponse.json({ success: true, data: redirect });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create redirect" },
      { status: 500 }
    );
  }
}