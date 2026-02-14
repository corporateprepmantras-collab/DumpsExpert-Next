import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import TrendingProduct from "@/models/trendingProductSchema";
import { serializeMongoArray, serializeMongoDoc } from "@/lib/mongoHelpers";

// ✅ GET → Fetch all trending products or by category
export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    let query = { isActive: true };
    if (categoryId) {
      query.trendingCategoryId = categoryId;
    }

    const products = await TrendingProduct.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(serializeMongoArray(products));
  } catch (error) {
    console.error("❌ /api/trending-products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST → Add new trending product
export async function POST(request) {
  try {
    await connectMongoDB();
    const {
      trendingCategoryId,
      categoryName,
      title,
      redirectLink,
      description,
      image,
      order,
      isActive,
    } = await request.json();

    if (!trendingCategoryId) {
      return NextResponse.json(
        { error: "Trending category ID is required" },
        { status: 400 },
      );
    }

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Product title is required" },
        { status: 400 },
      );
    }

    if (!redirectLink || !redirectLink.trim()) {
      return NextResponse.json(
        { error: "Redirect link is required" },
        { status: 400 },
      );
    }

    // Sanitize link - remove leading/trailing slashes
    const sanitizedLink = redirectLink.replace(/^\/+|\/+$/g, "").trim();

    const newProduct = await TrendingProduct.create({
      trendingCategoryId,
      categoryName,
      title,
      redirectLink: sanitizedLink,
      description: description || "",
      image: image || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(serializeMongoDoc(newProduct), { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/trending-products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT → Update existing trending product
export async function PUT(request) {
  try {
    await connectMongoDB();
    const { id, title, redirectLink, description, image, order, isActive } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
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

    const updated = await TrendingProduct.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serializeMongoDoc(updated));
  } catch (error) {
    console.error("❌ PUT /api/trending-products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE → Remove trending product
export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const deleted = await TrendingProduct.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/trending-products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
