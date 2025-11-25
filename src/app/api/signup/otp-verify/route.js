import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import OTP from "@/models/otpSchema";
import UserInfo from "@/models/userInfoSchema";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, password, name } = await request.json();

    // Validation
    if (!email || !otp || !password || !name) {
      return NextResponse.json(
        { message: "Email, OTP, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { message: "OTP must be a 6-digit number" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Check OTP expiration
    if (Date.now() > new Date(otpRecord.otpExpires).getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const mongoose = require("mongoose");

    const authUserModel =
      mongoose.models.authUsers ||
      mongoose.model(
        "authUsers",
        new mongoose.Schema(
          {
            email: { type: String, required: true, unique: true },
            name: { type: String },
            image: { type: String },
            emailVerified: { type: Date },
          },
          { collection: "authUsers" }
        )
      );

    // Create or update authUser with upsert
    const authUser = await authUserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: name.trim(),
          image: "",
          emailVerified: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update user info with upsert
    const user = await UserInfo.findOneAndUpdate(
      { email },
      {
        $set: {
          authUserId: authUser._id,
          email,
          name: name.trim(),
          password: hashedPassword,
          isVerified: true,
          role: "guest",
          subscription: "no",
          provider: "credentials",
          providerId: "",
          phone: "",
          address: "",
          bio: "",
          profileImage: "",
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Delete OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Determine redirect path based on role and subscription
    let dashboardPath = "/dashboard/guest";
    if (user.role === "admin") dashboardPath = "/dashboard/admin";
    else if (user.subscription === "yes") dashboardPath = "/dashboard/student";

    return NextResponse.json({
      message: "Email verified successfully",
      redirect: dashboardPath,
      success: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error.message, error.stack);

    // Return generic error message to avoid exposing internal details
    return NextResponse.json(
      { message: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
