// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/mongo";
// import Cart from "@/models/cart";
// import Exam from "@/models/examCodeSchema";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth/authOptions";

// // Populate online item prices & include slug
// async function populateOnlineItemPrices(items) {
//   return Promise.all(
//     items.map(async (item) => {
//       if (
//         item.type === "online" &&
//         (!item.priceINR || !item.priceUSD || !item.slug)
//       ) {
//         const exam = await Exam.findOne({ productId: item.productId }).lean();
//         if (exam) {
//           return {
//             ...item,
//             priceINR: exam.priceINR,
//             priceUSD: exam.priceUSD,
//             price: exam.priceINR,
//             slug: exam.slug || item.slug || "",
//           };
//         }
//       }
//       return item;
//     })
//   );
// }

// // GET Cart
// export async function GET(request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     await connectMongoDB();
//     const userId = session.user.id;
//     const cart = await Cart.findOne({ user: userId }).lean();

//     const updatedItems = cart?.items
//       ? await populateOnlineItemPrices(cart.items)
//       : [];

//     return NextResponse.json({ items: updatedItems });
//   } catch (err) {
//     console.error("Cart fetch failed:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch cart" },
//       { status: 500 }
//     );
//   }
// }

// // POST Cart
// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { items } = await request.json();
//     if (!Array.isArray(items))
//       return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });

//     await connectMongoDB();
//     const userId = session.user.id;
//     const updatedItems = await populateOnlineItemPrices(items);

//     const result = await Cart.findOneAndUpdate(
//       { user: userId },
//       { items: updatedItems, lastUpdated: new Date() },
//       { upsert: true, new: true }
//     );

//     return NextResponse.json({ success: true, items: result.items });
//   } catch (err) {
//     console.error("Cart update failed:", err);
//     return NextResponse.json(
//       { error: "Failed to update cart" },
//       { status: 500 }
//     );
//   }
// }
