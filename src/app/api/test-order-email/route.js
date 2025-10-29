// app/api/test-order-email/route.js
import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email/orderEmails";

export async function GET(request) {
  try {
    console.log("🧪 Testing order confirmation email...");

    // Test data
    const testOrder = {
      userEmail: "leeladharupadhayay7@gmail.com", // Your email
      userName: "Yogesh",
      orderId: "TEST123456789",
      orderNumber: "ORD-TEST-001",
      items: [
        {
          name: "SAP Certified Associate – Back-End Developer",
          code: "SAP-001",
          price: 999,
        },
        {
          name: "AWS Solutions Architect Exam",
          code: "AWS-002",
          price: 1499,
        },
      ],
      totalAmount: 2498,
      currency: "INR",
      paymentMethod: "razorpay",
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    };

    console.log("📧 Sending test order email with data:", {
      to: testOrder.userEmail,
      orderNumber: testOrder.orderNumber,
      itemCount: testOrder.items.length,
    });

    await sendOrderConfirmationEmail(testOrder);

    console.log("✅ Test order email sent successfully!");

    return NextResponse.json({
      success: true,
      message: "Test order email sent successfully!",
      sentTo: testOrder.userEmail,
    });
  } catch (error) {
    console.error("❌ Test order email failed:", {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
