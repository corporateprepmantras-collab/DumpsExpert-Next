import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ProductCategory from "@/models/productCategorySchema";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// 📌 PUT - Update category by ID
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Find existing category
    const existingCategory = await ProductCategory.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    // ✅ Extract fields
    const name = formData.get("name")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim() || "";
    const description = formData.get("description")?.toString() || "";
    const descriptionBelow = formData.get("descriptionBelow")?.toString() || "";
    const metaTitle = formData.get("metaTitle")?.toString() || "";
    const metaKeywords = formData.get("metaKeywords")?.toString() || "";
    const metaDescription = formData.get("metaDescription")?.toString() || "";
    const remarks = formData.get("remarks")?.toString() || "";
    const status = formData.get("status")?.toString().trim() || "Ready";
    const file = formData.get("image");

    // ✅ Parse FAQs from JSON string
    let faqs = existingCategory.faqs || [];
    const faqsString = formData.get("faqs");
    if (faqsString) {
      try {
        faqs = JSON.parse(faqsString);
        // Filter out empty FAQs
        faqs = faqs.filter((faq) => faq.question?.trim() && faq.answer?.trim());
      } catch (error) {
        console.error("FAQ parsing error:", error);
        return NextResponse.json(
          { message: "Invalid FAQ format" },
          { status: 400 }
        );
      }
    }

    // ✅ Validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!["Ready", "Publish", "Unpublish"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // ✅ Handle image upload/update
    let imageUrl = existingCategory.image;
    let publicId = existingCategory.public_id;

    if (file instanceof File && file.type.startsWith("image/")) {
      // Delete old image if exists
      if (existingCategory.public_id) {
        try {
          await deleteFromCloudinary(existingCategory.public_id);
        } catch (error) {
          console.error("Failed to delete old image:", error);
        }
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(file);
      if (!uploadResult.secure_url || !uploadResult.public_id) {
        throw new Error("Cloudinary upload failed");
      }
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // ✅ Update category
    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        descriptionBelow,
        metaTitle,
        metaKeywords,
        metaDescription,
        remarks,
        status,
        image: imageUrl,
        public_id: publicId,
        faqs, // ✅ Include FAQs
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// 📌 DELETE - Delete category by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await ProductCategory.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (category.public_id) {
      try {
        await deleteFromCloudinary(category.public_id);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    await ProductCategory.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
