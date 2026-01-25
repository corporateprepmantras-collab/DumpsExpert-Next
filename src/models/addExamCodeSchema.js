const mongoose = require("mongoose");

const addExamCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    durationInMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    sampleDurationInMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
    },
    exam: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    priceUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    priceINR: {
      type: Number,
      required: true,
      min: 0,
    },
    instructionMainExam: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sampleExam: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["unpublish", "publish"],
      required: true,
      default: "unpublish",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ✅ Prevent OverwriteModelError in Next.js dev environment
module.exports =
  mongoose.models.AddExamCode ||
  mongoose.model("AddExamCode", addExamCodeSchema);
