import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ProductCategory from "@/models/productCategorySchema";
import { uploadToCloudinary } from "@/lib/cloudinary";

// 📌 UPDATE category
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const formData = await req.formData();

    const updates = {
      name: formData.get("name")?.toString().trim(),
      slug: formData.get("slug")?.toString().trim() || "",
      description: formData.get("description")?.toString() || "",
      descriptionBelow: formData.get("descriptionBelow")?.toString() || "",
      metaTitle: formData.get("metaTitle")?.toString() || "",
      metaKeywords: formData.get("metaKeywords")?.toString() || "",
      metaDescription: formData.get("metaDescription")?.toString() || "",
      remarks: formData.get("remarks")?.toString() || "",
      status: formData.get("status")?.toString() || "Ready",
    };

    const file = formData.get("image");

    if (file instanceof File && file.type.startsWith("image/")) {
      const uploadResult = await uploadToCloudinary(file);
      updates.image = uploadResult.secure_url;
      updates.public_id = uploadResult.public_id;
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// 📌 DELETE category
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    const deletedCategory = await ProductCategory.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
