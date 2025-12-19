import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";
import { uploadToCloudinaryBlog } from "@/lib/cloudinary";
import { serializeMongoArray, serializeMongoDoc } from "@/lib/mongoHelpers";

/* ===========================
   GET: List Categories
=========================== */
export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = {};

    if (search) {
      query.$or = [
        { sectionName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await BlogCategory.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      data: serializeMongoArray(categories),
    });
  } catch (error) {
    console.error("❌ GET blog-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===========================
   POST: Create Category
   (NO VALIDATION)
=========================== */
export async function POST(request) {
  try {
    await connectMongoDB();
    const formData = await request.formData();

    let imageUrl = "";
    let imagePublicId = "";

    const image = formData.get("image");

    // upload ONLY if image exists
    if (image && typeof image === "object") {
      const uploadResult = await uploadToCloudinaryBlog(image);
      imageUrl = uploadResult?.secure_url || "";
      imagePublicId = uploadResult?.public_id || "";
    }

    const categoryData = {
      sectionName: formData.get("sectionName"),
      category: formData.get("category"),
      language: formData.get("language"),
      slug: formData.get("slug"),

      imageUrl,
      imagePublicId,

      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),

      schema: formData.get("schema"),

      openGraphTitle: formData.get("openGraphTitle"),
      openGraphDescription: formData.get("openGraphDescription"),
      openGraphImage: formData.get("openGraphImage"),

      twitterTitle: formData.get("twitterTitle"),
      twitterDescription: formData.get("twitterDescription"),
      twitterImage: formData.get("twitterImage"),
    };

    const category = await BlogCategory.create(categoryData);

    return NextResponse.json(
      { data: serializeMongoDoc(category.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST blog-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
