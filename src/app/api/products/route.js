import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Product from "@/models/productListSchema";
import { uploadToCloudinaryfile, deleteFromCloudinary } from "@/lib/cloudinary";

// Helper to parse FormData
async function parseFormData(req) {
  const formData = await req.formData();
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      data[key] = value; // temporarily store File object
    } else {
      if (key === "faqs") {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = [];
        }
      } else {
        data[key] = value;
      }
    }
  }

  return data;
}

// GET /api/products
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const searchQuery = searchParams.get("q");

    if (id) {
      const product = await Product.findById(id);
      if (!product)
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      return NextResponse.json({ data: product });
    }

    // Search functionality
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      const products = await Product.find({
        $or: [
          { title: { $regex: searchRegex } },
          { sapExamCode: { $regex: searchRegex } },
          { category: { $regex: searchRegex } }
        ]
      }).limit(10).lean();
      
      return NextResponse.json({
        data: products,
        total: products.length
      });
    }

    // list
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find().skip(skip).limit(limit).lean();
    const total = await Product.countDocuments();

    return NextResponse.json({
      data: products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await parseFormData(req);

    // File uploads
    const uploads = {};
    const fileFields = ["image", "samplePdf", "mainPdf"];
    for (const field of fileFields) {
      if (data[field] && data[field].size > 0) {
        const buffer = Buffer.from(await data[field].arrayBuffer());
        const result = await uploadToCloudinaryfile(buffer);
        uploads[`${field}Url`] = result.secure_url;
      }
      delete data[field]; // Remove File object for Mongoose
    }

    const productData = { ...data, ...uploads, faqs: data.faqs || [] };
    const newProduct = new Product(productData);
    await newProduct.save();

    return NextResponse.json({ message: "Product created successfully", data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// PUT /api/products
export async function PUT(req) {
  try {
    await connectMongoDB();
    const data = await parseFormData(req);
    const id = data._id;
    if (!id) return NextResponse.json({ message: "Product ID is required" }, { status: 400 });

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    const fileFields = ["image", "samplePdf", "mainPdf"];
    const uploads = {};

    // Upload new files if present
    for (const field of fileFields) {
      if (data[field] && data[field].size > 0) {
        const oldUrl = existingProduct[`${field}Url`];
        if (oldUrl) {
          const publicId = oldUrl.split("/").pop().split(".")[0];
          await deleteFromCloudinary(publicId);
        }

        const buffer = Buffer.from(await data[field].arrayBuffer());
        const result = await uploadToCloudinaryfile(buffer);
        uploads[`${field}Url`] = result.secure_url;
      }
      delete data[field];
    }

    const updateData = { ...data, ...uploads, faqs: data.faqs || [] };
    delete updateData._id;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return NextResponse.json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// DELETE /api/products
export async function DELETE(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Product ID is required" }, { status: 400 });

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    // Delete associated files
    const fileFields = ["imageUrl", "samplePdfUrl", "mainPdfUrl"];
    for (const field of fileFields) {
      if (product[field]) {
        const publicId = product[field].split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
