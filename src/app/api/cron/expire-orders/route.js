// app/api/cron/expire-orders/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Order from "@/models/orderSchema";

export async function GET(request) {
  try {
    // Verify cron secret to secure the endpoint
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("Unauthorized cron job request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕐 Starting expiry check cron job...");
    await connectMongoDB();

    const now = new Date();
    
    // Find all orders with expired items that haven't been marked as expired yet
    const ordersToUpdate = await Order.find({
      "courseDetails.expiryDate": { $lt: now },
      "courseDetails.isExpired": false,
    });

    console.log(`Found ${ordersToUpdate.length} orders with expired items`);

    let totalExpiredItems = 0;
    let ordersUpdated = 0;

    for (const order of ordersToUpdate) {
      let hasExpiredItems = false;
      
      // Update each course detail that has expired
      const updatedCourseDetails = order.courseDetails.map((item) => {
        if (item.expiryDate && new Date(item.expiryDate) < now && !item.isExpired) {
          hasExpiredItems = true;
          totalExpiredItems++;
          return {
            ...item.toObject(),
            isExpired: true,
            mainPdfUrl: "", // Clear PDF URL
          };
        }
        return item;
      });

      if (hasExpiredItems) {
        await Order.updateOne(
          { _id: order._id },
          { $set: { courseDetails: updatedCourseDetails } }
        );
        ordersUpdated++;
        console.log(`✅ Expired ${totalExpiredItems} items in order ${order.orderNumber}`);
      }
    }

    console.log(`🎉 Expiry check complete: ${ordersUpdated} orders updated, ${totalExpiredItems} items expired`);

    return NextResponse.json({
      success: true,
      ordersUpdated,
      itemsExpired: totalExpiredItems,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("❌ Expiry cron job failed:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Expiry check failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// Alternative POST method for manual triggering
export async function POST(request) {
  return GET(request);
}