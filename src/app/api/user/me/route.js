import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";

import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    console.log("Route hit: /api/user/me");
    let session = await getServerSession(authOptions);
    let email = session?.user?.email;
    // Fallback: Use JWT token if session is missing (for edge/middleware parity)
    if (!email) {
      const token = await getToken({ req });
      email = token?.email;
    }
    if (!email) {
      console.error("Unauthorized: No valid session or token");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const user = await UserInfo.findOne({ email }).select(
      "-password"
    );
    if (!user) {
      console.error("User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.authUserId?.toString(), // Return authUserId as id
      userInfoId: user._id?.toString(), // Include UserInfo._id for reference
      email: user.email,
      name: user.name,
      role: user.role || "guest",
      subscription: user.subscription || "no",
      provider: user.provider,
      providerId: user.providerId,
      isVerified: user.isVerified,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      bio: user.bio,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
