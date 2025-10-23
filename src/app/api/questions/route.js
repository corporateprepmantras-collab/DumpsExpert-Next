import { connectMongoDB } from "@/lib/mongo";
import Question from "@/models/questionSchema";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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
    console.log(data);
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
    // ✅ Matching type
    if (questionType === "matching") {
      const matchingPairs = JSON.parse(data.matchingPairs || "{}");

      const processItems = async (items, side) => {
        return Promise.all(
          (items || []).map(async (item) => {
            const imageFiles = formData.getAll(
              `matchingImages-${side}-${item.id}`
            ); // multiple files
            const uploadedUrls = [];

            for (const file of imageFiles) {
              if (file instanceof Blob && file.size > 0) {
                const url = await uploadImage(file);
                uploadedUrls.push(url);
              }
            }

            // ✅ Also handle pasted URLs from frontend
            const pastedUrls = JSON.parse(
              data[`pastedImages-${side}-${item.id}`] || "[]"
            );

            item.images = [...uploadedUrls, ...pastedUrls]; // array of all image URLs
            return item;
          })
        );
      };

      const processedLeftItems = await processItems(
        matchingPairs.leftItems,
        "left"
      );
      const processedRightItems = await processItems(
        matchingPairs.rightItems,
        "right"
      );

      questionData.matchingPairs = {
        leftItems: processedLeftItems,
        rightItems: processedRightItems,
        correctMatches: matchingPairs.correctMatches || {},
      };
    }

    console.log("✅ Final questionData before save:", questionData);

    const newQuestion = await Question.create(questionData);

    return NextResponse.json(
      { success: true, data: newQuestion },
      { status: 201 }
    );
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
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
