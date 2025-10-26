import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

// Define authUsers model to ensure it's registered before use
const authUserModel =
  mongoose.models.authUsers ||
  mongoose.model(
    "authUsers",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true },
        name: { type: String },
        image: { type: String },
        emailVerified: { type: Date },
      },
      { collection: "authUsers" }
    )
  );

export async function POST(request) {
  try {
    console.log("Route hit: /api/order [POST]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || !session.user?.id) {
      console.error("Unauthorized: No valid session", {
        sessionExists: !!session,
        userId: session?.user?.id || "none",
      });
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { userId, items, totalAmount, paymentMethod, paymentId } =
      await request.json();

    if (userId !== session.user.id) {
      console.error("User ID mismatch:", {
        provided: userId,
        session: session.user.id,
      });
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    if (
      !userId ||
      !items ||
      !items.length ||
      !totalAmount ||
      !paymentMethod ||
      !paymentId
    ) {
      console.error("Missing required fields:", {
        userId,
        items,
        totalAmount,
        paymentMethod,
        paymentId,
      });
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const user = await UserInfo.findOne({ authUserId: userId });
    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    if (
      !Array.isArray(items) ||
      items.some((item) => !item._id || !item.title || !item.price)
    ) {
      console.error("Invalid items format:", items);
      return NextResponse.json(
        { error: "Invalid items format" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item._id)) {
        console.error("Invalid courseId:", item._id);
        return NextResponse.json(
          { error: `Invalid course ID format: ${item._id}` },
          { status: 400 }
        );
      }
    }

    const courseDetails = items.map((item) => ({
      courseId: new mongoose.Types.ObjectId(item._id),
      name: item.title,
      price: item.price,
      sapExamCode: item.sapExamCode || "",
      category: item.category || "",
      sku: item.sku || "",
      samplePdfUrl: item.samplePdfUrl || "",
      mainPdfUrl: item.mainPdfUrl || "",
      slug: item.slug || "",
    }));

    const order = await Order.create({
      user: userId,
      courseDetails,
      totalAmount,
      paymentMethod,
      paymentId,
      currency: "INR",
      status: "completed",
    });

    console.log("Order created:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
    });
    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order creation failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order creation failed: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    console.log("Route hit: /api/order [GET]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || !session.user?.id) {
      console.error("Unauthorized: No valid session", {
        sessionExists: !!session,
        userId: session?.user?.id || "none",
      });
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const user = await UserInfo.findOne({ authUserId: session.user.id });
    if (!user || user.role !== "admin") {
      console.error("Forbidden: User is not an admin", {
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid userId in query:", userId);
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 }
        );
      }
      const targetUser = await UserInfo.findOne({ authUserId: userId });
      if (!targetUser) {
        console.error("User not found for query:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("courseDetails.courseId", "title")
      .sort({ purchaseDate: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      console.log("No orders found", { userId: userId || "all" });
      return NextResponse.json({ orders: [] });
    }

    console.log("Orders retrieved:", {
      count: orders.length,
      userId: userId || "all",
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order retrieval failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order retrieval failed: ${error.message}` },
      { status: 500 }
    );
  }
}
