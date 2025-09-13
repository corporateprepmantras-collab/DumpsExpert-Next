// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ["Publish", "Unpublish"],
      default: "Unpublish",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
