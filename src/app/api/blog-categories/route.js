import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";
import { uploadToCloudinaryBlog } from "@/lib/cloudinary";
import { serializeMongoArray, serializeMongoDoc } from "@/lib/mongoHelpers";

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

    return NextResponse.json({ data: serializeMongoArray(categories) });
  } catch (error) {
    console.error("❌ /api/blogs/blog-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const slug = formData.get("slug");
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Invalid slug format. Use only lowercase letters, numbers, and hyphens.",
        },
        { status: 400 }
      );
    }

    const uploadResult = await uploadToCloudinaryBlog(image);

    const categoryData = {
      sectionName: formData.get("sectionName"),
      category: formData.get("category"),
      language: formData.get("language"),
      slug,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),
      schema: formData.get("schema") || "{}",
      openGraphTitle: formData.get("openGraphTitle") || "",
      openGraphDescription: formData.get("openGraphDescription") || "",
      openGraphImage: formData.get("openGraphImage") || "",
      twitterTitle: formData.get("twitterTitle") || "",
      twitterDescription: formData.get("twitterDescription") || "",
      twitterImage: formData.get("twitterImage") || "",
    };

    const category = new BlogCategory(categoryData);
    await category.save();

    return NextResponse.json(
      { data: serializeMongoDoc(category.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ /api/blogs/blog-categories POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
