// src/app/api/signup/otp-send/route.js
export const runtime = "nodejs"; // 🔥 CRITICAL
export const dynamic = "force-dynamic"; // 🔥 CRITICAL

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import Otp from "@/models/otpSchema";

// ✅ Handle preflight (prevents retry spam → 429)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const normalizedEmail = email.toLowerCase().trim();

    // 🔐 If user already verified → redirect to login
    const existingUser = await UserInfo.findOne({ email: normalizedEmail });
    if (existingUser?.isVerified) {
      return NextResponse.json(
        { message: "User already exists. Please sign in." },
        { status: 400 }
      );
    }

    /* ---------------- RATE LIMITING ---------------- */

    const now = Date.now();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    const recentOtps = await Otp.find({
      email: normalizedEmail,
      purpose: "signup",
      createdAt: { $gte: oneHourAgo },
    }).sort({ createdAt: -1 });

    // ⛔ Max 5 OTPs per hour
    if (recentOtps.length >= 5) {
      return NextResponse.json(
        { message: "Too many OTP requests. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // ⏱ 30s cooldown
    if (recentOtps[0]) {
      const diff = now - new Date(recentOtps[0].createdAt).getTime();
      if (diff < 30_000) {
        return NextResponse.json(
          { message: "Please wait 30 seconds before requesting another OTP." },
          { status: 429 }
        );
      }
    }

    // 🧹 Cleanup old OTPs
    await Otp.deleteMany({ email: normalizedEmail, purpose: "signup" });

    /* ---------------- OTP GENERATION ---------------- */

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(now + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otp,
      otpExpires,
      purpose: "signup",
      attempts: 1,
      createdAt: new Date(),
    });

    /* ---------------- EMAIL ---------------- */

    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      return NextResponse.json(
        { message: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: normalizedEmail,
      subject: "Your Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Try again later." },
      { status: 500 }
    );
  }
}
