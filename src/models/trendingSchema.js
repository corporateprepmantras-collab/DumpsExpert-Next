import mongoose, { Schema } from "mongoose";

const trendingSchema = new Schema(
  {
    categoryId: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Delete the old model to force refresh
if (mongoose.models.Trending) {
  delete mongoose.models.Trending;
}

const Trending = mongoose.model("Trending", trendingSchema);

export default Trending;
