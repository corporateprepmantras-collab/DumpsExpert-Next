import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Contact from "@/models/ContactSchema";

// POST - Save contact form
export async function POST(req) {
  try {
    const { fullName, email, subject, message } = await req.json();

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const contactDoc = await Contact.create({ fullName, email, subject, message });

    return NextResponse.json({ success: true, data: contactDoc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve all messages (admin use)
export async function GET() {
  try {
    await connectMongoDB();
    const messages = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
