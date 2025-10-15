import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Cart from "@/models/cartSchema";
import Exam from "@/models/examCodeSchema"; // ✅ import your exam model
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

// ✅ Utility function to populate missing prices
async function populateOnlineItemPrices(items) {
  const updatedItems = await Promise.all(
    items.map(async (item) => {
      if (item.type === "online" && (!item.priceINR || !item.priceUSD)) {
        try {
          const exam = await Exam.findOne({ productId: item.productId }).lean();
          if (exam) {
            return {
              ...item,
              priceINR: exam.priceINR,
              priceUSD: exam.priceUSD,
              price: exam.priceINR, // Default to INR
            };
          }
        } catch (err) {
          console.error(
            "Error fetching price for product:",
            item.productId,
            err
          );
        }
      }
      return item;
    })
  );
  return updatedItems;
}

// 🟢 GET: Fetch user's cart
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;

    let cart = await Cart.findOne({ user: userId }).lean();

    // Return empty if none exists
    if (!cart) {
      return NextResponse.json(
        { items: [] },
        {
          headers: { "Cache-Control": "private, max-age=30" },
        }
      );
    }

    // ✅ Populate missing prices before returning
    const updatedItems = await populateOnlineItemPrices(cart.items || []);

    return NextResponse.json(
      { items: updatedItems },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
          ETag: `"${cart.lastUpdated.getTime()}"`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// 🟣 POST: Update entire cart (sync from client)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    await connectMongoDB();
    const userId = session.user.id;

    // ✅ Populate prices before saving to DB
    const updatedItems = await populateOnlineItemPrices(items);

    const result = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: updatedItems,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      items: result.items,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
