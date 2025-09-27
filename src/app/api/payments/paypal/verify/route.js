import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { connectMongoDB } from "@/lib/mongo";
import Payment from "@/models/paymentSchema";
import UserInfo from "@/models/userInfoSchema";
import mongoose from "mongoose";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Add credential validation
if (!clientId || !clientSecret) {
  console.error('PayPal credentials not configured for verify endpoint');
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret); // Use LiveEnvironment for production
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    console.log("Route hit: /api/payments/paypal/verify");

    // Get session to verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.error("Unauthorized access: No valid session");
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { orderId, amount, userId } = await request.json();

    // Validate required fields
    if (!orderId || !amount || !userId) {
      console.error("Missing required fields:", { orderId, amount, userId });
      return NextResponse.json(
        { success: false, error: "Missing required payment details or user ID" },
        { status: 400 }
      );
    }

    // Validate userId matches session.user.id (authUsers _id)
    if (userId !== session.user.id) {
      console.error("User ID mismatch:", {
        provided: userId,
        session: session.user.id,
      });
      return NextResponse.json(
        { success: false, error: "User ID does not match authenticated user" },
        { status: 403 }
      );
    }

    // Validate userId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
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

    // Verify user exists in UserInfo with matching authUserId
    const user = await UserInfo.findOne({ authUserId: userId }).select(
      "-password"
    );
    if (!user) {
      console.error("User not found in UserInfo:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    // Create payment record and update user
    const operations = [
      Payment.create({
        user: userId, // Store authUserId (from authUsers) in Payment
        amount: paypalAmount,
        currency: order.result.purchase_units[0].amount.currency_code || "INR",
        paymentMethod: "paypal",
        paymentId: orderId,
        status: "completed",
      }),
      UserInfo.findOneAndUpdate(
        { authUserId: userId },
        {
          subscription: "yes",
          role: "student",
        },
        { new: true }
      ),
    ];

    const [paymentRecord, updatedUser] = await Promise.all(operations);

    console.log("Payment verified and processed:", {
      orderId,
      userId,
    });

    // Return updated user data for session update
    return NextResponse.json({
      success: true,
      paymentId: orderId,
      user: {
        id: updatedUser.authUserId?.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        subscription: updatedUser.subscription,
        provider: updatedUser.provider,
        providerId: updatedUser.providerId,
        isVerified: updatedUser.isVerified,
        phone: updatedUser.phone,
        address: updatedUser.address,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("PayPal payment verification failed:", {
      error: error.message,
      stack: error.stack,
      orderId: typeof orderId !== "undefined" ? orderId : null,
      userId: typeof userId !== "undefined" ? userId : null,
    });
    return NextResponse.json(
      {
        success: false,
        error: `Payment verification failed: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
