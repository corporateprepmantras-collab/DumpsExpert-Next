import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import TrendingCategory from "@/models/trendingCategorySchema";
import TrendingProduct from "@/models/trendingProductSchema";
import { serializeMongoArray, serializeMongoDoc } from "@/lib/mongoHelpers";

// ✅ GET → Fetch all trending categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await TrendingCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(serializeMongoArray(categories));
  } catch (error) {
    console.error("❌ /api/trending-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST → Add new trending category
export async function POST(request) {
  try {
    await connectMongoDB();
    const { title, redirectLink, description, image, order, isActive } =
      await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!redirectLink || !redirectLink.trim()) {
      return NextResponse.json(
        { error: "Redirect link is required" },
        { status: 400 },
      );
    }

    // Sanitize link - remove leading/trailing slashes
    const sanitizedLink = redirectLink.replace(/^\/+|\/+$/g, "").trim();

    const newCategory = await TrendingCategory.create({
      title,
      redirectLink: sanitizedLink,
      description: description || "",
      image: image || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(serializeMongoDoc(newCategory), { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/trending-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT → Update existing trending category
export async function PUT(request) {
  try {
    await connectMongoDB();
    const { id, title, redirectLink, description, image, order, isActive } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (redirectLink !== undefined) {
      updateData.redirectLink = redirectLink.replace(/^\/+|\/+$/g, "").trim();
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await TrendingCategory.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(serializeMongoDoc(updated));
  } catch (error) {
    console.error("❌ PUT /api/trending-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE → Remove trending category and its products
export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    // Delete all products associated with this category
    await TrendingProduct.deleteMany({ trendingCategoryId: id });

    // Delete the category
    const deleted = await TrendingCategory.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Category and associated products deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/trending-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
