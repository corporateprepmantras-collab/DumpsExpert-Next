import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Coupon from "@/models/couponSchema";

// GET all coupons
export async function GET() {
  try {
    await connectMongoDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create coupon
export async function POST(request) {
  try {
    await connectMongoDB();
    const { name, discountType, discount, maxUseLimit, startDate, endDate } =
      await request.json();

    // validations
    if (
      !name ||
      !discountType ||
      discount == null ||
      !maxUseLimit ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && (discount <= 0 || discount > 100)) {
      return NextResponse.json(
        { error: "Percentage must be between 1-100" },
        { status: 400 }
      );
    }

    if (discountType !== "percentage" && discount <= 0) {
      return NextResponse.json(
        { error: "Fixed discount must be greater than 0" },
        { status: 400 }
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // generate coupon code
    const code =
      name.trim().toUpperCase() + "_" + Math.floor(100 + Math.random() * 900);

    const newCoupon = new Coupon({
      name,
      code,
      discountType,
      discount,
      maxUseLimit,
      startDate,
      endDate,
    });

    const saved = await newCoupon.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
