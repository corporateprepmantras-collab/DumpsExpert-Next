import mongoose from "mongoose";

const permalinkSchema = new mongoose.Schema(
  {
    pageName: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Permalink ||
  mongoose.model("Permalink", permalinkSchema);
