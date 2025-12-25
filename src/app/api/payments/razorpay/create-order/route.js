import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { amount } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // INR → paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    });

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount / 100,
      currency: order.currency,
    });
  } catch (error) {
    console.error("❌ Razorpay create order error:", error);
    return NextResponse.json(
      { success: false, error: "Razorpay order failed" },
      { status: 500 }
    );
  }
}
