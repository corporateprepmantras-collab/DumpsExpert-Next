import mongoose, { Schema } from "mongoose";

const trendingCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    redirectLink: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Delete the old model to force refresh
if (mongoose.models.TrendingCategory) {
  delete mongoose.models.TrendingCategory;
}

const TrendingCategory = mongoose.model(
  "TrendingCategory",
  trendingCategorySchema,
);

export default TrendingCategory;
