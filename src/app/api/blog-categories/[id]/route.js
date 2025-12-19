import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";
import { uploadToCloudinaryBlog, deleteFromCloudinary } from "@/lib/cloudinary";

/* ===========================
   GET: Single Category
=========================== */
export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const category = await BlogCategory.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===========================
   PUT: Update Category
   (NO VALIDATION)
=========================== */
export async function PUT(request, { params }) {
  try {
    await connectMongoDB();

    const category = await BlogCategory.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    let updateData = {
      sectionName: formData.get("sectionName"),
      slug: formData.get("slug"),
      language: formData.get("language"),
      category: formData.get("category"),

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

    // Replace image ONLY if new image is sent
    if (image && typeof image === "object") {
      if (category.imagePublicId) {
        await deleteFromCloudinary(category.imagePublicId);
      }

      const uploadResult = await uploadToCloudinaryBlog(image);
      updateData.imageUrl = uploadResult?.secure_url || "";
      updateData.imagePublicId = uploadResult?.public_id || "";
    }

    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ data: updatedCategory });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===========================
   DELETE: Remove Category
=========================== */
export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();

    const category = await BlogCategory.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // delete image if exists
    if (category.imagePublicId) {
      await deleteFromCloudinary(category.imagePublicId);
    }

    await BlogCategory.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
