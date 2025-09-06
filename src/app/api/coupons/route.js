// app/api/coupons/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Coupon from "@/models/couponSchema";

// GET: Fetch all coupons
export async function GET() {
  try {
    await connectMongoDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error("Error retrieving coupons:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new coupon
export async function POST(request) {
  try {
    await connectMongoDB();
    const { name, discount, startDate, endDate } = await request.json();

    if (!name || !discount || !startDate || !endDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `${trimmedName}_${randomSuffix}`;

    const newCoupon = new Coupon({
      name: trimmedName,
      code,
      discount,
      startDate,
      endDate,
    });

    const savedCoupon = await newCoupon.save();
    return NextResponse.json(savedCoupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}