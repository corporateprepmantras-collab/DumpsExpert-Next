import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";

// GET: fetch all categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await BlogCategory.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: create category (ABSOLUTELY NO LOGIC)
export async function POST(request) {
  try {
    await connectMongoDB();
    const formData = await request.formData();

    // take everything exactly as frontend sends
    const data = Object.fromEntries(formData.entries());

    const newCategory = await BlogCategory.create(data);

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
