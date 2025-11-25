// ================================
// FILE: src/models/studentSchema.js
// ================================
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    // Profile Information
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    profileImage: {
      type: String, // URL to image
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    // Academic Information
    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
    },
    university: {
      type: String,
      trim: true,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Address Information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: "India" },
    },

    // Skills & Certifications
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String },
        issueDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String },
      },
    ],

    // Social Links
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Additional Fields
    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "students",
  }
);

// Indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ createdAt: -1 });

// Virtual for full name
studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;

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
