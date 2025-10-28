import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import Product from "@/models/productListSchema";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

// Define authUsers model
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

// ================== POST ==================
export async function POST(request) {
  try {
    console.log("Route hit: /api/order [POST]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || !session.user?.id) {
      console.error("Unauthorized: No valid session");
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      discount,
      paymentStatus,
    } = await request.json();

    console.log("Received order request:", {
      userId,
      itemCount: items?.length,
      totalAmount,
      paymentMethod,
      paymentId,
      items,
    });

    // User check
    if (userId !== session.user.id) {
      console.error("User ID mismatch");
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (
      !userId ||
      !items ||
      !items.length ||
      !totalAmount ||
      !paymentMethod ||
      !paymentId
    ) {
      console.error("Missing required fields");
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 }
      );
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await UserInfo.findOne({ authUserId: userId });
    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid items format:", items);
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 }
      );
    }

    // Check for invalid items
    const invalidItems = items.filter(
      (item) => !item.title && !item.name && item.price === undefined
    );
    if (invalidItems.length > 0) {
      console.error("Items missing required fields:", invalidItems);
      return NextResponse.json(
        { error: "All items must have a title or name and a price" },
        { status: 400 }
      );
    }

    // ✅ FIXED: Ensure name always exists
    const courseDetails = items.map((item) => ({
      courseId: item._id,
      name: item.name || item.title || "Untitled Course",
      price: item.priceINR || item.priceUSD || item.price || 0,
      quantity: item.quantity || 1,
      duration: item.duration || "",
      eachQuestionMark: item.eachQuestionMark || "",
      code: item.code || "",
      numberOfQuestions: item.numberOfQuestions || 0,
      passingScore: item.passingScore || "",
      status: item.status || "active",
      productId: item.productId || item._id,
      mainInstructions: item.mainInstructions || "",
      sampleInstructions: item.sampleInstructions || "",
      slug: item.slug || "",
      imageUrl: item.imageUrl || "",
      type: item.type || "exam",
    }));

    console.log("Processed course details:", {
      itemCount: courseDetails.length,
      itemsWithNames: courseDetails.filter((i) => i.name).length,
      itemsWithoutNames: courseDetails.filter((i) => !i.name).length,
      itemsWithSlugs: courseDetails.filter(
        (i) => i.slug && i.slug.trim() !== ""
      ).length,
      details: courseDetails.map((item) => ({
        name: item.name,
        slug: item.slug || "MISSING",
        productId: item.productId,
      })),
    });

    // Create Order
    const order = await Order.create({
      user: userId,
      courseDetails,
      totalAmount,
      discount: discount || 0,
      paymentMethod,
      paymentId,
      currency: paymentMethod === "paypal" ? "USD" : "INR",
      status: paymentStatus || "completed",
    });

    console.log("✅ Order created successfully:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      itemCount: courseDetails.length,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Order creation failed:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: `Order creation failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// ================== GET ==================
export async function GET(request) {
  try {
    console.log("Route hit: /api/order [GET]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || !session.user?.id) {
      console.error("Unauthorized: No valid session");
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const user = await UserInfo.findOne({ authUserId: session.user.id });
    if (!user || user.role !== "admin") {
      console.error("Forbidden: User is not an admin");
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

    // ✅ CRITICAL FIX: Don't populate courseDetails - all data is already stored in the order
    // Only populate user info since that's a simple reference
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ purchaseDate: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      console.log("No orders found", { userId: userId || "all" });
      return NextResponse.json({ orders: [] });
    }

    console.log("Orders retrieved:", {
      count: orders.length,
      userId: userId || "all",
      sampleOrder: orders[0]
        ? {
            id: orders[0]._id,
            itemCount: orders[0].courseDetails?.length,
            firstItemFields: Object.keys(orders[0].courseDetails?.[0] || {}),
          }
        : null,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("❌ Order retrieval failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order retrieval failed: ${error.message}` },
      { status: 500 }
    );
  }
}
