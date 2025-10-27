import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import Product from "@/models/productSchema"; // Add Product model
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

    if (userId !== session.user.id) {
      console.error("User ID mismatch");
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
      console.error("Missing required fields");
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

    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid items format:", items);
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 }
      );
    }

    const invalidItems = items.filter(
      (item) => !item.title || item.price === undefined
    );
    if (invalidItems.length > 0) {
      console.error("Items missing required fields:", invalidItems);
      return NextResponse.json(
        { error: "All items must have title and price" },
        { status: 400 }
      );
    }

    // ENHANCED: Process items and fetch product details for slug
    const courseDetails = await Promise.all(
      items.map(async (item) => {
        // Extract product ID
        let productId = item.courseId || item.productId || item._id;
        let productSlug = item.slug || "";

        console.log(`Processing item: ${item.title}`, {
          originalId: productId,
          slugFromCart: item.slug,
        });

        // If no slug in cart, try to fetch from product database
        if ((!productSlug || productSlug.trim() === "") && productId) {
          try {
            if (mongoose.Types.ObjectId.isValid(productId)) {
              const product = await Product.findById(productId).select('slug title');
              if (product && product.slug) {
                productSlug = product.slug;
                console.log(`✅ Fetched slug from product DB: "${productSlug}"`);
              } else {
                console.log(`⚠️ Product found but no slug: ${product?.title || productId}`);
              }
            }
          } catch (err) {
            console.log(`⚠️ Could not fetch product ${productId}:`, err.message);
          }
        }

        // Validate or create ObjectId
        let validCourseId;
        if (productId && mongoose.Types.ObjectId.isValid(productId)) {
          validCourseId = new mongoose.Types.ObjectId(productId);
          console.log(`Valid ObjectId: ${validCourseId}`);
        } else {
          validCourseId = new mongoose.Types.ObjectId();
          console.log(`Created placeholder ObjectId: ${validCourseId}`);
        }

        // Build course detail with slug
        const courseDetail = {
          courseId: validCourseId,
          name: item.title || "Untitled Product",
          price: item.price || 0,
          quantity: item.quantity || 1,
          type: item.type || "unknown",
          sapExamCode: item.sapExamCode || "",
          category: item.category || "",
          sku: item.sku || "",
          samplePdfUrl: item.samplePdfUrl || "",
          mainPdfUrl: item.mainPdfUrl || "",
          slug: productSlug, // NOW HAS SLUG FROM PRODUCT DB
          imageUrl: item.imageUrl || "",
          originalId: productId ? String(productId) : "",
        };

        // Log slug status
        if (!courseDetail.slug || courseDetail.slug.trim() === "") {
          console.warn(`⚠️ WARNING: Product "${item.title}" (ID: ${productId}) has no slug in cart OR database!`);
        } else {
          console.log(`✅ Slug saved: "${courseDetail.slug}" for "${item.title}"`);
        }

        return courseDetail;
      })
    );

    console.log("Processed course details:", {
      itemCount: courseDetails.length,
      itemsWithSlugs: courseDetails.filter(item => item.slug && item.slug.trim() !== "").length,
      itemsWithoutSlugs: courseDetails.filter(item => !item.slug || item.slug.trim() === "").length,
      details: courseDetails.map(item => ({
        name: item.name,
        slug: item.slug || "MISSING",
        productId: item.originalId,
      })),
    });

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

    console.log("Order created successfully:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      itemCount: courseDetails.length,
      totalAmount,
      slugs: courseDetails.map(item => item.slug || "NO-SLUG"),
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation failed:", {
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
      .populate("courseDetails.courseId", "title slug")
      .sort({ purchaseDate: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      console.log("No orders found", { userId: userId || "all" });
      return NextResponse.json({ orders: [] });
    }

    console.log("Orders retrieved:", {
      count: orders.length,
      userId: userId || "all",
      sampleOrder: orders[0] ? {
        id: orders[0]._id,
        itemCount: orders[0].courseDetails?.length,
        firstItemSlug: orders[0].courseDetails?.[0]?.slug,
      } : null,
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