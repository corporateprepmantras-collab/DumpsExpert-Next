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
    
    if (!productId || !type) {
      return NextResponse.json(
        { error: "Missing product ID or type" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // Log the deletion attempt
    console.log(`Attempting to delete item: ${productId} of type ${type} for user ${userId}`);
    
    // Find the cart first to verify the item exists
    const cart = await Cart.findOne({
      user: userId,
      'items.productId': productId,
      'items.type': type
    });
    
    if (!cart) {
      console.log(`Cart or item not found for user ${userId}`);
      return NextResponse.json({ 
        success: false, 
        error: "Item not found in cart",
        items: []
      }, { status: 404 });
    }
    
    // Perform the deletion
    const result = await Cart.findOneAndUpdate(
      { user: userId },
      { 
        $pull: { items: { productId: productId, type: type } },
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    console.log(`Item deleted, remaining items: ${result?.items?.length || 0}`);

    return NextResponse.json({ 
      success: true, 
      items: result?.items || [] 
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
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

    const { productId, type, operation, quantity } = await request.json();
    
    // Allow direct quantity update or increment/decrement operations
    if (!productId || !type || (!operation && quantity === undefined)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const userId = session.user.id;
    
    // Find the cart and the specific item
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
    
    // Find the item and update its quantity
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.type === type
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }
    
    // Update quantity based on operation or direct quantity
    if (quantity !== undefined) {
      // Direct quantity update (must be at least 1)
      cart.items[itemIndex].quantity = Math.max(1, quantity);
    } else if (operation === 'inc') {
      cart.items[itemIndex].quantity += 1;
    } else if (operation === 'dec') {
      cart.items[itemIndex].quantity = Math.max(1, cart.items[itemIndex].quantity - 1);
    }
    
    cart.lastUpdated = new Date();
    await cart.save();

    return NextResponse.json({ 
      success: true, 
      items: cart.items,
      totalQuantity: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return NextResponse.json(
      { error: "Failed to update item quantity" },
      { status: 500 }
    );
  }
}