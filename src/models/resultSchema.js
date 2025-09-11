import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examCode: { type: String }, // slug/code
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    percentage: { type: Number, required: true },
    duration: { type: Number, required: true }, // in seconds
    completedAt: { type: Date, default: Date.now },
    userAnswers: { type: Object, default: {} },
    questions: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Result ||
  mongoose.model("Result", resultSchema);
