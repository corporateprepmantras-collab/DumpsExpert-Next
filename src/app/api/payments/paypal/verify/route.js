// import { NextResponse } from "next/server";
// import paypal from "@paypal/checkout-server-sdk";
// // import connectDB from "@/lib/db";
// // import User from "@/models/User";

// export async function POST(request) {
//   try {
//     const { orderId, amount, userId } = await request.json();

//     console.log("🔍 Verifying PayPal payment:", { orderId, amount, userId });

//     if (!orderId) {
//       return NextResponse.json(
//         { error: "Order ID is required" },
//         { status: 400 }
//       );
//     }

//     // Initialize PayPal client
//     const environment = new paypal.core.LiveEnvironment(
//       process.env.PAYPAL_CLIENT_ID,
//       process.env.PAYPAL_CLIENT_SECRET
//     );

//     const client = new paypal.core.PayPalHttpClient(environment);

//     // Capture the order
//     const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
//     captureRequest.requestBody({});

//     console.log("💰 Capturing PayPal payment...");
//     const capture = await client.execute(captureRequest);

//     console.log("✅ Payment captured:", capture.result.id);
//     console.log("📊 Payment status:", capture.result.status);

//     // Verify payment status
//     if (capture.result.status !== "COMPLETED") {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Payment not completed",
//           status: capture.result.status,
//         },
//         { status: 400 }
//       );
//     }

//     // Get payment amount from capture
//     const paidAmount = parseFloat(
//       capture.result.purchase_units[0].payments.captures[0].amount.value
//     );

//     // Verify amount matches
//     if (Math.abs(paidAmount - parseFloat(amount)) > 0.01) {
//       console.error("❌ Amount mismatch:", {
//         paidAmount,
//         expectedAmount: amount,
//       });
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Payment amount verification failed",
//           details: `Expected ${amount}, but received ${paidAmount}`,
//         },
//         { status: 400 }
//       );
//     }

//     // Update user subscription in database
//     if (userId) {
//       await connectDB();
//       const user = await User.findByIdAndUpdate(
//         userId,
//         {
//           role: "paid",
//           subscription: {
//             status: "active",
//             startDate: new Date(),
//             endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
//           },
//         },
//         { new: true }
//       );

//       console.log("✅ User subscription updated:", user.email);

//       return NextResponse.json({
//         success: true,
//         paymentId: capture.result.id,
//         status: capture.result.status,
//         amount: paidAmount,
//         user: {
//           id: user._id,
//           role: user.role,
//           subscription: user.subscription,
//         },
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       paymentId: capture.result.id,
//       status: capture.result.status,
//       amount: paidAmount,
//     });
//   } catch (error) {
//     console.error("❌ PayPal verify error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Payment verification failed",
//         details: error.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
