import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import Otp from "@/models/otpSchema";

export async function POST(req) {
  try {
    const { email } = await req.json();

    console.log("📧 [OTP-SEND] ===== NEW REQUEST =====");
    console.log("📧 [OTP-SEND] Email:", email);

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already verified
    const existingUser = await UserInfo.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      console.log("⚠️ [OTP-SEND] User already exists:", normalizedEmail);
      return NextResponse.json(
        { message: "User already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 attempts per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await Otp.find({
      email: normalizedEmail,
      createdAt: { $gte: oneHourAgo },
    }).sort({ createdAt: -1 });

    console.log("🔍 [OTP-SEND] Recent OTPs:", recentOtps.length);

    // Check if too many attempts
    if (recentOtps.length >= 5) {
      console.warn("⚠️ [OTP-SEND] Too many attempts");
      return NextResponse.json(
        { message: "Too many OTP requests. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // Check if last OTP request was too recent (min 30 seconds)
    const lastOtp = recentOtps[0];
    if (lastOtp) {
      const timeSinceLastOtp =
        Date.now() - new Date(lastOtp.createdAt).getTime();
      console.log("⏱️ [OTP-SEND] Time since last OTP:", timeSinceLastOtp, "ms");

      if (timeSinceLastOtp < 30000) {
        return NextResponse.json(
          { message: "Please wait 30 seconds before requesting a new OTP" },
          { status: 429 }
        );
      }
    }

    // Delete old OTPs for this email (cleanup)
    const deleteResult = await Otp.deleteMany({ email: normalizedEmail });
    console.log("🗑️ [OTP-SEND] Deleted old OTPs:", deleteResult.deletedCount);

    // Generate 6-digit OTP as STRING
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔐 [OTP-SEND] Generated OTP:", {
      otp,
      otpType: typeof otp,
      otpLength: otp.length,
      expires: otpExpires,
    });

    // Create new OTP record
    const otpDoc = await Otp.create({
      email: normalizedEmail,
      otp: otp,
      otpExpires,
      attempts: 1,
      purpose: "signup",
      createdAt: new Date(),
    });

    console.log("💾 [OTP-SEND] Saved OTP:", {
      id: otpDoc._id,
      email: otpDoc.email,
      otp: otpDoc.otp,
      otpType: typeof otpDoc.otp,
      otpLength: otpDoc.otp?.length,
    });

    // Verify what was saved
    const savedOtp = await Otp.findById(otpDoc._id).lean();
    console.log("✅ [OTP-SEND] Verified in DB:", {
      otp: savedOtp.otp,
      otpType: typeof savedOtp.otp,
      match: savedOtp.otp === otp,
    });

    // Verify SMTP credentials
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("❌ [OTP-SEND] SMTP credentials missing");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Configure nodemailer with TLS
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT, 10),
      secure: false, // Use TLS for port 587
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection
    await transporter.verify();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: normalizedEmail,
      subject: "Your DumpsXpert Verification Code",
      text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0;">DumpsXpert</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Email Verification</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p style="color: #374151; font-size: 16px;">Hello,</p>
            <p style="color: #374151;">Your verification code is:</p>
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
              <h1 style="color: #667eea; font-size: 40px; letter-spacing: 10px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #6b7280; font-size: 14px;">🔒 Never share this code with anyone.</p>
            <p style="color: #6b7280; font-size: 14px;">❓ If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} DumpsXpert. All rights reserved.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "DumpsXpert-Auth",
      },
    });

    console.log("✅ [OTP-SEND] Email sent successfully to:", normalizedEmail);

    return NextResponse.json({
      message: "OTP sent successfully. Valid for 10 minutes.",
      success: true,
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          email: normalizedEmail,
          otp: otp, // Only show in development!
          expires: otpExpires,
        },
      }),
    });
  } catch (error) {
    console.error("❌ [OTP-SEND] Error:", error.message);
    console.error("❌ [OTP-SEND] Stack:", error.stack);

    return NextResponse.json(
      { message: "Failed to send OTP. Please try again later." },
      { status: 500 }
    );
  }
}
