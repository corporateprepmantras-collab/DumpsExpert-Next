// ================================
// FILE: src/app/api/student/profile/route.js
// ================================
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import Student from "@/models/studentSchema";
import { serializeMongoDoc } from "@/lib/mongoHelpers";

// ✅ GET → Fetch student profile by ID
export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(serializeMongoDoc(student));
  } catch (error) {
    console.error("❌ GET /api/student/profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ✅ POST → Create new student profile
export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: body.email });
    if (existingStudent) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create new student
    const newStudent = await Student.create(body);
    const serialized = serializeMongoDoc(newStudent.toObject());

    return NextResponse.json(
      {
        message: "Profile created successfully",
        data: serialized,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /api/student/profile error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create profile" },
      { status: 500 }
    );
  }
}

// ✅ PUT/PATCH → Update student profile
export async function PUT(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    return NextResponse.json({
      message: "Profile updated successfully",
      data: serializeMongoDoc(updatedStudent),
    });
  } catch (error) {
    console.error("❌ PUT /api/student/profile error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid student ID format" },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

// ✅ PATCH → Same as PUT
export async function PATCH(request) {
  return PUT(request);
}

// ✅ DELETE → Delete student profile
export async function DELETE(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await Student.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/student/profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete profile" },
      { status: 500 }
    );
  }
}
