import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import ProductCategory from "@/models/productCategorySchema";
import { uploadToCloudinary } from "@/lib/cloudinary";

// 📌 GET all categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await ProductCategory.find().lean();

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// 📌 POST - Create new category with image upload
export async function POST(req) {
  try {
    await connectMongoDB();

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

    // ✅ Validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!["Ready", "Publish"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // ✅ Upload image if provided
    let imageUrl = "";
    let publicId = "";
    if (file instanceof File && file.type.startsWith("image/")) {
      const uploadResult = await uploadToCloudinary(file);
      if (!uploadResult.secure_url || !uploadResult.public_id) {
        throw new Error("Cloudinary upload failed");
      }
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // ✅ Save to MongoDB
    const newCategory = new ProductCategory({
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
    });

    const savedCategory = await newCategory.save();
    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
