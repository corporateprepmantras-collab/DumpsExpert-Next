import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import SEO from "@/models/seoSchema";

// ✅ GET SEO by page
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { page } = params;

    const seoData = await SEO.findOne({ page });
    if (!seoData) {
      return NextResponse.json({ message: `No SEO data found for ${page}` }, { status: 404 });
    }

    return NextResponse.json(seoData, { status: 200 });
  } catch (error) {
    console.error("❌ GET SEO Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// ✅ POST (create/update SEO for a page)
export async function POST(req, { params }) {
  try {
    await connectMongoDB();
    const { page } = params;
    const body = await req.json();

    if (!page) {
      return NextResponse.json({ error: "Page name is required" }, { status: 400 });
    }

    // upsert SEO data
    const updatedSEO = await SEO.findOneAndUpdate(
      { page },
      { page, ...body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(updatedSEO, { status: 200 });
  } catch (error) {
    console.error("❌ POST SEO Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
