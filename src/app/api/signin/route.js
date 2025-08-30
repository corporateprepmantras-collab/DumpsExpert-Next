// import { NextResponse } from 'next/server';
// import { connectMongoDB } from '@/lib/mongo';
// import UserInfo from '@/models/userInfoSchema';
// import authUsers from '@/app/api/order/route.js';
// import { signIn } from 'next-auth';

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     console.log("Received sign-in request for:", email);

//     if (!email || !password) {
//       return NextResponse.json(
//         { message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     await connectMongoDB();
//     const userInfo = await UserInfo.findOne({ email }).select('+password');
//     if (!userInfo || !userInfo.isVerified) {
//       return NextResponse.json(
//         { message: 'User not found or not verified. Please sign up.' },
//         { status: 400 }
//       );
//     }

//     const isPasswordValid = await userInfo.comparePassword(password);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { message: 'Invalid password' },
//         { status: 400 }
//       );
//     }

//     const authUser = await authUsers.findOne({ _id: userInfo.authUserId });
//     if (!authUser) {
//       return NextResponse.json(
//         { message: 'Auth user not found' },
//         { status: 400 }
//       );
//     }

//     const result = await signIn('credentials', {
//       email,
//       password,
//       redirect: false,
//     });

//     if (!result?.ok) {
//       console.error('NextAuth signIn failed:', result?.error || 'Unknown error');
//       return NextResponse.json(
//         { message: 'Authentication failed' },
//         { status: 401 }
//       );
//     }

//     return NextResponse.json(
//       { message: 'Sign-in successful' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error during sign-in:', {
//       error: error.message,
//       stack: error.stack,
//     });
//     return NextResponse.json(
//       { message: `Sign-in failed: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/announcements/route.js
export async function GET() {
  return new Response("Not implemented", { status: 404 });
}
