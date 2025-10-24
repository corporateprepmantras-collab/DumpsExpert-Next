import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Coupon from "@/models/couponSchema";

// POST: Validate a coupon by code
export async function POST(request) {
  try {
    await connectMongoDB();
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    const currentDate = new Date();
    if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
      return NextResponse.json(
        { message: "Coupon is expired or not yet active" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Coupon is valid",
        coupon: {
          id: coupon._id,
          code: coupon.code,
          discount: coupon.discount,
          name: coupon.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}