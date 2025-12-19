import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import { uploadToCloudinaryBlog, deleteFromCloudinary } from "@/lib/cloudinary";

/* ===========================
   GET: Blogs (by category optional)
=========================== */
export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = {};
    if (category) query.category = category;

    const blogs = await Blog.find(query).populate("category");

    return NextResponse.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ===========================
   PUT: Update Blog
   (NO VALIDATION)
=========================== */
export async function PUT(request, { params }) {
  try {
    await connectMongoDB();

    const blog = await Blog.findById(params.id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    let updateData = {
      title: formData.get("title"),
      content: formData.get("content"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      status: formData.get("status"),

      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),

      schema: formData.get("schema"),
    };

    // replace image ONLY if new one is sent
    if (image && typeof image === "object") {
      if (blog.imagePublicId) {
        await deleteFromCloudinary(blog.imagePublicId);
      }

      const uploadResult = await uploadToCloudinaryBlog(image);
      updateData.imageUrl = uploadResult?.secure_url || "";
      updateData.imagePublicId = uploadResult?.public_id || "";
    }

    const updatedBlog = await Blog.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    return NextResponse.json({ data: updatedBlog });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===========================
   DELETE: Remove Blog
=========================== */
export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();

    const blog = await Blog.findById(params.id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.imagePublicId) {
      await deleteFromCloudinary(blog.imagePublicId);
    }

    await Blog.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
