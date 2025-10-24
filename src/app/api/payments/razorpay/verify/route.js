import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { connectMongoDB } from "@/lib/mongo";
import Payment from "@/models/paymentSchema";
import UserInfo from "@/models/userInfoSchema";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: "rzp_test_7kAotmP1o8JR8V",
  key_secret: "jPBuKq2CqukA4JxOXKfp8QU7",
});

export async function POST(request) {
  try {
    console.log("Route hit: /api/payments/razorpay/verify");

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

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      userId,
    } = await request.json();

    // Validate required fields
    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !amount ||
      !userId
    ) {
      console.error("Missing required fields:", {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amount,
        userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment details or user ID",
        },
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

    // Verify environment variable
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay key secret not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      console.error("Signature verification failed:", {
        razorpay_payment_id,
        razorpay_order_id,
        expectedSign,
        receivedSign: razorpay_signature,
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Verify amount with Razorpay API
    console.log("Fetching Razorpay payment:", razorpay_payment_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment) {
      console.error("Payment not found:", razorpay_payment_id);
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 400 }
      );
    }
    if (payment.amount !== Math.round(amount * 100)) {
      console.error("Amount mismatch:", {
        provided: amount,
        actual: payment.amount / 100,
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
        amount: payment.amount / 100,
        currency: payment.currency || "INR",
        paymentMethod: "razorpay",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
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
      razorpay_payment_id,
      razorpay_order_id,
      userId,
    });

    // Return updated user data for session update
    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
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
    console.error("Payment verification failed:", {
      error: error.message,
      stack: error.stack,
      paymentId:
        typeof razorpay_payment_id !== "undefined" ? razorpay_payment_id : null,
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
