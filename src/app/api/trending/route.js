import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Trending from "@/models/trendingSchema";
import { serializeMongoArray, serializeMongoDoc } from "@/lib/mongoHelpers";

// ✅ GET → Fetch all trending certifications
export async function GET() {
  try {
    await connectMongoDB();
    const items = await Trending.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(serializeMongoArray(items));
  } catch (error) {
    console.error("❌ /api/trending error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST → Add new certification
export async function POST(request) {
  try {
    await connectMongoDB();
    const { categoryId, categoryName, categoryImage, text, link } =
      await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    if (!categoryName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Description text is required" },
        { status: 400 },
      );
    }

    if (!link || !link.trim()) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    // Sanitize link - remove leading/trailing slashes
    const sanitizedLink = link.replace(/^\/+|\/+$/g, "").trim();

    if (!sanitizedLink) {
      return NextResponse.json(
        { error: "Link cannot be empty after sanitization" },
        { status: 400 },
      );
    }

    const newItem = await Trending.create({
      categoryId,
      categoryName,
      categoryImage: categoryImage || "",
      text: text.trim(),
      link: sanitizedLink,
    });
    const serialized = serializeMongoDoc(newItem.toObject());

    return NextResponse.json(
      { message: "Certification added successfully", data: serialized },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ /api/trending POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE → Delete certification by ID
export async function DELETE(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID missing" }, { status: 400 });
    }

    const item = await Trending.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 },
      );
    }

    await Trending.findByIdAndDelete(id);
    return NextResponse.json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("❌ /api/trending DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
