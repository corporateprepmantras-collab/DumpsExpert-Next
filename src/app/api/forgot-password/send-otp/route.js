// src/app/api/auth/forgot-password/send-otp/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import Otp from "@/models/otpSchema";

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

    const user = await UserInfo.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Account not verified" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const cooldown = 60 * 1000; // 60 seconds
    const maxAttempts = 5; // per 15 minutes
    const windowMs = 15 * 60 * 1000;

    let otpDoc = await Otp.findOne({ email, purpose: "password-reset" });

    // ⏱ Cooldown check
    if (otpDoc && now - otpDoc.updatedAt.getTime() < cooldown) {
      const wait = Math.ceil(
        (cooldown - (now - otpDoc.updatedAt.getTime())) / 1000
      );
      return NextResponse.json(
        { message: `Please wait ${wait}s before retrying` },
        { status: 429 }
      );
    }

    // 🔄 Reset attempts after window
    if (otpDoc && now - otpDoc.updatedAt.getTime() > windowMs) {
      otpDoc.attempts = 0;
    }

    if (otpDoc && otpDoc.attempts >= maxAttempts) {
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(now + 10 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email, purpose: "password-reset" },
      {
        email,
        otp,
        otpExpires,
        purpose: "password-reset",
        $inc: { attempts: 1 },
      },
      { upsert: true }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Code",
      html: `
        <h2>Password Reset</h2>
        <p>Your code:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      `,
    });

    return NextResponse.json({
      message: "Password reset code sent",
    });
  } catch (error) {
    console.error("OTP ERROR:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
