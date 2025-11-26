import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import OTP from "@/models/otpSchema";
import UserInfo from "@/models/userInfoSchema";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, password, name } = await request.json();

    console.log("🔍 [OTP-VERIFY] ===== NEW REQUEST =====");
    console.log("🔍 [OTP-VERIFY] Received data:", {
      email,
      otp,
      otpLength: otp?.length,
      otpType: typeof otp,
      name,
    });

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
    const otpStr = String(otp).trim();
    if (!/^\d{6}$/.test(otpStr)) {
      return NextResponse.json(
        { message: "OTP must be a 6-digit number" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const normalizedEmail = email.toLowerCase().trim();

    console.log("🔍 [OTP-VERIFY] Normalized:", {
      normalizedEmail,
      otpStr,
      otpStrLength: otpStr.length,
    });

    // DEBUGGING: Check what OTPs exist in database
    const allOtpsForEmail = await OTP.find({
      email: normalizedEmail,
    }).lean();

    console.log(
      "🔍 [OTP-VERIFY] All OTPs in DB for this email:",
      allOtpsForEmail.map((o) => ({
        id: o._id,
        email: o.email,
        otp: o.otp,
        otpType: typeof o.otp,
        otpLength: o.otp?.length,
        expires: o.otpExpires,
        isExpired: Date.now() > new Date(o.otpExpires).getTime(),
        createdAt: o.createdAt,
      }))
    );

    // Find OTP record with exact match
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otpStr,
    }).lean();

    console.log(
      "🔍 [OTP-VERIFY] Query result:",
      otpRecord
        ? {
            found: true,
            id: otpRecord._id,
            email: otpRecord.email,
            otp: otpRecord.otp,
            otpMatch: otpRecord.otp === otpStr,
            expires: otpRecord.otpExpires,
            isExpired: Date.now() > new Date(otpRecord.otpExpires).getTime(),
          }
        : { found: false }
    );

    if (!otpRecord) {
      console.error("❌ [OTP-VERIFY] OTP NOT FOUND");
      console.error("❌ [OTP-VERIFY] Comparison:", {
        searchingFor: { email: normalizedEmail, otp: otpStr },
        availableOTPs: allOtpsForEmail.map((o) => o.otp),
      });

      return NextResponse.json(
        {
          message: "Invalid OTP",
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              receivedOTP: otpStr,
              receivedEmail: normalizedEmail,
              availableOTPs: allOtpsForEmail.map((o) => ({
                otp: o.otp,
                match: o.otp === otpStr,
                charByChar: Array.from(o.otp).map((c, i) => ({
                  pos: i,
                  db: c,
                  input: otpStr[i],
                  match: c === otpStr[i],
                })),
              })),
            },
          }),
        },
        { status: 400 }
      );
    }

    // Check OTP expiration
    if (Date.now() > new Date(otpRecord.otpExpires).getTime()) {
      console.warn("⚠️ [OTP-VERIFY] OTP expired");
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    console.log("✅ [OTP-VERIFY] OTP verified successfully");

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
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          name: name.trim(),
          image: "",
          emailVerified: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log("✅ [OTP-VERIFY] AuthUser created/updated:", authUser._id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update user info with upsert
    const user = await UserInfo.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          authUserId: authUser._id,
          email: normalizedEmail,
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

    console.log("✅ [OTP-VERIFY] UserInfo created/updated:", {
      id: user._id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    });

    // Delete OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });
    console.log("✅ [OTP-VERIFY] OTP record deleted");

    // Determine redirect path based on role and subscription
    let dashboardPath = "/dashboard/guest";
    if (user.role === "admin") dashboardPath = "/dashboard/admin";
    else if (user.subscription === "yes") dashboardPath = "/dashboard/student";

    console.log("✅ [OTP-VERIFY] Success! Redirecting to:", dashboardPath);

    return NextResponse.json({
      message: "Email verified successfully",
      redirect: dashboardPath,
      success: true,
    });
  } catch (error) {
    console.error("❌ [OTP-VERIFY] Error:", error.message);
    console.error("❌ [OTP-VERIFY] Stack:", error.stack);

    return NextResponse.json(
      {
        message: "Failed to verify OTP. Please try again.",
        ...(process.env.NODE_ENV === "development" && {
          error: error.message,
        }),
      },
      { status: 500 }
    );
  }
}
