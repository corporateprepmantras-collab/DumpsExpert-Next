import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import Payment from "@/models/paymentSchema";
import User from "@/models/userInfoSchema";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret); // Use LiveEnvironment for production
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    const { orderId, amount, userId } = await request.json();

    // Validate required fields
    if (!orderId || !amount) {
      console.error("Missing required fields:", { orderId, amount });
      return NextResponse.json(
        { success: false, error: "Missing required payment details" },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!clientId || !clientSecret) {
      console.error("PayPal credentials not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify PayPal order
    const paypalRequest = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client.execute(paypalRequest);

    if (
      order.result.status !== "APPROVED" &&
      order.result.status !== "COMPLETED"
    ) {
      console.error("Invalid order status:", {
        orderId,
        status: order.result.status,
      });
      return NextResponse.json(
        { success: false, error: "Invalid order status" },
        { status: 400 }
      );
    }

    // Verify amount
    const paypalAmount = parseFloat(
      order.result.purchase_units[0].amount.value
    );
    if (paypalAmount !== parseFloat(amount)) {
      console.error("Amount mismatch:", {
        provided: amount,
        actual: paypalAmount,
      });
      return NextResponse.json(
        { success: false, error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Update user and create payment record concurrently
    const operations = [
      Payment.create({
        user: userId || null,
        amount: paypalAmount,
        currency: order.result.purchase_units[0].amount.currency_code || "INR",
        paymentMethod: "paypal",
        paymentId: orderId,
        status: "completed",
      }),
    ];

    if (userId) {
      operations.push(
        User.findByIdAndUpdate(
          userId,
          {
            subscription: "yes",
            role: "student",
          },
          { new: true }
        )
      );
    }

    await Promise.all(operations);

    console.log("Payment verified and processed:", { orderId, userId });
    return NextResponse.json({
      success: true,
      paymentId: orderId,
    });
  } catch (error) {
    console.error("PayPal payment verification failed:", {
      error: error.message,
      stack: error.stack,
      orderId,
      userId,
    });
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
