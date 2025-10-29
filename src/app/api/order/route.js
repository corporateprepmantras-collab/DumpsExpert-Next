// app/api/order/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import Product from "@/models/productListSchema";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import {
  sendOrderConfirmationEmail,
  sendOrderUpdateEmail,
} from "@/lib/email/orderEmails";

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

// Helper function to calculate expiry date (90 days from now)
const calculateExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 90);
  return expiryDate;
};

// ================== POST ==================
export async function POST(request) {
  try {
    console.log("🚀 Route hit: /api/order [POST]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("👤 Session:", session);

    if (!session || !session.user?.id) {
      console.error("❌ Unauthorized: No valid session");
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

    console.log("📦 Received order request:", {
      userId,
      itemCount: items?.length,
      totalAmount,
      paymentMethod,
      paymentId,
    });

    // User check
    if (userId !== session.user.id) {
      console.error("❌ User ID mismatch");
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
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 }
      );
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await UserInfo.findOne({ authUserId: userId });
    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid items format:", items);
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
      console.error("❌ Items missing required fields:", invalidItems);
      return NextResponse.json(
        { error: "All items must have a title or name and a price" },
        { status: 400 }
      );
    }

    // Calculate expiry date (90 days from now)
    const expiryDate = calculateExpiryDate();

    // Process course details with expiry date
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
      mainPdfUrl: item.mainPdfUrl || "",
      expiryDate: expiryDate,
      isExpired: false,
    }));

    console.log("📝 Processed course details:", {
      itemCount: courseDetails.length,
      expiryDate: expiryDate.toISOString(),
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
      expiryDate: expiryDate,
    });

    console.log("✅ Order created successfully:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      itemCount: courseDetails.length,
      totalAmount,
      expiryDate: expiryDate.toISOString(),
    });

    // ============= EMAIL NOTIFICATION =============
    console.log("\n📧 ========== EMAIL NOTIFICATION START ==========");
    try {
      // Get auth user for email
      console.log("🔍 Looking for auth user with ID:", userId);
      let emailUser = await authUserModel.findById(userId);

      if (!emailUser) {
        console.log("⚠️ Auth user not found by ID, trying by email...");
        console.log("📧 Session email:", session.user.email);
        emailUser = await authUserModel.findOne({ email: session.user.email });
      }

      if (!emailUser) {
        console.error("❌ Could not find user for email notification");
        console.log("💡 Available session data:", session.user);
        console.log("⚠️ Skipping email - order created successfully");
      } else {
        console.log("✅ Email user found:", {
          id: emailUser._id,
          email: emailUser.email,
          name: emailUser.name,
        });

        console.log("📧 Calling sendOrderConfirmationEmail...");
        await sendOrderConfirmationEmail({
          userEmail: emailUser.email,
          userName: emailUser.name || "Customer",
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          items: courseDetails,
          totalAmount,
          currency: order.currency,
          paymentMethod,
          expiryDate,
        });

        console.log(
          "✅✅✅ Order confirmation email SENT to:",
          emailUser.email
        );
      }
    } catch (emailError) {
      console.error("❌❌❌ Failed to send order confirmation email:");
      console.error("Error message:", emailError.message);
      console.error("Error code:", emailError.code);
      console.error("Error stack:", emailError.stack);
    }
    console.log("📧 ========== EMAIL NOTIFICATION END ==========\n");

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      expiryDate: expiryDate.toISOString(),
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

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ purchaseDate: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      console.log("No orders found", { userId: userId || "all" });
      return NextResponse.json({ orders: [] });
    }

    // Check and update expired orders
    const now = new Date();
    for (const order of orders) {
      let needsUpdate = false;

      if (order.courseDetails) {
        order.courseDetails = order.courseDetails.map((item) => {
          if (
            item.expiryDate &&
            new Date(item.expiryDate) < now &&
            !item.isExpired
          ) {
            needsUpdate = true;
            return { ...item, isExpired: true };
          }
          return item;
        });
      }

      if (needsUpdate) {
        await Order.updateOne(
          { _id: order._id },
          { $set: { "courseDetails.$[].isExpired": true } }
        );
      }
    }

    console.log("Orders retrieved:", {
      count: orders.length,
      userId: userId || "all",
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

// ================== PATCH (Update Order) ==================
export async function PATCH(request) {
  try {
    console.log("Route hit: /api/order [PATCH]");
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

    // Verify admin access
    const user = await UserInfo.findOne({ authUserId: session.user.id });
    if (!user || user.role !== "admin") {
      console.error("Forbidden: User is not an admin");
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { orderId, courseDetails, status } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the existing order
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Track PDF URL changes for email notification
    const pdfChanges = [];
    if (courseDetails) {
      courseDetails.forEach((newItem, index) => {
        const oldItem = existingOrder.courseDetails[index];
        if (
          oldItem &&
          newItem.mainPdfUrl &&
          oldItem.mainPdfUrl !== newItem.mainPdfUrl
        ) {
          pdfChanges.push({
            courseName: newItem.name || oldItem.name,
            oldUrl: oldItem.mainPdfUrl,
            newUrl: newItem.mainPdfUrl,
          });
        }
      });
    }

    // Update order
    const updateData = {};
    if (courseDetails) updateData.courseDetails = courseDetails;
    if (status) updateData.status = status;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    console.log("✅ Order updated successfully:", {
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderNumber,
      pdfChangesCount: pdfChanges.length,
    });

    // Send email notification if PDF URLs changed
    if (pdfChanges.length > 0) {
      try {
        const authUser = await authUserModel.findById(existingOrder.user);
        if (authUser) {
          await sendOrderUpdateEmail({
            userEmail: authUser.email,
            userName: authUser.name || "Customer",
            orderId: updatedOrder._id.toString(),
            orderNumber: updatedOrder.orderNumber,
            pdfChanges,
            expiryDate: updatedOrder.expiryDate,
          });
          console.log("✅ Order update email sent to:", authUser.email);
        }
      } catch (emailError) {
        console.error("❌ Failed to send order update email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderNumber,
      message:
        pdfChanges.length > 0
          ? "Order updated and notification email sent"
          : "Order updated successfully",
    });
  } catch (error) {
    console.error("❌ Order update failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order update failed: ${error.message}` },
      { status: 500 }
    );
  }
}
