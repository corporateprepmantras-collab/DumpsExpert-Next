// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // This enables populate() to fetch Product details
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Publish", "Unpublish", "Pending"], // Added "Pending" for consistency
      default: "Unpublish",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Add index for faster queries
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
