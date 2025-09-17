import { connectMongoDB } from "@/lib/mongo";
import Question from "@/models/questionSchema";
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
// ✅ Get a single question by ID
export async function GET(request, { params }) {
  try {
    // Extract question ID from parameters
    const { id } = await params;
    
    // Check if ID is provided
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the question by ID
    const question = await Question.findById(id);
    
    // Check if question exists
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }
    
    // Return the question data
    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Update a question by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    // Process options and correctAnswers
    const options = JSON.parse(data.options || '[]');
    const correctAnswers = JSON.parse(data.correctAnswers || '[]');
    
    // Upload question image if exists
    const questionImageFile = formData.get('questionImage');
    let questionImageUrl = data.questionImage; // Keep existing if not updated
    if (questionImageFile instanceof Blob && questionImageFile.size > 0) {
      questionImageUrl = await uploadImage(questionImageFile);
    }

    // Upload option images
    const processedOptions = await Promise.all(
      options.map(async (option, index) => {
        const optionImageFile = formData.get(`optionImage-${index}`);
        if (optionImageFile instanceof Blob && optionImageFile.size > 0) {
          option.image = await uploadImage(optionImageFile);
        }
        return option;
      })
    );

    // Update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        ...data,
        questionImage: questionImageUrl,
        options: processedOptions,
        correctAnswers,
        marks: Number(data.marks),
        negativeMarks: Number(data.negativeMarks),
        isSample: data.isSample === 'true',
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedQuestion },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to update question" },
      { status: 500 }
    );
  }
}

// ✅ Delete a question by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }
    
    await connectMongoDB();

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to delete question" },
      { status: 500 }
    );
  }
}

// Helper function to upload image to Cloudinary
async function uploadImage(imageFile) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}