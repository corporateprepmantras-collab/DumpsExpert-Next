import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Cart from "@/models/cartSchema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

// GET: Fetch user's cart
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
    
    // Find cart with caching headers for performance
    const cart = await Cart.findOne({ user: userId }).lean();
    
    // Return empty cart if none exists
    if (!cart) {
      return NextResponse.json({ items: [] }, {
        headers: {
          'Cache-Control': 'private, max-age=30',
        }
      });
    }
    
    return NextResponse.json({ items: cart.items || [] }, {
      headers: {
        'Cache-Control': 'private, max-age=30',
        'ETag': `"${cart.lastUpdated.getTime()}"`
      }
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST: Update entire cart (sync from client)
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
      return NextResponse.json(
        { error: "Invalid cart data" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // Update with upsert to create if doesn't exist
    const result = await Cart.findOneAndUpdate(
      { user: userId },
      { 
        items,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      items: result.items 
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}