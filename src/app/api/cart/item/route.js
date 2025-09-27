import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Cart from "@/models/cartSchema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

// POST: Add item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const item = await request.json();
    if (!item._id || !item.type) {
      return NextResponse.json(
        { error: "Invalid item data" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // Check if item already exists in cart
    const existingCart = await Cart.findOne({
      user: userId,
      'items.productId': item._id,
      'items.type': item.type
    });
    
    let result;
    
    if (existingCart) {
      // Find the item in the cart
      const cartItem = existingCart.items.find(
        i => i.productId.toString() === item._id && i.type === item.type
      );
      
      // Update quantity if item exists
      result = await Cart.findOneAndUpdate(
        { 
          user: userId,
          'items.productId': item._id,
          'items.type': item.type 
        },
        { 
          $set: { 
            'items.$.quantity': item.quantity || (cartItem ? cartItem.quantity + 1 : 1),
            'items.$.price': item.price || cartItem.price,
            'items.$.title': item.title || cartItem.title,
            lastUpdated: new Date()
          }
        },
        { new: true }
      );
    } else {
      // Add new item if it doesn't exist
      const cartItem = {
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        type: item.type,
        imageUrl: item.imageUrl,
        samplePdfUrl: item.samplePdfUrl,
        mainPdfUrl: item.mainPdfUrl
      };
      
      result = await Cart.findOneAndUpdate(
        { user: userId },
        { 
          $push: { items: cartItem },
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      items: result.items 
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const type = searchParams.get('type');
    
    console.log(`DELETE request - productId: ${productId}, type: ${type}`);
    
    if (!productId || !type) {
      return NextResponse.json(
        { error: "Missing product ID or type" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // First, let's find the cart to debug
    const cart = await Cart.findOne({ user: userId });
    console.log('Current cart items:', cart?.items?.map(item => ({
      productId: item.productId.toString(),
      _id: item._id.toString(),
      type: item.type
    })));
    
    // Try to remove using both productId and _id to handle the mismatch
    const result = await Cart.findOneAndUpdate(
      { user: userId },
      { 
        $pull: { 
          items: { 
            $or: [
              { productId: productId, type: type },
              { _id: productId, type: type }
            ]
          }
        },
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }
    
    const totalQuantity = result.items.reduce((total, item) => total + item.quantity, 0);
    
    console.log(`After deletion - Remaining items: ${result.items.length}, Total quantity: ${totalQuantity}`);

    return NextResponse.json({ 
      success: true, 
      items: result.items,
      totalQuantity: totalQuantity
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update item quantity
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, type, operation, quantity } = body;
    
    console.log("PATCH request received:", { productId, type, operation, quantity });
    
    // Allow direct quantity update or increment/decrement operations
    if (!productId || !type || (!operation && quantity === undefined)) {
      return NextResponse.json(
        { error: "Missing required fields", received: body },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // Find the cart directly and update the item
    let updateOperation;
    
    if (quantity !== undefined) {
      // Direct quantity update (must be at least 1)
      updateOperation = {
        $set: { 
          'items.$.quantity': Math.max(1, quantity),
          lastUpdated: new Date()
        }
      };
    } else if (operation === 'inc') {
      updateOperation = {
        $inc: { 'items.$.quantity': 1 },
        $set: { lastUpdated: new Date() }
      };
    } else if (operation === 'dec') {
      // Find the current item to check its quantity
      const cart = await Cart.findOne({
        user: userId,
        'items.productId': productId,
        'items.type': type
      });
      
      if (!cart) {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }
      
      const item = cart.items.find(
        i => i.productId.toString() === productId && i.type === type
      );
      
      if (!item) {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }
      
      // Ensure quantity doesn't go below 1
      const newQuantity = Math.max(1, item.quantity - 1);
      
      updateOperation = {
        $set: { 
          'items.$.quantity': newQuantity,
          lastUpdated: new Date()
        }
      };
    }
    
    const result = await Cart.findOneAndUpdate(
      { 
        user: userId,
        'items.productId': productId,
        'items.type': type 
      },
      updateOperation,
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      items: result.items,
      totalQuantity: result.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return NextResponse.json(
      { error: "Failed to update item quantity", message: error.message },
      { status: 500 }
    );
  }
}