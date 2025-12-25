import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

/* ---------------- HELPERS ---------------- */

function getCountryFromRequest(request) {
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry) return cfCountry;

  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    "US"
  );
}

function getCurrencyByCountry(country) {
  if (country === "IN") return "INR";
  if (country === "US") return "USD";
  return "USD";
}

/* ---------------- POST HANDLER ---------------- */

export async function POST(request) {
  try {
    const { amount, userId } = await request.json();

    console.log("📥 PayPal order creation request:", {
      amount,
      userId,
    });

    if (!amount) {
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 }
      );
    }

    /* 🌍 LOCATION DETECTION */
    const country = getCountryFromRequest(request);
    const uiCurrency = getCurrencyByCountry(country);

    console.log("🌍 Location detected:", {
      country,
      uiCurrency,
      userId,
    });

    /* 🔐 PAYPAL CREDS */
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: "PayPal is not configured on the server",
          hint: "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local",
        },
        { status: 500 }
      );
    }

    /* 🧾 PAYPAL CLIENT */
    const environment = new paypal.core.SandboxEnvironment(
      clientId,
      clientSecret
    );
    const client = new paypal.core.PayPalHttpClient(environment);

    /* ⚠️ PayPal Sandbox → USD only */
    const paypalCurrency = "USD";

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: paypalCurrency,
            value: Number(amount).toFixed(2),
          },
          description: "Order from DumpsExpert",
        },
      ],
      application_context: {
        brand_name: "DumpsExpert",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/cart`,
        cancel_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/cart`,
      },
    });

    console.log("📤 Sending request to PayPal...");

    const order = await client.execute(paypalRequest);

    if (!order?.result?.id) {
      throw new Error("Invalid PayPal response");
    }

    console.log("✅ PayPal order created:", {
      orderId: order.result.id,
      status: order.result.status,
      paypalCurrency,
      userCountry: country,
      uiCurrency,
    });

    return NextResponse.json({
      success: true,
      orderId: order.result.id,
      country,
      currency: uiCurrency, // for frontend display
    });
  } catch (error) {
    console.error("❌ PayPal order creation failed:", error);

    return NextResponse.json(
      {
        error: "Payment initiation failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
