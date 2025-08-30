import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";
import UserInfo from "@/models/userInfoSchema";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import Product from "@/models/productListSchema"; // Add this import

// Define authUsers model to ensure it's registered before use
const authUserModel = mongoose.models.authUsers || mongoose.model('authUsers', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  emailVerified: { type: Date },
}, { collection: 'authUsers' }));

// GET /api/student/orders
// Returns orders for the authenticated student. Admins can also call this to see their own orders.
export async function GET(request) {
  try {
    console.log("Route hit: /api/student/orders [GET]");
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

    const userId = session.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const user = await UserInfo.findOne({ authUserId: userId }).select("role");
    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "student" && user.role !== "admin") {
      console.error("Forbidden: User is not a student or admin", {
        userId,
        role: user.role,
      });
      return NextResponse.json(
        { error: "Forbidden: Access restricted to students or admins" },
        { status: 403 }
      );
    }

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("courseDetails.courseId", "title")
      .sort({ purchaseDate: -1 })
      .lean();

    console.log("Orders retrieved for user:", {
      count: orders.length,
      userId,
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
