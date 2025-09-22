// src/app/api/auth/forgot-password/send-otp/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import Otp from "@/models/otpSchema";

export async function POST(req) {
  try {
    const { email } = await req.json();

    console.log("Received forgot password OTP request for:", email);

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    // Check if user exists and is verified
    const existingUser = await UserInfo.findOne({ email });
    if (!existingUser) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 }
      );
    }

    if (!existingUser.isVerified) {
      return NextResponse.json(
        { message: "Account not verified. Please complete registration first." },
        { status: 400 }
      );
    }

    // Rate limiting for forgot password requests
    const maxAttempts = 3; // Lower limit for password reset
    const otpRecord = await Otp.findOne({ email });
    if (otpRecord && otpRecord.attempts >= maxAttempts) {
      const timeSinceLastAttempt = Date.now() - new Date(otpRecord.updatedAt).getTime();
      const cooldownPeriod = 15 * 60 * 1000; // 15 minutes

      if (timeSinceLastAttempt < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { message: `Too many attempts. Try again in ${remainingTime} minutes.` },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update or create OTP record with purpose
    await Otp.findOneAndUpdate(
      { email },
      { 
        email, 
        otp, 
        otpExpires, 
        purpose: 'password-reset', // Add purpose field
        $inc: { attempts: 1 } 
      },
      { upsert: true, new: true }
    );

    // Verify SMTP credentials
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("SMTP credentials are missing");
      return NextResponse.json(
        { message: "Server configuration error: Missing SMTP credentials" },
        { status: 500 }
      );
    }

    console.log("EMAIL_SERVER_HOST:", process.env.EMAIL_SERVER_HOST);
    console.log("EMAIL_SERVER_PORT:", process.env.EMAIL_SERVER_PORT);
    console.log("EMAIL_SERVER_USER:", process.env.EMAIL_SERVER_USER);
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT, 10),
      secure: process.env.EMAIL_SERVER_PORT === "465", // Use SSL for port 465, TLS for 587
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send password reset OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Code - DumpsXpert",
      text: `Your password reset code is: ${otp}. Valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request - DumpsXpert</h2>
          <p>We received a request to reset your password. Your verification code is:</p>
          <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 5px; background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p style="color: #dc2626; font-weight: bold;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated email from DumpsXpert. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Password reset OTP sent successfully to:", email);
    return NextResponse.json({ 
      message: "Password reset code sent to your email" 
    });
  } catch (error) {
    console.error("Send forgot password OTP error:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: `Failed to send password reset code: ${error.message}` },
      { status: 500 }
    );
  }
}