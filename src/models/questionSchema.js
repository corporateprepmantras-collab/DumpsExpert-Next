import mongoose from "mongoose";

// ✅ Option Schema (supports multiple images)
const optionSchema = new mongoose.Schema({
  label: String,
  text: String,
  images: { type: [String], default: [] }, // 🆕 Multiple images
});

// ✅ Matching Pairs Schema
const matchingPairsSchema = new mongoose.Schema({
  leftItems: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
      images: { type: [String], default: [] }, // 🆕 Multiple images
    },
  ],
  rightItems: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
      images: { type: [String], default: [] }, // 🆕 Multiple images
    },
  ],
  correctMatches: {
    type: Object,
    required: true,
    default: {},
  },
});

// ✅ Main Question Schema
const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questionCode: { type: String, required: true },
    questionText: { type: String, required: true },

    // 🆕 Multiple question images
    questionImages: { type: [String], default: [] },

    questionType: {
      type: String,
      enum: ["radio", "checkbox", "truefalse", "matching"],
      default: "radio",
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
      required: true,
    },
    negativeMarks: {
      type: Number,
      default: 0,
      required: true,
    },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    tags: { type: [String], default: [] },

    // ✅ Options (radio / checkbox)
    options: { type: [optionSchema], default: [] },

    // ✅ Correct answers
    correctAnswers: { type: [String], default: [] },

    // ✅ Matching pairs (for matching type)
    matchingPairs: {
      type: matchingPairsSchema,
      required: function () {
        return this.questionType === "matching";
      },
      default: {
        leftItems: [],
        rightItems: [],
        correctMatches: {},
      },
    },

    isSample: { type: Boolean, default: false },
    explanation: { type: String },
    status: {
      type: String,
      enum: ["publish", "draft"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate question codes under same exam
questionSchema.index({ examId: 1, questionCode: 1 }, { unique: true });

// ✅ Safe export for Next.js
const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;
