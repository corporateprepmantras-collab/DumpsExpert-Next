import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogList from "@/models/blogSchema";

// GET: Fetch a blog post by slug
export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    const rawSlug = params.slug;

    // Try several strategies to locate the blog by slug:
    // 1. Exact match
    // 2. Decoded value
    // 3. Normalized slug (lowercase, spaces -> hyphens, remove invalid chars)
    // 4. Case-insensitive regex match on normalized
    const tryFind = async (value) => {
      if (!value && value !== 0) return null;
      // direct exact match
      let found = await BlogList.findOne({ slug: value, status: "publish" });
      if (found) return found;

      // try _id match
      try {
        found = await BlogList.findOne({ _id: value, status: "publish" });
        if (found) return found;
      } catch (e) {
        // ignore invalid ObjectId
      }

      return null;
    };

    let blog = await tryFind(rawSlug);

    if (!blog) {
      try {
        const decoded = decodeURIComponent(rawSlug);
        blog = await tryFind(decoded);
      } catch (e) {
        // ignore decode errors
      }
    }

    if (!blog) {
      // normalize and try again
      const normalize = (s) =>
        String(s || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "");

      const normalized = normalize(rawSlug);
      if (normalized) {
        blog = await BlogList.findOne({ slug: normalized, status: "publish" });
        if (!blog) {
          // case-insensitive regex as a last resort
          blog = await BlogList.findOne({
            slug: { $regex: `^${normalized}$`, $options: "i" },
            status: "publish",
          });
        }
      }
    }

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Blog retrieved successfully",
        data: blog,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving blog by slug:", error);
    return NextResponse.json(
      {
        message: "Server error while retrieving blog",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
