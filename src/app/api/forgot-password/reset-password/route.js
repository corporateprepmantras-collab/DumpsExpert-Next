// src/app/api/auth/forgot-password/reset-password/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Otp from "@/models/otpSchema";
import UserInfo from "@/models/userInfoSchema";

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    console.log("Received password reset request for:", email);

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Verify OTP
    const otpRecord = await Otp.findOne({ 
      email, 
      otp,
      purpose: 'password-reset' // Ensure it's for password reset
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    if (Date.now() > new Date(otpRecord.otpExpires).getTime()) {
      // Clean up expired OTP
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find user
    const user = await UserInfo.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Account not verified" },
        { status: 400 }
      );
    }

    // Update password (will be hashed by the pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Clean up used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Optional: You might want to invalidate all existing sessions here
    // This would require additional logic depending on your session management

    console.log("Password reset successful for:", email);
    
    return NextResponse.json({
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Password reset error:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: `Failed to reset password: ${error.message}` },
      { status: 500 }
    );
  }
}