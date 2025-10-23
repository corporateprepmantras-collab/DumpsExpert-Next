import mongoose, { Schema } from "mongoose";

const trendingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Trending =
  mongoose.models.Trending || mongoose.model("Trending", trendingSchema);

export default Trending;
