// app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import {connectMongoDB} from '@/lib/mongo';
import Product from '@/models/productListSchema';
import Exam from '@/models/examCodeSchema';
import Order from '@/models/orderSchema';
import UserInfo from '@/models/userInfoSchema';
import Blog from '@/models/blogSchema';

export async function GET(request) {
  try {
    await connectMongoDB();

    // Get query params
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '5');

    // 1. Count total products
    const products = await Product.countDocuments();

    // 2. Count total exams
    const exams = await Exam.countDocuments();

    // 3. Count customers (total users)
    const customers = await UserInfo.countDocuments();

    // 4. Count students (users with role='student')
const students = await UserInfo.countDocuments({ role: { $in: ['student', 'guest'] } });


    // 5. Count subscribers (users with subscription='yes')
    const subscribers = await UserInfo.countDocuments({ subscription: 'yes' });

    // 6. Count blogs
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'publish' });
    const unpublishedBlogs = await Blog.countDocuments({ status: 'unpublish' });

    // 7. Count total orders
    const totalOrders = await Order.countDocuments({ status: 'completed' });

    // 8. Calculate total sales (INR and USD)
    const salesINR = await Order.aggregate([
      { $match: { status: 'completed', currency: 'INR' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const salesUSD = await Order.aggregate([
      { $match: { status: 'completed', currency: 'USD' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // 9. Get monthly sales data
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          purchaseDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
            currency: '$currency'
          },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data
    const monthlyData = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const inrData = monthlyOrders.find(
        m => m._id.year === year && m._id.month === month && m._id.currency === 'INR'
      );
      
      const usdData = monthlyOrders.find(
        m => m._id.year === year && m._id.month === month && m._id.currency === 'USD'
      );

      monthlyData.push({
        month: monthName,
        salesINR: inrData ? inrData.total : 0,
        salesUSD: usdData ? usdData.total : 0
      });
    }

    // 10. Get recent orders (last 10)
    const recentOrders = await Order.find({ status: 'completed' })
      .sort({ purchaseDate: -1 })
      .limit(10)
      .select('orderNumber purchaseDate paymentMethod totalAmount currency status')
      .lean();

    // 11. Get recent users (last 10)
    const recentUsers = await UserInfo.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role subscription createdAt')
      .lean();
 console.log(totalOrders)
    return NextResponse.json({
      products,
      exams,
      customers,
      students,
      subscribers,
      totalBlogs,
      publishedBlogs,
      unpublishedBlogs,
      orders: totalOrders,
      salesINR: salesINR[0]?.total || 0,
      salesUSD: salesUSD[0]?.total || 0,
      monthlyData,
      recentOrders: recentOrders.map(order => ({
        orderNumber: order.orderNumber,
        date: order.purchaseDate,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status
      })),
      recentUsers: recentUsers.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}