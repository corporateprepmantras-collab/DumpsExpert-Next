import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ProductCategory from "@/models/productCategorySchema";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function PUT(req, { params }) {
  try {
    await connectMongoDB();

    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name");
    const status = formData.get("status") || "Ready";
    const file = formData.get("image");

    const category = await ProductCategory.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    let imageUrl = category.image;
    let publicId = category.public_id;

    if (file && file.size > 0) {
      // Delete old image
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
      // Upload new image
      const uploadResult = await uploadToCloudinary(file);
      if (!uploadResult.secure_url) {
        throw new Error("Cloudinary upload failed");
      }
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    category.name = name || category.name;
    category.status = status;
    category.image = imageUrl;
    category.public_id = publicId;

    const updatedCategory = await category.save();

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();

    const { id } = await params;

    const category = await ProductCategory.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    if (category.public_id) {
      await deleteFromCloudinary(category.public_id);
    }

    await ProductCategory.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
