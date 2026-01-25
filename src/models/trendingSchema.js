import mongoose, { Schema } from "mongoose";

const trendingSchema = new Schema(
  {
    title: {
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
