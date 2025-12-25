// // app/api/student/stats/route.js
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/authOptions";
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Order from "@/models/Order"; // Adjust path as needed

// export async function GET(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const studentId = session.user.id || session.user._id;

//     // Fetch orders for this student
//     const orders = await Order.find({ studentId })
//       .select("status")
//       .lean();

//     // Calculate completed and pending
//     const completed = orders.filter(order => 
//       order.status === 'completed' || 
//       order.status === 'delivered' ||
//       order.status === 'success'
//     ).length;

//     const pending = orders.filter(order => 
//       order.status === 'pending' || 
//       order.status === 'processing' ||
//       order.status === 'payment_pending'
//     ).length;

//     return NextResponse.json({
//       success: true,
//       data: {
//         completed,
//         pending,
//         total: orders.length,
//       },
//     });

//   } catch (error) {
//     console.error("Stats API Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: "Failed to fetch stats",
//         data: { completed: 0, pending: 0, total: 0 }
//       },
//       { status: 500 }
//     );
//   }
// }