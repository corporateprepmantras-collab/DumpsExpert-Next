import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import BlogCategory from "@/models/blogCategorySchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    const { slug } = params;

    // Convert URL slug (e.g., "web-development") to readable category name
    const formattedSlug = slug.replace(/-/g, " ").toLowerCase();

    // Find category by normalized name
    const category = await BlogCategory.findOne({
      category: { $regex: new RegExp(`^${formattedSlug}$`, "i") },
    });

    if (!category) {
      return NextResponse.json(
        { error: `Category '${slug}' not found` },
        { status: 404 }
      );
    }

    // Fetch all blogs under this category
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
