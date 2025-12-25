import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Payment from "@/models/paymentSchema";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = session.user.id;

    const payments = await Payment.find({ user: userId })
      .select("status")
      .lean();

    const completed = payments.filter(
      (p) => p.status === "completed" || p.status === "success"
    ).length;

    const pending = payments.filter(
      (p) => p.status === "pending" || p.status === "processing"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        completed,
        pending,
        total: payments.length,
      },
    });
  } catch (error) {
    console.error("❌ Student stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stats",
        data: { completed: 0, pending: 0, total: 0 },
      },
      { status: 500 }
    );
  }
}
