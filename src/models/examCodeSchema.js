import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eachQuestionMark: { type: Number },
    duration: { type: Number, required: true },
    sampleDuration: { type: Number },
    passingScore: { type: Number },
    code: { type: String, unique: true },
    numberOfQuestions: { type: Number, required: true },
    priceUSD: { type: Number },
    priceINR: { type: Number },
    mrpUSD: { type: Number },
    mrpINR: { type: Number },
    status: {
      type: String,
      enum: ["unpublished", "published"],
      required: true,
    },
    mainInstructions: { type: String },
    sampleInstructions: { type: String },
    lastUpdatedBy: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // courseId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Course",
    //   required: true,
    // },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError in Next.js dev environment
const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;
