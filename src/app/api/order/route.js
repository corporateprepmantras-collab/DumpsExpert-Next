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

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // 3 orders per minute per user

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
      { collection: "authUsers" },
    ),
  );

// ============= SECURITY HELPERS =============

// Rate limiter
function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];

  // Clean old requests
  const recentRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW,
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

// Validate item structure
function validateItem(item) {
  const errors = [];

  if (!item._id) errors.push("Item missing _id");
  if (!item.title && !item.name) errors.push("Item missing title/name");
  if (!item.type) errors.push("Item missing type");

  // Validate prices exist
  const hasValidPrice =
    (item.dumpsPriceInr !== undefined && item.dumpsPriceInr !== null) ||
    (item.examPriceInr !== undefined && item.examPriceInr !== null) ||
    (item.comboPriceInr !== undefined && item.comboPriceInr !== null);

  if (!hasValidPrice) errors.push("Item missing valid price");

  return errors;
}

// Get actual price from database
function getActualPrice(dbProduct, type, currency) {
  const toNum = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const priceMap = {
    regular: currency === "USD" ? "dumpsPriceUsd" : "dumpsPriceInr",
    online: currency === "USD" ? "examPriceUsd" : "examPriceInr",
    combo: currency === "USD" ? "comboPriceUsd" : "comboPriceInr",
  };

  const priceField = priceMap[type] || priceMap.regular;
  return toNum(dbProduct[priceField]);
}

// Verify prices against database
async function verifyItemPrices(items, currency) {
  const errors = [];
  const verifiedItems = [];

  for (const item of items) {
    try {
      // Find product in database
      const dbProduct = await Product.findById(item._id);

      if (!dbProduct) {
        errors.push(`Product not found: ${item._id}`);
        continue;
      }

      // Check if product is active
      if (dbProduct.status !== "active") {
        errors.push(`Product inactive: ${item.title || item._id}`);
        continue;
      }

      // Get actual price from database
      const actualPrice = getActualPrice(
        dbProduct,
        item.type || "regular",
        currency,
      );
      const clientPrice = Number(item.price) || 0;

      // Allow 1% tolerance for rounding errors
      const priceDiff = Math.abs(actualPrice - clientPrice);
      const tolerance = actualPrice * 0.01;

      if (priceDiff > tolerance) {
        console.error("❌ PRICE MISMATCH:", {
          product: item.title,
          type: item.type,
          currency,
          clientPrice,
          actualPrice,
          difference: priceDiff,
        });
        errors.push(
          `Price mismatch for ${item.title}: Expected ${actualPrice}, got ${clientPrice}`,
        );
        continue;
      }

      // Validate quantity
      const quantity = parseInt(item.quantity) || 1;
      if (quantity < 1 || quantity > 10) {
        errors.push(`Invalid quantity for ${item.title}: ${quantity}`);
        continue;
      }

      // Add verified item with database prices and ensure category present
      verifiedItems.push({
        ...item,
        category: item.category || dbProduct.category || "",
        price: actualPrice,
        quantity,
        verifiedAt: new Date(),
      });
    } catch (err) {
      console.error("Error verifying item:", item._id, err);
      errors.push(`Error verifying ${item.title || item._id}`);
    }
  }

  return { verifiedItems, errors };
}

// Verify coupon
async function verifyCoupon(couponCode, totalAmount, currency) {
  if (!couponCode) return { discount: 0, isValid: true };

  try {
    // Import coupon model (adjust path as needed)
    const Coupon =
      mongoose.models.Coupon || require("@/models/couponSchema").default;

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return { discount: 0, isValid: false, error: "Invalid coupon code" };
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { discount: 0, isValid: false, error: "Coupon expired" };
    }

    // Check minimum amount
    if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
      return {
        discount: 0,
        isValid: false,
        error: `Minimum order amount: ${coupon.minOrderAmount}`,
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        discount: 0,
        isValid: false,
        error: "Coupon usage limit reached",
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      discount: Math.min(discount, totalAmount),
      isValid: true,
      couponId: coupon._id,
    };
  } catch (err) {
    console.error("Coupon verification error:", err);
    return { discount: 0, isValid: false, error: "Coupon verification failed" };
  }
}

// Calculate expiry date
const calculateExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 90);
  return expiryDate;
};

