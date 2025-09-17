import { connectMongoDB } from "@/lib/mongo";
import Question from "@/models/questionSchema";
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Get all questions by examId
export async function GET(request, { params }) {
  const { examId } = await params;
  try {
    await connectMongoDB();
    const questions = await Question.find({ examId });

    return NextResponse.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Add new question
export async function POST(request, { params }) {
  const { examId } = await params;
  try {
    await connectMongoDB();
    
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    // Process options
    const options = JSON.parse(data.options || '[]');
    const correctAnswers = JSON.parse(data.correctAnswers || '[]');
    
    // Upload question image if exists
    const questionImageFile = formData.get('questionImage');
    let questionImageUrl = '';
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

    // Create new question
    const newQuestion = await Question.create({
      ...data,
      examId,
      questionImage: questionImageUrl,
      options: processedOptions,
      correctAnswers,
      marks: Number(data.marks),
      negativeMarks: Number(data.negativeMarks),
      isSample: data.isSample === 'true',
    });

    return NextResponse.json(
      { success: true, data: newQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to create question" },
      { status: 500 }
    );
  }
}

// ✅ Update question
export async function PUT(request, { params }) {
  const { examId } = params;
  try {
    await connectMongoDB();
    
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const { _id, ...updates } = data;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }

    // Process options
    if (data.options) {
      updates.options = JSON.parse(data.options);
    }
    if (data.correctAnswers) {
      updates.correctAnswers = JSON.parse(data.correctAnswers);
    }

    // Upload question image if exists
    const questionImageFile = formData.get('questionImage');
    if (questionImageFile instanceof Blob && questionImageFile.size > 0) {
      updates.questionImage = await uploadImage(questionImageFile);
    }

    // Upload option images
    if (updates.options) {
      updates.options = await Promise.all(
        updates.options.map(async (option, index) => {
          const optionImageFile = formData.get(`optionImage-${index}`);
          if (optionImageFile instanceof Blob && optionImageFile.size > 0) {
            option.image = await uploadImage(optionImageFile);
          }
          return option;
        })
      );
    }

    // Convert number fields
    if (updates.marks) updates.marks = Number(updates.marks);
    if (updates.negativeMarks) updates.negativeMarks = Number(updates.negativeMarks);
    if (updates.isSample) updates.isSample = updates.isSample === 'true';

    const updatedQuestion = await Question.findOneAndUpdate(
      { _id, examId },
      updates,
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

// ✅ Delete question
export async function DELETE(request, { params }) {
  const { examId } = await params;
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('id');

    if (!questionId) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }

    const deletedQuestion = await Question.findOneAndDelete({
      _id: questionId,
      examId,
    });

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