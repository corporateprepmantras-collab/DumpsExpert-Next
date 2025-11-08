import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request) {
  try {
    const { amount, currency, userId } = await request.json();

    console.log("📥 PayPal order creation request:", {
      amount,
      currency,
      userId,
    });

    if (!amount) {
      console.error("❌ Missing required fields:", { amount });
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 }
      );
    }

    // Get credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Validate PayPal credentials
    if (!clientId || !clientSecret) {
      console.error("❌ PayPal credentials not configured:", {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        clientIdLength: clientId?.length || 0,
      });
      return NextResponse.json(
        { 
          error: "PayPal is not configured on the server",
          hint: "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local"
        },
        { status: 500 }
      );
    }

    console.log("✅ PayPal credentials found, creating environment...");

    // Create environment and client
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);

    console.log("✅ PayPal client created, preparing order request...");

    // PayPal sandbox works best with USD
    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // Force USD for PayPal
            value: parseFloat(amount).toFixed(2),
          },
          description: "Order from DumpsExpert",
        },
      ],
      application_context: {
        brand_name: "DumpsExpert",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cart`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cart`,
      },
    });

    console.log("📤 Sending request to PayPal...");

    const order = await client.execute(paypalRequest);
    
    // Log the full response for debugging
    console.log("📦 PayPal response received:", JSON.stringify(order, null, 2));
    
    // Validate the response structure
    if (!order || !order.result || !order.result.id) {
      console.error("❌ Invalid PayPal response structure:", order);
      throw new Error("Invalid response from PayPal");
    }
    
    console.log("✅ PayPal order created successfully:", {
      orderId: order.result.id,
      status: order.result.status,
      amount: order.result.purchase_units?.[0]?.amount?.value || 'N/A',
    });

    return NextResponse.json({
      success: true,
      orderId: order.result.id,
    });
  } catch (error) {
    console.error("❌ PayPal order creation failed:");
    console.error("   Error name:", error.name);
    console.error("   Error message:", error.message);
    console.error("   Error statusCode:", error.statusCode);
    console.error("   Error details:", JSON.stringify(error.details || {}, null, 2));
    console.error("   Error response:", JSON.stringify(error.response || {}, null, 2));
    console.error("   Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("   Error stack:", error.stack);

    // Parse PayPal error details
    let errorMessage = "Payment initiation failed";
    let errorDetails = error.message;

    if (error.statusCode === 401 || error.statusCode === '401' || error.message?.includes('Authentication')) {
      errorMessage = "Invalid PayPal credentials";
      errorDetails = "Your PayPal credentials are invalid or expired. Please check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local";
    } else if (error.statusCode === 400) {
      errorMessage = "Invalid payment data";
      errorDetails = error.message;
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('network')) {
      errorMessage = "Network error";
      errorDetails = "Cannot connect to PayPal. Check your internet connection.";
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        debugInfo: {
          statusCode: error.statusCode || 500,
          errorName: error.name,
          errorMessage: error.message,
        }
      },
      { status: 500 }
    );
  }
}
