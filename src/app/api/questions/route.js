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
    console.log("📥 Received data:", data);

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

    // ✅ Handle multiple question images
    const questionImageFiles = formData.getAll("questionImages");
    const uploadedQuestionImages = [];

    for (const file of questionImageFiles) {
      if (file instanceof Blob && file.size > 0) {
        const url = await uploadImage(file);
        uploadedQuestionImages.push(url);
      }
    }

    if (uploadedQuestionImages.length > 0) {
      questionData.questionImages = uploadedQuestionImages;
    }

    // ✅ Handle options for radio/checkbox types
    if (questionType === "radio" || questionType === "checkbox") {
      const options = JSON.parse(data.options || "[]");

      // Process each option's images
      const processedOptions = await Promise.all(
        options.map(async (option, index) => {
          const optionImageFiles = formData.getAll(`optionImages-${index}`);
          const uploadedImages = [];

          for (const file of optionImageFiles) {
            if (file instanceof Blob && file.size > 0) {
              const url = await uploadImage(file);
              uploadedImages.push(url);
            }
          }

          return {
            ...option,
            images: uploadedImages,
          };
        })
      );

      questionData.options = processedOptions;
      questionData.correctAnswers = JSON.parse(data.correctAnswers || "[]");
    }

    // ✅ Handle matching type with multiple images
    if (questionType === "matching") {
      const matchingPairs = JSON.parse(data.matchingPairs || "{}");

      const processItems = async (items, side) => {
        return Promise.all(
          (items || []).map(async (item) => {
            const imageFiles = formData.getAll(
              `matchingImages-${side}-${item.id}`
            );
            const uploadedUrls = [];

            // Upload files
            for (const file of imageFiles) {
              if (file instanceof Blob && file.size > 0) {
                const url = await uploadImage(file);
                uploadedUrls.push(url);
              }
            }

            // Get pasted URLs from frontend
            const pastedUrls = JSON.parse(
              data[`pastedImages-${side}-${item.id}`] || "[]"
            );

            return {
              ...item,
              images: [...uploadedUrls, ...pastedUrls], // Combine uploaded and pasted
            };
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
      { success: false, message: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

// ✅ Update existing question (PUT)
export async function PUT(request, { params }) {
  try {
    await connectMongoDB();

    const { questionId } = params;
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const { questionType } = data;

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

    // Handle multiple question images
    const questionImageFiles = formData.getAll("questionImages");
    if (questionImageFiles.length > 0) {
      const uploadedQuestionImages = [];
      for (const file of questionImageFiles) {
        if (file instanceof Blob && file.size > 0) {
          const url = await uploadImage(file);
          uploadedQuestionImages.push(url);
        }
      }
      if (uploadedQuestionImages.length > 0) {
        updateData.questionImages = uploadedQuestionImages;
      }
    }

    // Handle options
    if (questionType === "radio" || questionType === "checkbox") {
      const options = JSON.parse(data.options || "[]");

      const processedOptions = await Promise.all(
        options.map(async (option, index) => {
          const optionImageFiles = formData.getAll(`optionImages-${index}`);
          const uploadedImages = [];

          for (const file of optionImageFiles) {
            if (file instanceof Blob && file.size > 0) {
              const url = await uploadImage(file);
              uploadedImages.push(url);
            }
          }

          return {
            ...option,
            images:
              uploadedImages.length > 0 ? uploadedImages : option.images || [],
          };
        })
      );

      updateData.options = processedOptions;
      updateData.correctAnswers = JSON.parse(data.correctAnswers || "[]");
    }

    // Handle matching type
    if (questionType === "matching") {
      const matchingPairs = JSON.parse(data.matchingPairs || "{}");

      const processItems = async (items, side) => {
        return Promise.all(
          (items || []).map(async (item) => {
            const imageFiles = formData.getAll(
              `matchingImages-${side}-${item.id}`
            );
            const uploadedUrls = [];

            for (const file of imageFiles) {
              if (file instanceof Blob && file.size > 0) {
                const url = await uploadImage(file);
                uploadedUrls.push(url);
              }
            }

            const pastedUrls = JSON.parse(
              data[`pastedImages-${side}-${item.id}`] || "[]"
            );

            return {
              ...item,
              images:
                uploadedUrls.length > 0 || pastedUrls.length > 0
                  ? [...uploadedUrls, ...pastedUrls]
                  : item.images || [],
            };
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

      updateData.matchingPairs = {
        leftItems: processedLeftItems,
        rightItems: processedRightItems,
        correctMatches: matchingPairs.correctMatches || {},
      };
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updateData,
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
    console.error("❌ Error updating question:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update question" },
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
      { resource_type: "image", folder: "exam-questions" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
