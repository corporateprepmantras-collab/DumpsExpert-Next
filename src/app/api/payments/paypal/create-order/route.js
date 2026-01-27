import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request) {
  try {
    const { amount, userId, currency = "USD" } = await request.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    // Initialize PayPal SDK
    const environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );

    const client = new paypal.core.PayPalHttpClient(environment);

    // Create order request
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.prefer("return=representation");

    orderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: "Prepmantra IT Certification Materials",
        },
      ],
      application_context: {
        brand_name: "Prepmantra",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/student`,
      },
    });

    // Execute the order creation
    const order = await client.execute(orderRequest);

    // Get approval URL
    const approvalUrl = order.result.links.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!approvalUrl) {
      throw new Error("Approval URL not found in PayPal response");
    }

    console.log("✅ PayPal order created:", order.result.id);

    return NextResponse.json({
      success: true,
      orderId: order.result.id,
      approvalUrl: approvalUrl,
    });
  } catch (error) {
    console.error("❌ PayPal create order error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create PayPal order",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
