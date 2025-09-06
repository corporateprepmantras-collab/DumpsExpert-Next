import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import { uploadToCloudinaryBlog, deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(request,  context) {
  try {
    const { params } = await context;
    await connectMongoDB();
    const blog = await Blog.findById({ _id: params.id });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ data: blog });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { params } = context;
    await connectMongoDB();

    const blog = await Blog.findById({ _id: params.id });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    let updateData = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),
      schema: formData.get("schema") || "{}",
    };

    if (image && image.name !== "undefined") {
      if (blog.imagePublicId) {
        await deleteFromCloudinary(blog.imagePublicId);
      }

      const uploadResult = await uploadToCloudinaryBlog(image);
      updateData.imageUrl = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    return NextResponse.json({ data: updatedBlog });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context;
    await connectMongoDB();
    const blog = await Blog.findById({ _id: params.id });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.imagePublicId) {
      await deleteFromCloudinary(blog.imagePublicId);
    }

    await Blog.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
