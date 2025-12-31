import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    const environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

    const client = new paypal.core.PayPalHttpClient(environment);

    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});

    const capture = await client.execute(captureRequest);

    if (capture.result.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    const paymentId = capture.result.purchase_units[0].payments.captures[0].id;

    return NextResponse.json({
      success: true,
      paymentId,
      status: capture.result.status,
    });
  } catch (error) {
    console.error("❌ PayPal capture failed:", error);
    return NextResponse.json(
      { success: false, error: "PayPal capture failed" },
      { status: 500 }
    );
  }
}
