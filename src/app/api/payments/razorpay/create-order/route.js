// File: /app/api/payments/razorpay/create-order/route.js

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    // Log environment variables (sanitized)
    console.log(
      "🔑 Razorpay Key ID:",
      process.env.RAZORPAY_KEY_ID?.substring(0, 15) + "..."
    );
    console.log("🔒 Key Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);

    // Check if credentials exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay credentials missing!");
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway not configured",
          details: "RAZORPAY_CREDENTIALS_MISSING",
        },
        { status: 500 }
      );
    }

    // Validate key format
    const keyId = process.env.RAZORPAY_KEY_ID.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET.trim();

    if (!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
      console.error(
        "❌ Invalid Razorpay Key ID format:",
        keyId.substring(0, 10)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment gateway configuration",
          details: "INVALID_KEY_FORMAT",
        },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Parse request body
    const { amount, currency, userId, originalCurrency, originalAmount } =
      await request.json();

    // Validate inputs
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const finalCurrency = currency || "INR";
    const amountInPaise = Math.round(Number(amount) * 100);

    // Generate a short receipt ID (max 40 characters)
    // Format: rcpt_TIMESTAMP_USERID (truncated to fit)
    const timestamp = Date.now();
    const userIdShort = String(userId).substring(0, 15); // Limit userId length
    const receipt = `rcpt_${timestamp}_${userIdShort}`.substring(0, 40);

    console.log("📝 Creating Razorpay order with:", {
      amount: amountInPaise,
      currency: finalCurrency,
      userId,
      receipt,
      receiptLength: receipt.length,
      originalAmount,
      originalCurrency,
      keyIdPrefix: keyId.substring(0, 15) + "...",
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: finalCurrency,
      receipt: receipt,
      payment_capture: 1,
      notes: {
        userId: userId,
        originalCurrency: originalCurrency || finalCurrency,
        originalAmount: originalAmount || amount,
        timestamp: new Date().toISOString(),
      },
    });

    console.log("✅ Razorpay order created successfully:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order_id: order.id,
      id: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("❌ Razorpay create order error:", {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
    });

    // Handle Razorpay-specific errors
    if (error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway authentication failed",
          details: "Please check your Razorpay API credentials",
          code: "RAZORPAY_AUTH_FAILED",
          hint: "Go to dashboard.razorpay.com → Settings → API Keys and generate new keys",
        },
        { status: 500 }
      );
    }

    if (error.error) {
      return NextResponse.json(
        {
          success: false,
          error: error.error.description || "Payment order creation failed",
          details: error.error.reason || error.message,
          code: error.error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create payment order",
        details: "RAZORPAY_ORDER_CREATION_FAILED",
      },
      { status: 500 }
    );
  }
}
