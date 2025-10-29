import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examCode: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    percentage: { type: Number, required: true },
    duration: { type: Number, required: true }, // in seconds
    completedAt: { type: Date, default: Date.now },
    userAnswers: { type: Object, default: {} },
    questions: { type: Array, default: [] },

    // ✅ Add this field
    attempt: { type: Number, required: true },
  },
  { timestamps: true }
);

// ✅ Unique index: same student + examCode + attempt cannot repeat
resultSchema.index({ studentId: 1, examCode: 1, attempt: 1 }, { unique: true });

export default mongoose.models.Result ||
  mongoose.model("Result", resultSchema);
