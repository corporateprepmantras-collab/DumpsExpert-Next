import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import SiteMap from "@/models/sitemapSchema";
import { uploadToCloudinaryBlog } from "@/lib/cloudinary";

// ✅ GET → Fetch all sitemaps
export async function GET() {
  try {
    await connectMongoDB();
    const sitemaps = await SiteMap.find().sort({ createdAt: -1 });
    return NextResponse.json(sitemaps);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST → Upload new sitemap
export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinaryBlog(file);

    const newSitemap = await SiteMap.create({
      name: file.name,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
    });

    return NextResponse.json(
      { message: "Sitemap uploaded successfully", data: newSitemap },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE → Delete sitemap by ID
export async function DELETE(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sitemap ID missing" }, { status: 400 });
    }

    const sitemap = await SiteMap.findById(id);
    if (!sitemap) {
      return NextResponse.json({ error: "Sitemap not found" }, { status: 404 });
    }

    // Optional: Delete file from Cloudinary (if you want)
    // await deleteFromCloudinary(sitemap.filePublicId);

    await SiteMap.findByIdAndDelete(id);

    return NextResponse.json({ message: "Sitemap deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
