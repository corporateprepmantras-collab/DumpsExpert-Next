import mongoose, { Schema } from "mongoose";

const trendingProductSchema = new Schema(
  {
    trendingCategoryId: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
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
if (mongoose.models.TrendingProduct) {
  delete mongoose.models.TrendingProduct;
}

const TrendingProduct = mongoose.model(
  "TrendingProduct",
  trendingProductSchema,
);

export default TrendingProduct;
