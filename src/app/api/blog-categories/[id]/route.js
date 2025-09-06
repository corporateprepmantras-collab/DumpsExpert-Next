import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import BlogCategory from "@/models/blogCategorySchema";
import { uploadToCloudinaryBlog, deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(request, context) {
  try {
    const { params } = await context;
    await connectMongoDB();

    const category = await BlogCategory.findOne({ _id: params.id });

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

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();

    const category = await BlogCategory.findOne({ _id: params.id });

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
      category: formData.get("category"),
      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),
      schema: formData.get("schema") || "{}",
    };

    if (image && image.name !== "undefined") {
      if (category.imagePublicId) {
        await deleteFromCloudinary(category.imagePublicId);
      }

      const uploadResult = await uploadToCloudinaryBlog(image);
      updateData.imageUrl = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
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

export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();

    const category = await BlogCategory.findOne({ _id: params.id });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category.imagePublicId) {
      await deleteFromCloudinary(category.imagePublicId);
    }

    await BlogCategory.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
