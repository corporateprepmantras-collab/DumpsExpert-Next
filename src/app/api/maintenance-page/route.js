import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Maintenance from "@/models/maintenanceSchema";
import { uploadToCloudinaryBlog } from "@/lib/cloudinary";

// ✅ GET: Fetch Maintenance Settings
export async function GET() {
  try {
    await connectMongoDB();
    let settings = await Maintenance.findOne();
    if (!settings) {
      settings = await Maintenance.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST: Create New Settings (if not exist)
export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const maintenanceMode = formData.get("maintenanceMode") === "true";
    const maintenanceText = formData.get("maintenanceText");
    const image = formData.get("image");

    let imageUrl = "";
    let imagePublicId = "";

    if (image && typeof image === "object") {
      const uploadResult = await uploadToCloudinaryBlog(image);
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const settings = new Maintenance({
      maintenanceMode,
      maintenanceText,
      imageUrl,
      imagePublicId,
    });

    await settings.save();
    return NextResponse.json(
      { message: "Created successfully", data: settings },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT: Update Existing Settings
export async function PUT(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const maintenanceMode = formData.get("maintenanceMode") === "true";
    const maintenanceText = formData.get("maintenanceText");
    const image = formData.get("image");

    let settings = await Maintenance.findOne();
    if (!settings) {
      return NextResponse.json(
        { error: "No settings found. Create first." },
        { status: 404 }
      );
    }

    if (image && typeof image === "object") {
      const uploadResult = await uploadToCloudinaryBlog(image);
      settings.imageUrl = uploadResult.secure_url;
      settings.imagePublicId = uploadResult.public_id;
    }

    settings.maintenanceMode = maintenanceMode;
    settings.maintenanceText = maintenanceText;

    await settings.save();

    return NextResponse.json({
      message: "Updated successfully",
      data: settings,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