// ================== POST (Create Order) ==================
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
        { status: 401 },
      );
    }

    const requestData = await request.json();
    const {
      userId,
      items,
      totalAmount,
      subtotal,
      discount,
      currency,
      couponCode,
      paymentMethod,
      paymentId,
      paymentStatus,
    } = requestData;

    console.log("📦 Received order request:", {
      userId,
      itemCount: items?.length,
      totalAmount,
      subtotal,
      discount,
      currency,
      couponCode,
      paymentMethod,
    });

    // ============= SECURITY CHECKS =============

    // 1. Rate limiting
    if (!checkRateLimit(session.user.id)) {
      console.error("❌ Rate limit exceeded for user:", session.user.id);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // 2. User validation
    if (userId !== session.user.id) {
      console.error("❌ User ID mismatch");
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const user = await UserInfo.findOne({ authUserId: userId });
    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // 3. Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid items:", items);
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 },
      );
    }

    if (items.length > 20) {
      console.error("❌ Too many items:", items.length);
      return NextResponse.json(
        { error: "Maximum 20 items allowed per order" },
        { status: 400 },
      );
    }

    // 4. Validate each item structure
    const itemValidationErrors = [];
    items.forEach((item, index) => {
      const errors = validateItem(item);
      if (errors.length > 0) {
        itemValidationErrors.push(`Item ${index + 1}: ${errors.join(", ")}`);
      }
    });

    if (itemValidationErrors.length > 0) {
      console.error("❌ Item validation errors:", itemValidationErrors);
      return NextResponse.json(
        { error: "Invalid items", details: itemValidationErrors },
        { status: 400 },
      );
    }

    // 5. Validate currency
    if (!["INR", "USD"].includes(currency)) {
      console.error("❌ Invalid currency:", currency);
      return NextResponse.json(
        { error: "Invalid currency. Use INR or USD" },
        { status: 400 },
      );
    }

    // 6. Verify prices against database
    console.log("🔍 Verifying prices against database...");
    const { verifiedItems, errors: priceErrors } = await verifyItemPrices(
      items,
      currency,
    );

    if (priceErrors.length > 0) {
      console.error("❌ Price verification failed:", priceErrors);
      return NextResponse.json(
        {
          error: "Price verification failed. Please refresh and try again.",
          details: priceErrors,
        },
        { status: 400 },
      );
    }

    // 7. Calculate actual totals from verified items
    const calculatedSubtotal = verifiedItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    // Allow 1% tolerance for rounding
    const subtotalDiff = Math.abs(
      calculatedSubtotal - (subtotal || totalAmount),
    );
    const subtotalTolerance = calculatedSubtotal * 0.01;

    if (subtotalDiff > subtotalTolerance) {
      console.error("❌ SUBTOTAL MISMATCH:", {
        calculated: calculatedSubtotal,
        received: subtotal || totalAmount,
        difference: subtotalDiff,
      });
      return NextResponse.json(
        {
          error: "Amount verification failed. Please refresh and try again.",
          calculated: calculatedSubtotal,
          received: subtotal || totalAmount,
        },
        { status: 400 },
      );
    }

    // 8. Verify coupon if provided
    let verifiedDiscount = 0;
    let couponId = null;

    if (couponCode) {
      const couponResult = await verifyCoupon(
        couponCode,
        calculatedSubtotal,
        currency,
      );

      if (!couponResult.isValid) {
        console.error("❌ Coupon verification failed:", couponResult.error);
        return NextResponse.json(
          { error: couponResult.error || "Invalid coupon" },
          { status: 400 },
        );
      }

      verifiedDiscount = couponResult.discount;
      couponId = couponResult.couponId;

      // Verify discount matches (with tolerance)
      const discountDiff = Math.abs(verifiedDiscount - (discount || 0));
      const discountTolerance = verifiedDiscount * 0.01;

      if (discountDiff > discountTolerance) {
        console.error("❌ DISCOUNT MISMATCH:", {
          calculated: verifiedDiscount,
          received: discount,
          difference: discountDiff,
        });
        return NextResponse.json(
          { error: "Discount verification failed" },
          { status: 400 },
        );
      }
    }

    // 9. Calculate and verify final total
    const calculatedTotal = Math.max(0, calculatedSubtotal - verifiedDiscount);
    const totalDiff = Math.abs(calculatedTotal - totalAmount);
    const totalTolerance = calculatedTotal * 0.01;

    if (totalDiff > totalTolerance) {
      console.error("❌ TOTAL AMOUNT MISMATCH:", {
        calculated: calculatedTotal,
        received: totalAmount,
        difference: totalDiff,
      });
      return NextResponse.json(
        {
          error: "Total amount verification failed",
          calculated: calculatedTotal,
          received: totalAmount,
        },
        { status: 400 },
      );
    }

    // 10. Validate payment details
    if (!paymentMethod || !paymentId) {
      console.error("❌ Missing payment details");
      return NextResponse.json(
        { error: "Payment details required" },
        { status: 400 },
      );
    }

    if (!["razorpay", "paypal"].includes(paymentMethod)) {
      console.error("❌ Invalid payment method:", paymentMethod);
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    // ============= CREATE ORDER =============

    const expiryDate = calculateExpiryDate();

    const courseDetails = verifiedItems.map((item) => ({
      courseId: item._id,
      name: item.name || item.title || "Untitled Course",
      price: item.price,
      quantity: item.quantity,
      duration: item.duration || "",
      eachQuestionMark: item.eachQuestionMark || "",
      code: item.code || item.sapExamCode || "",
      numberOfQuestions: item.numberOfQuestions || 0,
      passingScore: item.passingScore || "",
      status: item.status || "active",
      productId: item.productId || item._id,
      mainInstructions: item.mainInstructions || "",
      sampleInstructions: item.sampleInstructions || "",
      slug: item.slug || "",
      imageUrl: item.imageUrl || "",
      type: item.type || "regular",
      category: item.category || "",
      mainPdfUrl: item.mainPdfUrl || "",
      expiryDate: expiryDate,
      isExpired: false,
      verifiedAt: item.verifiedAt,
    }));

    console.log("📝 Creating order with verified data:", {
      itemCount: courseDetails.length,
      subtotal: calculatedSubtotal,
      discount: verifiedDiscount,
      total: calculatedTotal,
      expiryDate: expiryDate.toISOString(),
    });

    const order = await Order.create({
      user: userId,
      courseDetails,
      totalAmount: calculatedTotal,
      subtotal: calculatedSubtotal,
      discount: verifiedDiscount,
      paymentMethod,
      paymentId,
      currency,
      status: paymentStatus || "completed",
      expiryDate: expiryDate,
      couponCode: couponCode || null,
      couponId: couponId,
    });

    console.log("✅ Order created successfully:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: calculatedTotal,
    });

    // Update coupon usage count
    if (couponId) {
      try {
        const Coupon =
          mongoose.models.Coupon || require("@/models/couponSchema").default;
        await Coupon.findByIdAndUpdate(couponId, {
          $inc: { usedCount: 1 },
        });
        console.log("✅ Coupon usage count updated");
      } catch (err) {
        console.error("⚠️ Failed to update coupon count:", err);
      }
    }

    // ============= EMAIL NOTIFICATION =============
    try {
      let emailUser = await authUserModel.findById(userId);
      if (!emailUser) {
        emailUser = await authUserModel.findOne({ email: session.user.email });
      }

      if (emailUser) {
        await sendOrderConfirmationEmail({
          userEmail: emailUser.email,
          userName: emailUser.name || "Customer",
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          items: courseDetails,
          totalAmount: calculatedTotal,
          currency: order.currency,
          paymentMethod,
          expiryDate,
        });
        console.log("✅ Order confirmation email sent");
      }
    } catch (emailError) {
      console.error("❌ Email failed:", emailError.message);
    }

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: calculatedTotal,
      expiryDate: expiryDate.toISOString(),
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Order creation failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order creation failed: ${error.message}` },
      { status: 500 },
    );
  }
}

// ================== GET ==================
export async function GET(request) {
  try {
    console.log("Route hit: /api/order [GET]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 },
      );
    }

    const user = await UserInfo.findOne({ authUserId: session.user.id });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 },
        );
      }
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ purchaseDate: -1 })
      .lean();

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("❌ Order retrieval failed:", error);
    return NextResponse.json(
      { error: `Order retrieval failed: ${error.message}` },
      { status: 500 },
    );
  }
}

// ================== PATCH ==================
export async function PATCH(request) {
  try {
    console.log("Route hit: /api/order [PATCH]");
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 },
      );
    }

    const user = await UserInfo.findOne({ authUserId: session.user.id });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { orderId, courseDetails, status } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

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

    const updateData = {};
    if (courseDetails) updateData.courseDetails = courseDetails;
    if (status) updateData.status = status;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true },
    );

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
        }
      } catch (emailError) {
        console.error("❌ Email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder._id,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("❌ Order update failed:", error);
    return NextResponse.json(
      { error: `Order update failed: ${error.message}` },
      { status: 500 },
    );
  }
}
