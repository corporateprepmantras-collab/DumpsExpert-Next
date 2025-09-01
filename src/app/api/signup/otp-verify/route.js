import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import OTP from "@/models/otpSchema";
import UserInfo from "@/models/userInfoSchema";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, password, name } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord || Date.now() > new Date(otpRecord.otpExpires).getTime()) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    let user = await UserInfo.findOne({ email });

    if (!user) {
      const mongoose = require("mongoose");

      const authUserModel =
        mongoose.models.authUsers ||
        mongoose.model(
          "authUsers",
          new mongoose.Schema(
            {
              email: { type: String, required: true, unique: true },
              name: { type: String },
              image: { type: String },
              emailVerified: { type: Date },
            },
            { collection: "authUsers" }
          )
        );

      const authUser = await authUserModel.create({
        email,
        name: name || email.split("@")[0],
        image: "",
        emailVerified: new Date(),
      });

      user = new UserInfo({
        authUserId: authUser._id,
        email,
        name: name || email.split("@")[0],
        password,
        isVerified: true,
        role: "guest",
        subscription: "no",
        provider: "credentials",
        providerId: "",
        phone: "",
        address: "",
        bio: "",
        profileImage: "",
        createdAt: new Date(),
      });

      await user.save();
    } else {
      user.password = password;
      user.isVerified = true;

      if (!user.authUserId) {
        const mongoose = require("mongoose");
        const authUserModel =
          mongoose.models.authUsers ||
          mongoose.model(
            "authUsers",
            new mongoose.Schema(
              {
                email: { type: String, required: true, unique: true },
                name: { type: String },
                image: { type: String },
                emailVerified: { type: Date },
              },
              { collection: "authUsers" }
            )
          );

        let authUser = await authUserModel.findOne({ email });

        if (!authUser) {
          authUser = await authUserModel.create({
            email,
            name: user.name || email.split("@")[0],
            image: "",
            emailVerified: new Date(),
          });
        }

        user.authUserId = authUser._id;
      }

      await user.save();
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    let dashboardPath = "/dashboard/guest";
    if (user.role === "admin") dashboardPath = "/dashboard/admin";
    else if (user.subscription === "yes") dashboardPath = "/dashboard/student";

    return NextResponse.json({
      message: "Email verified successfully",
      redirect: dashboardPath,
    });
  }catch (error) {
  console.error("Error verifying OTP:", error.message, error.stack);
  return NextResponse.json(
    { message: `Failed to verify OTP: ${error.message}` },
    { status: 500 }
  );
}

}
