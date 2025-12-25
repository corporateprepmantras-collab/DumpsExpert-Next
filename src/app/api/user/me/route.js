import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";

// GET /api/user/me
export async function GET(req) {
  try {
    console.log("Route hit: GET /api/user/me");

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      console.error("Unauthorized: No valid session");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const user = await UserInfo.findOne({ email }).select("-password");

    if (!user) {
      console.error("User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.authUserId?.toString(),
      userInfoId: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role || "guest",
      subscription: user.subscription || "no",
      provider: user.provider,
      providerId: user.providerId,
      isVerified: user.isVerified,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob,
      gender: user.gender || "",
      bio: user.bio || "",
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/me
export async function PUT(req) {
  try {
    console.log("Route hit: PUT /api/user/me");

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, gender, bio, address } = body;

    // Basic validation
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectMongoDB();

    const user = await UserInfo.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name.trim(),
          phone: phone || "",
          gender: gender || "",
          bio: bio || "",
          address: address || "",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile updated successfully for:", email);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.authUserId?.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        bio: user.bio,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
