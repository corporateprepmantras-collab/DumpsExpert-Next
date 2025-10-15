import { connectMongoDB } from "@/lib/mongo";
import Question from "@/models/questionSchema";
import { NextResponse } from 'next/server';

// ✅ Get a single question by ID for editing
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Question ID is required" },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    const question = await Question.findById(id);
    
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }
    
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
    const { questionType } = data;

    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    const updateData = {
      questionText: data.questionText,
      questionCode: data.questionCode,
      questionType,
      difficulty: data.difficulty,
      marks: Number(data.marks),
      negativeMarks: Number(data.negativeMarks),
      subject: data.subject,
      topic: data.topic,
      tags: JSON.parse(data.tags || "[]"),
      isSample: data.isSample === "true",
      explanation: data.explanation,
      status: data.status,
    };

    const questionImageFile = formData.get("questionImage");
    if (questionImageFile instanceof Blob && questionImageFile.size > 0) {
      updateData.questionImage = await uploadImage(questionImageFile);
    } else {
      updateData.questionImage = existingQuestion.questionImage;
    }

    if (questionType === "matching") {
      const matchingPairs = JSON.parse(data.matchingPairs || "{}");

      const processedLeftItems = await Promise.all(
        (matchingPairs.leftItems || []).map(async (item, index) => {
          const imageFile = formData.get(`matchingImage-${item.id}`);
          if (imageFile instanceof Blob && imageFile.size > 0) {
            item.image = await uploadImage(imageFile);
          } else {
            const existingItem = existingQuestion.matchingPairs?.leftItems?.[index];
            if (existingItem && existingItem.image) {
              item.image = existingItem.image;
            }
          }
          return item;
        })
      );

      const processedRightItems = await Promise.all(
        (matchingPairs.rightItems || []).map(async (item, index) => {
          const imageFile = formData.get(`matchingImage-${item.id}`);
          if (imageFile instanceof Blob && imageFile.size > 0) {
            item.image = await uploadImage(imageFile);
          } else {
            const existingItem = existingQuestion.matchingPairs?.rightItems?.[index];
            if (existingItem && existingItem.image) {
              item.image = existingItem.image;
            }
          }
          return item;
        })
      );

      updateData.matchingPairs = {
        leftItems: processedLeftItems,
        rightItems: processedRightItems,
        correctMatches: matchingPairs.correctMatches || {},
      };
    } else {
      const options = JSON.parse(data.options || "[]");
      const correctAnswers = JSON.parse(data.correctAnswers || "[]");

      const processedOptions = await Promise.all(
        options.map(async (option, index) => {
          const optionImageFile = formData.get(`optionImage-${index}`);
          if (optionImageFile instanceof Blob && optionImageFile.size > 0) {
            option.image = await uploadImage(optionImageFile);
          } else {
            const existingOption = existingQuestion.options?.[index];
            if (existingOption && existingOption.image) {
              option.image = existingOption.image;
            }
          }
          return option;
        })
      );

      updateData.options = processedOptions;
      updateData.correctAnswers = correctAnswers;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: updatedQuestion }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating question:", error);
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