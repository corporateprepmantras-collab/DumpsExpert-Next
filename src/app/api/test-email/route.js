// app/api/test-email/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(request) {
  try {
    console.log("🧪 Testing email configuration...");
    
    // Log environment variables (without sensitive data)
    console.log("Email Config:", {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      debug: true, // Enable debug output
      logger: true, // Log to console
    });

    // Verify connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    // Send test email
    console.log("📧 Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_SERVER_USER, // Send to yourself for testing
      subject: "Test Email - Order System",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Email Configuration Success!</h2>
          <p>Your email system is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
          <p><strong>Host:</strong> ${process.env.EMAIL_SERVER_HOST}</p>
          <p><strong>Port:</strong> ${process.env.EMAIL_SERVER_PORT}</p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    });
  } catch (error) {
    console.error("❌ Email test failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER,
          hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      { status: 500 }
    );
  }
}