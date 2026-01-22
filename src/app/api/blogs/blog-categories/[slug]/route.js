import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import BlogCategory from "@/models/blogCategorySchema";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    const { slug } = params;

    // Normalize incoming slug (e.g., "web-development")
    const formattedSlug = String(slug || "")
      .trim()
      .toLowerCase()
      .replace(/-/g, " ");

    // Try to find a matching category by name or by slug
    const category =
      (await BlogCategory.findOne({
        $or: [
          { category: { $regex: new RegExp(`^${formattedSlug}$`, "i") } },
          { slug: { $regex: new RegExp(`^${slug}$`, "i") } },
        ],
      })) || null;

    if (!category) {
      return NextResponse.json(
        { error: `Category '${slug}' not found` },
        { status: 404 }
      );
    }

    // Build a flexible query to match blogs that reference the category in various shapes
    const possibleValues = [
      String(category._id),
      category.slug,
      category.category,
    ]
      .filter(Boolean)
      .map((v) => (typeof v === "string" ? v : String(v)));

    const blogs = await Blog.find({
      $or: [
        { category: category._id },
        { categorySlug: { $in: possibleValues } },
        { category: { $in: possibleValues } },
        { categories: { $in: possibleValues } },
      ],
    })
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
