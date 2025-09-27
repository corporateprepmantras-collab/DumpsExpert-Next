import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import BlogCategory from "@/models/blogCategorySchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    const { slug } = params;

    // find category by "category" field instead of slug
    const category = await BlogCategory.findOne({ category: slug });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // find blogs under that category
    const blogs = await Blog.find({ category: category._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ category, blogs }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching blogs by category:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
