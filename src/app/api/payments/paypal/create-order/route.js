import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request) {
  try {
    const { amount, userId } = await request.json();

    console.log("🟦 PayPal create order request:", { amount, userId });

    /* ---------------- VALIDATION ---------------- */
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { success: false, error: "PayPal not configured on server" },
        { status: 500 }
      );
    }

    /* ---------------- PAYPAL CLIENT (LIVE) ---------------- */
    const environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

    const client = new paypal.core.PayPalHttpClient(environment);

    /* ---------------- CREATE ORDER ---------------- */
    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer("return=representation");

    paypalRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // MUST BE USD
            value: Number(amount).toFixed(2),
          },
          description: "DumpsExpert Purchase",
          custom_id: userId,
        },
      ],
      application_context: {
        brand_name: "DumpsExpert",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?provider=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      },
    });

    const order = await client.execute(paypalRequest);

    console.log("✅ PayPal order created:", order.result.id);

    /* ---------------- APPROVAL URL ---------------- */
    const approvalUrl = order.result.links.find(
      (link) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      throw new Error("PayPal approval URL not found");
    }

    return NextResponse.json({
      success: true,
      orderId: order.result.id,
      approvalUrl,
    });
  } catch (error) {
    console.error("❌ PayPal order error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "PayPal order creation failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
