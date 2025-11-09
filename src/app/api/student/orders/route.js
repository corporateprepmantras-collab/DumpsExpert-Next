import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import Product from "@/models/productListSchema";

// Ensure authUsers model is registered once
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

export async function GET(request) {
  try {
    console.log("📡 Route hit: /api/student/orders [GET]");
    await connectMongoDB();

    // Check session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Fetch user info
    const user = await UserInfo.findOne({ authUserId: userId }).select("role");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow only students and admins
    if (user.role !== "student" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access restricted to students or admins" },
        { status: 403 }
      );
    }

    // Auto-delete expired PDF orders (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await Order.deleteMany({
      purchaseDate: { $lt: ninetyDaysAgo },
      "courseDetails.name": { $regex: "\\[PDF\\]", $options: "i" },
    });

    if (deleted.deletedCount > 0) {
      console.log(`🧹 Deleted ${deleted.deletedCount} expired PDF orders`);
    }

    // Fetch active orders
    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .sort({ purchaseDate: -1 })
      .lean();

    // Enrich orders with current product data (including mainPdfUrl)
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const enrichedCourseDetails = await Promise.all(
          order.courseDetails.map(async (course) => {
            try {
              // Fetch latest product data
              const product = await Product.findById(
                course.productId || course.courseId
              ).lean();

              if (product) {
                // Merge current product data with order course data
                return {
                  ...course,
                  mainPdfUrl: product.mainPdfUrl || course.mainPdfUrl || "",
                  samplePdfUrl:
                    product.samplePdfUrl || course.samplePdfUrl || "",
                  imageUrl: product.imageUrl || course.imageUrl || "",
                  // Keep other fields updated too
                  title: product.title || course.name,
                  name: course.name, // Keep original purchase name
                  status: product.status || course.status,
                };
              }

              return course;
            } catch (err) {
              console.error(
                `Error fetching product for course ${course.courseId}:`,
                err
              );
              return course;
            }
          })
        );

        return {
          ...order,
          courseDetails: enrichedCourseDetails,
        };
      })
    );

    console.log(
      `✅ Retrieved ${enrichedOrders.length} active orders for user ${userId}`
    );

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error("❌ Order retrieval failed:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Order retrieval failed: ${error.message}` },
      { status: 500 }
    );
  }
}
