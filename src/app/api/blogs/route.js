import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Blog from "@/models/blogSchema";
import { uploadToCloudinaryBlog } from "@/lib/cloudinary";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: blogs,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const uploadResult = await uploadToCloudinaryBlog(image);

    const blogData = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaKeywords: formData.get("metaKeywords"),
      metaDescription: formData.get("metaDescription"),
      schema: formData.get("schema") || "{}",
    };

    const blog = new Blog(blogData);
    await blog.save();

    return NextResponse.json({ data: blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
