import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// Function to generate slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces -> dashes
    .replace(/&/g, "-and-") // & -> and
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-"); // collapse multiple dashes
}

// GET: Fetch all blog categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await BlogCategory.find();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching all blog categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new blog category
export async function POST(request) {
  try {
    await connectMongoDB();
    const formData = await request.formData();

    const sectionName = formData.get("sectionName");
    const category = formData.get("category");
    const metaTitle = formData.get("metaTitle");
    const metaKeywords = formData.get("metaKeywords");
    const metaDescription = formData.get("metaDescription");
    const schema = formData.get("schema");
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Slug handling
    let slug = formData.get("slug") || generateSlug(category || sectionName);

    // Ensure slug is unique
    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // ✅ Image handling (unchanged)
    const imageUrl = formData.get("imageUrl"); 
    const imagePublicId = formData.get("imagePublicId");

    const newCategory = new BlogCategory({
      sectionName,
      category,
      slug,
      imageUrl,
      imagePublicId,
      metaTitle,
      metaKeywords,
      metaDescription,
      schema,
    });

    const saved = await newCategory.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
