import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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
    examCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: false,
    },
    // courseId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Course",
    //   required: true,
    // },
  },
  { timestamps: true, strict: false },
);

// ✅ Delete cached model to ensure schema updates are applied
if (mongoose.models.Exam) {
  delete mongoose.models.Exam;
}

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
