import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongo";
import GeneralFAQ from "@/models/generalFAQ";
// ---------- DB Connection ----------


// ---------- GET: Fetch all FAQs ----------
export async function GET() {
  try {
    await connectMongoDB();
    const faqs = await GeneralFAQ.find().sort({ createdAt: -1 });
    return NextResponse.json(faqs, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch general FAQs", error: err.message },
      { status: 500 }
    );
  }
}

// ---------- POST: Add new FAQ ----------
export async function POST(request) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { message: "Both question and answer are required." },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const newFaq = await GeneralFAQ.create({ question, answer });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to add FAQ", error: err.message },
      { status: 500 }
    );
  }
}
