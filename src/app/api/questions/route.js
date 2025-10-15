import { connectMongoDB } from "@/lib/mongo";
import Question from "@/models/questionSchema";
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Add new question
export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
 console.log(data)
    const { examId, questionType } = data;
    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const questionData = {
      examId,
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

    // ✅ Question image
    const questionImageFile = formData.get("questionImage");
    if (questionImageFile instanceof Blob && questionImageFile.size > 0) {
      questionData.questionImage = await uploadImage(questionImageFile);
    }

    // ✅ Matching type
    if (questionType === "matching") {
      const matchingPairs = JSON.parse(data.matchingPairs || "{}");

      const processedLeftItems = await Promise.all(
        (matchingPairs.leftItems || []).map(async (item) => {
          const imageFile = formData.get(`matchingImage-${item.id}`);
          if (imageFile instanceof Blob && imageFile.size > 0) {
            item.image = await uploadImage(imageFile);
          }
          return item;
        })
      );

      const processedRightItems = await Promise.all(
        (matchingPairs.rightItems || []).map(async (item) => {
          const imageFile = formData.get(`matchingImage-${item.id}`);
          if (imageFile instanceof Blob && imageFile.size > 0) {
            item.image = await uploadImage(imageFile);
          }
          return item;
        })
      );

      questionData.matchingPairs = {
        leftItems: processedLeftItems,
        rightItems: processedRightItems,
        correctMatches: matchingPairs.correctMatches || {},
      };
    } else {
      // ✅ MCQ type
      const options = JSON.parse(data.options || "[]");
      const correctAnswers = JSON.parse(data.correctAnswers || "[]");

      const processedOptions = await Promise.all(
        options.map(async (option, index) => {
          const optionImageFile = formData.get(`optionImage-${index}`);
          if (optionImageFile instanceof Blob && optionImageFile.size > 0) {
            option.image = await uploadImage(optionImageFile);
          }
          return option;
        })
      );

      questionData.options = processedOptions;
      questionData.correctAnswers = correctAnswers;
    }

    console.log("✅ Final questionData before save:", questionData);

    const newQuestion = await Question.create(questionData);

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating question:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create question" },
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