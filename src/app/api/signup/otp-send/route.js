import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import Otp from "@/models/otpSchema";

export async function POST(req) {
  try {
    const { email } = await req.json();

    console.log("Received OTP send request with email:", email);

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if user already verified
    const existingUser = await UserInfo.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { message: "User already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 attempts per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const otpRecord = await Otp.findOne({
      email,
      createdAt: { $gte: oneHourAgo },
    });

    if (otpRecord && otpRecord.attempts >= 5) {
      return NextResponse.json(
        { message: "Too many OTP requests. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // Check if last OTP request was too recent (min 30 seconds between requests)
    if (
      otpRecord &&
      Date.now() - new Date(otpRecord.updatedAt).getTime() < 30000
    ) {
      return NextResponse.json(
        { message: "Please wait 30 seconds before requesting a new OTP" },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update or create OTP record
    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires,
        attempts: otpRecord ? otpRecord.attempts + 1 : 1,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Verify SMTP credentials
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("SMTP credentials are missing");
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

    // Send OTP email with security headers
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
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
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #6b7280; font-size: 14px;">🔒 Never share this code with anyone.</p>
            <p style="color: #6b7280; font-size: 14px;">❓ If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 DumpsXpert. All rights reserved.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "DumpsXpert-Auth",
      },
    });

    console.log("OTP sent successfully to:", email);
    return NextResponse.json({
      message: "OTP sent successfully. Valid for 10 minutes.",
    });
  } catch (error) {
    console.error("Send OTP error:", {
      error: error.message,
      stack: error.stack,
    });

    // Return generic error message
    return NextResponse.json(
      { message: "Failed to send OTP. Please try again later." },
      { status: 500 }
    );
  }
}
