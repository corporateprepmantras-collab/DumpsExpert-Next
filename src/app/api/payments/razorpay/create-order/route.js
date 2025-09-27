import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    console.log("Route hit: /api/payments/razorpay/create-order");
    
    // Check Razorpay credentials
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_7kAotmP1o8JR8V";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "jPBuKq2CqukA4JxOXKfp8QU7";

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured', { 
        hasKeyId: !!keyId, 
        hasKeySecret: !!keySecret 
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Razorpay payment is not configured. Please contact support.' 
        }, 
        { status: 503 }
      );
    }

    // Initialize Razorpay instance with validation
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await request.json();
    const amount = Number(body.amount);
    const currency = body.currency || "INR";

    // Input validation
    if (!amount || amount <= 0) {
      console.error("Invalid or missing amount:", { amount });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing amount. Must be a number greater than 0.",
        },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1,
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount / 100, // Return amount in INR
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RAZORPAY_ORDER_ERROR]", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: `Unable to create order: ${error.message}` },
      { status: 500 }
    );
  }
}
