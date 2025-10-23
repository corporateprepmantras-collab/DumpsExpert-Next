import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Trending from "@/models/trendingSchema";

// ✅ GET → Fetch all trending certifications
export async function GET() {
  try {
    await connectMongoDB();
    const items = await Trending.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST → Add new certification
export async function POST(request) {
  try {
    await connectMongoDB();
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newItem = await Trending.create({ title });
    return NextResponse.json(
      { message: "Certification added successfully", data: newItem },
      { status: 201 }
    );
  } catch (error) {
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
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    }

    await Trending.findByIdAndDelete(id);
    return NextResponse.json({ message: "Certification deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
