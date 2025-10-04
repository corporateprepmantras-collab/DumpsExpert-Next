import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Permalink from "@/models/permalinkSchema";

// ✅ GET → Fetch all permalinks
export async function GET() {
  try {
    await connectMongoDB();
    const permalinks = await Permalink.find().sort({ pageName: 1 });
    return NextResponse.json(permalinks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT → Update all permalinks
export async function PUT(request) {
  try {
    await connectMongoDB();
    const updatedPages = await request.json();

    if (!Array.isArray(updatedPages) || updatedPages.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Update each page by name
    const updates = updatedPages.map(async (page) => {
      return await Permalink.findOneAndUpdate(
        { pageName: page.pageName },
        { slug: page.slug },
        { new: true }
      );
    });

    await Promise.all(updates);

    return NextResponse.json({ message: "Permalinks updated successfully!" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
